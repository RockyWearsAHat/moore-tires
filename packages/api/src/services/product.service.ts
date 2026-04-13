import { TireProduct, PricingTier, PriceOverride } from '@moore-tires/db';
import type {
  CreateTireProductInput,
  TireProductSearchInput,
  CreatePricingTierInput,
  CreatePriceOverrideInput,
  JwtPayload,
} from '@moore-tires/shared';
import { calculateTierPrice } from '@moore-tires/shared';
import { AppError } from '../errors.js';

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(input: CreateTireProductInput) {
  return TireProduct.create(input);
}

export async function updateProduct(id: string, input: Partial<CreateTireProductInput>) {
  const product = await TireProduct.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

export async function getProductById(id: string) {
  const product = await TireProduct.findById(id);
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

export async function searchProducts(input: TireProductSearchInput) {
  const filter: Record<string, unknown> = { isActive: true };

  if (input.type) filter['type'] = input.type;
  if (input.brand) filter['brand'] = new RegExp(input.brand, 'i');
  if (input.size) filter['formattedSize'] = new RegExp(input.size, 'i');
  if (input.minPrice || input.maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (input.minPrice) priceFilter['$gte'] = input.minPrice;
    if (input.maxPrice) priceFilter['$lte'] = input.maxPrice;
    filter['baseRetailPrice'] = priceFilter;
  }
  if (input.search) {
    filter['$or'] = [
      { brand: new RegExp(input.search, 'i') },
      { tireModel: new RegExp(input.search, 'i') },
      { formattedSize: new RegExp(input.search, 'i') },
    ];
  }

  const skip = (input.page - 1) * input.limit;
  const [items, total] = await Promise.all([
    TireProduct.find(filter).sort({ brand: 1, tireModel: 1 }).skip(skip).limit(input.limit),
    TireProduct.countDocuments(filter),
  ]);

  return { items, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
}

export async function softDeleteProduct(id: string) {
  const product = await TireProduct.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) throw AppError.notFound('Product not found');
  return product;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

export async function createPricingTier(input: CreatePricingTierInput) {
  return PricingTier.create(input);
}

export async function listPricingTiers() {
  return PricingTier.find({ isActive: true }).sort({ name: 1 });
}

export async function updatePricingTier(id: string, input: Partial<CreatePricingTierInput>) {
  const tier = await PricingTier.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!tier) throw AppError.notFound('Pricing tier not found');
  return tier;
}

export async function createPriceOverride(input: CreatePriceOverrideInput) {
  const existing = await PriceOverride.findOne({ tierId: input.tierId, productId: input.productId });
  if (existing) {
    existing.overridePrice = input.overridePrice;
    await existing.save();
    return existing;
  }
  return PriceOverride.create(input);
}

export async function listPriceOverrides(tierId: string) {
  return PriceOverride.find({ tierId }).populate('productId');
}

/**
 * Get the effective price for a product given the authenticated user's tier.
 * Public users see baseRetailPrice; wholesale users see their negotiated price.
 */
export async function getEffectivePrice(
  productId: string,
  user?: JwtPayload
) {
  const product = await TireProduct.findById(productId);
  if (!product || !product.isActive) throw AppError.notFound('Product not found');

  // No user or retail customer → base price
  if (!user || !user.wholesaleAccountId) {
    return { price: product.baseRetailPrice, tierName: 'Retail' };
  }

  // Look up the account's pricing tier
  const { WholesaleAccount } = await import('@moore-tires/db');
  const account = await WholesaleAccount.findById(user.wholesaleAccountId);
  if (!account?.pricingTierId) {
    return { price: product.baseRetailPrice, tierName: 'Retail' };
  }

  const tier = await PricingTier.findById(account.pricingTierId);
  if (!tier) {
    return { price: product.baseRetailPrice, tierName: 'Retail' };
  }

  // Check for a product-specific override
  const override = await PriceOverride.findOne({
    tierId: tier._id,
    productId: product._id,
  });

  const price = calculateTierPrice(
    product.baseRetailPrice,
    tier.defaultDiscountPercent,
    override?.overridePrice
  );

  return { price, tierName: tier.name };
}
