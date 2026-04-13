import { CustomerInventory } from '@moore-tires/db';
import type { ICustomerInventory } from '@moore-tires/db';
import type {
  InventoryUploadInput,
  UpdateInventoryItemInput,
  JwtPayload,
} from '@moore-tires/shared';
import { AppError } from '../errors.js';

function getInventoryFilter(user: JwtPayload) {
  if (!user.wholesaleAccountId) {
    throw AppError.forbidden('Inventory management is only available for wholesale accounts');
  }
  const filter: Record<string, unknown> = {
    wholesaleAccountId: user.wholesaleAccountId,
  };
  if (user.storeLocationId) {
    filter['storeLocationId'] = user.storeLocationId;
  }
  return filter;
}

export async function getInventory(user: JwtPayload): Promise<ICustomerInventory | null> {
  const filter = getInventoryFilter(user);
  return CustomerInventory.findOne(filter).populate('items.productId');
}

export async function uploadInventory(
  input: InventoryUploadInput,
  user: JwtPayload
): Promise<ICustomerInventory> {
  const filter = getInventoryFilter(user);

  const inventory = await CustomerInventory.findOneAndUpdate(
    filter,
    {
      ...filter,
      items: input.items,
      lastUploadedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true }
  );

  return inventory;
}

export async function updateInventoryItem(
  productId: string,
  input: UpdateInventoryItemInput,
  user: JwtPayload
): Promise<ICustomerInventory> {
  const filter = getInventoryFilter(user);
  const inventory = await CustomerInventory.findOne(filter);
  if (!inventory) throw AppError.notFound('Inventory not found');

  const item = inventory.items.find((i) => i.productId.toString() === productId);
  if (!item) throw AppError.notFound('Product not found in inventory');

  if (input.currentQuantity !== undefined) item.currentQuantity = input.currentQuantity;
  if (input.reorderThreshold !== undefined) item.reorderThreshold = input.reorderThreshold;
  if (input.targetQuantity !== undefined) item.targetQuantity = input.targetQuantity;
  if (input.autoReorder !== undefined) item.autoReorder = input.autoReorder;

  await inventory.save();
  return inventory;
}

export async function getLowStockAlerts(user: JwtPayload) {
  const inventory = await getInventory(user);
  if (!inventory) return [];

  return inventory.items
    .filter((item) => item.currentQuantity <= item.reorderThreshold)
    .map((item) => ({
      productId: item.productId,
      currentQuantity: item.currentQuantity,
      reorderThreshold: item.reorderThreshold,
      targetQuantity: item.targetQuantity,
      deficit: item.targetQuantity - item.currentQuantity,
      autoReorder: item.autoReorder,
    }));
}
