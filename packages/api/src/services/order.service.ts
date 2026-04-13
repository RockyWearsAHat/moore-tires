import { Order, TireProduct, WholesaleAccount } from '@moore-tires/db';
import type { IOrder } from '@moore-tires/db';
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  JwtPayload,
} from '@moore-tires/shared';
import { AppError } from '../errors.js';
import { getEffectivePrice } from './product.service.js';

export async function createOrder(
  input: CreateOrderInput,
  user: JwtPayload
): Promise<IOrder> {
  // Resolve prices for each item
  const resolvedItems = await Promise.all(
    input.items.map(async (item) => {
      const product = await TireProduct.findById(item.productId);
      if (!product || !product.isActive) {
        throw AppError.notFound(`Product ${item.productId} not found or inactive`);
      }
      const { price } = await getEffectivePrice(item.productId, user);
      return {
        productId: product._id,
        quantity: item.quantity,
        unitPrice: price,
        lineTotal: Math.round(price * item.quantity * 100) / 100,
      };
    })
  );

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = 0; // TODO: tax calculation
  const shippingCost = 0; // TODO: shipping calculation
  const total = Math.round((subtotal + taxAmount + shippingCost) * 100) / 100;

  // Determine payment method for wholesale
  let paymentMethod = input.paymentMethod;
  if (user.wholesaleAccountId && paymentMethod === 'CARD') {
    const account = await WholesaleAccount.findById(user.wholesaleAccountId);
    if (account && account.paymentTerms !== 'PREPAID') {
      paymentMethod = 'INVOICE';
    }
  }

  const order = await Order.create({
    userId: user.userId,
    wholesaleAccountId: user.wholesaleAccountId,
    storeLocationId: user.storeLocationId,
    items: resolvedItems,
    status: 'SUBMITTED',
    shippingAddress: input.shippingAddress,
    distributionCenter: 'WA',
    subtotal,
    taxAmount,
    shippingCost,
    total,
    paymentMethod,
    notes: input.notes,
  });

  return order;
}

export async function listOrders(
  user: JwtPayload,
  page = 1,
  limit = 20
) {
  const filter: Record<string, unknown> = {};

  switch (user.role) {
    case 'admin':
      break;
    case 'district_manager':
      filter['wholesaleAccountId'] = user.wholesaleAccountId;
      break;
    case 'store_employee':
      filter['storeLocationId'] = user.storeLocationId;
      break;
    default:
      filter['userId'] = user.userId;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.productId'),
    Order.countDocuments(filter),
  ]);

  return { items, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getOrderById(id: string, user: JwtPayload): Promise<IOrder> {
  const order = await Order.findById(id).populate('items.productId');
  if (!order) throw AppError.notFound('Order not found');

  // RBAC scoping
  if (user.role === 'admin') return order;
  if (
    user.role === 'district_manager' &&
    order.wholesaleAccountId?.toString() === user.wholesaleAccountId
  ) return order;
  if (
    user.role === 'store_employee' &&
    order.storeLocationId?.toString() === user.storeLocationId
  ) return order;
  if (order.userId.toString() === user.userId) return order;

  throw AppError.forbidden('You do not have access to this order');
}

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
  user: JwtPayload
): Promise<IOrder> {
  if (user.role !== 'admin' && user.role !== 'district_manager') {
    throw AppError.forbidden('Only admin or district managers can update order status');
  }

  const update: Record<string, unknown> = { status: input.status };
  if (input.trackingNumber) update['trackingNumber'] = input.trackingNumber;
  if (input.notes) update['notes'] = input.notes;

  const order = await Order.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!order) throw AppError.notFound('Order not found');
  return order;
}

export async function cancelOrder(id: string, user: JwtPayload): Promise<IOrder> {
  const order = await Order.findById(id);
  if (!order) throw AppError.notFound('Order not found');

  // Only admin or order owner can cancel, and only before SHIPPED
  const isOwner = order.userId.toString() === user.userId;
  if (user.role !== 'admin' && !isOwner) {
    throw AppError.forbidden('You cannot cancel this order');
  }

  const cancellable: string[] = ['CART', 'SUBMITTED', 'CONFIRMED', 'PROCESSING'];
  if (!cancellable.includes(order.status)) {
    throw AppError.badRequest('Order cannot be cancelled in its current status');
  }

  order.status = 'CANCELLED';
  await order.save();
  return order;
}
