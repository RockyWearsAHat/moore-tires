/**
 * Seed script — populates dev/staging MongoDB with realistic test data
 * covering every user persona, the wholesale account graph, the tire
 * catalog, pricing tiers, customer inventory, and operational records.
 *
 * Run: pnpm --filter @moore-tires/db seed
 *
 * After this runs, the credentials documented in TEST_ACCOUNTS.md become
 * valid against the API. The script is idempotent — it deletes existing
 * data first so re-running yields the same state.
 */
// Load env: prefer .env.local (developer overrides) over .env (e.g. Atlas
// production URI). Walks up to the repo root so seeding works from any cwd.
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
for (const p of [
  resolve(cwd, '.env.local'),
  resolve(cwd, '../../.env.local'),
  resolve(cwd, '.env'),
  resolve(cwd, '../../.env'),
]) {
  if (existsSync(p)) loadEnv({ path: p });
}

import bcrypt from 'bcryptjs';
import {
  connectDb,
  disconnectDb,
  Customer,
  Vehicle,
  Technician,
  ServiceRequest,
  User,
  WholesaleAccount,
  StoreLocation,
  PricingTier,
  TireProduct,
  CustomerInventory,
  DistributionCenter,
  Order,
  RefreshToken,
} from './index.js';

const BCRYPT_ROUNDS = 10; // lower than prod's 12 to make seeding fast

const COMMON_PASSWORD = 'MooreTires!2026';

async function seed(): Promise<void> {
  await connectDb();
  console.warn('🌱 Seeding Moore Tires database...');

  // ── Clear everything (safe in dev only) ────────────────────────────────────
  await Promise.all([
    Customer.deleteMany({}),
    Vehicle.deleteMany({}),
    Technician.deleteMany({}),
    ServiceRequest.deleteMany({}),
    User.deleteMany({}),
    WholesaleAccount.deleteMany({}),
    StoreLocation.deleteMany({}),
    PricingTier.deleteMany({}),
    TireProduct.deleteMany({}),
    CustomerInventory.deleteMany({}),
    DistributionCenter.deleteMany({}),
    Order.deleteMany({}),
    RefreshToken.deleteMany({}),
  ]);
  console.warn('   cleared existing collections');

  // ── Distribution centers ────────────────────────────────────────────────────
  const centers = await DistributionCenter.insertMany([
    {
      name: 'Pacific Northwest Hub',
      state: 'WA',
      address: '4500 Industrial Way',
      city: 'Tacoma',
      zip: '98421',
      coordinates: { lat: 47.2529, lng: -122.4443 },
    },
    {
      name: 'Texas Central Yard',
      state: 'TX',
      address: '12100 East Loop',
      city: 'Dallas',
      zip: '75217',
      coordinates: { lat: 32.7287, lng: -96.6772 },
    },
    {
      name: 'Memphis Distribution',
      state: 'TN',
      address: '3990 Lamar Ave',
      city: 'Memphis',
      zip: '38118',
      coordinates: { lat: 35.0676, lng: -89.9712 },
    },
  ]);

  // ── Pricing tiers ──────────────────────────────────────────────────────────
  const [silverTier, goldTier, platinumTier] = await PricingTier.insertMany([
    { name: 'Silver', defaultDiscountPercent: 8, description: 'Volume buyers and small fleets' },
    { name: 'Gold', defaultDiscountPercent: 14, description: 'Mid-tier wholesale partners' },
    { name: 'Platinum', defaultDiscountPercent: 22, description: 'Strategic high-volume accounts' },
  ]);

  // ── Tire catalog ───────────────────────────────────────────────────────────
  const tireSeed = [
    { brand: 'Goodyear', tireModel: 'G622 RSD', width: 10, ar: 0, rim: 22.5, type: 'COMMERCIAL', price: 612.5 },
    { brand: 'Goodyear', tireModel: 'G283A', width: 12, ar: 0, rim: 22.5, type: 'COMMERCIAL', price: 689.0 },
    { brand: 'Goodyear', tireModel: 'G159 Endurance', width: 315, ar: 80, rim: 22.5, type: 'COMMERCIAL', price: 728.4 },
    { brand: 'Goodyear', tireModel: 'G622 LHD', width: 11, ar: 0, rim: 24.5, type: 'COMMERCIAL', price: 645.9 },
    { brand: 'Michelin', tireModel: 'XZE2+', width: 295, ar: 75, rim: 22.5, type: 'COMMERCIAL', price: 794.25 },
    { brand: 'Michelin', tireModel: 'XDS2', width: 11, ar: 0, rim: 22.5, type: 'COMMERCIAL', price: 712.0 },
    { brand: 'Bridgestone', tireModel: 'R268 Ecopia', width: 295, ar: 75, rim: 22.5, type: 'COMMERCIAL', price: 738.0 },
    { brand: 'Bridgestone', tireModel: 'M711 Ecopia', width: 11, ar: 0, rim: 24.5, type: 'COMMERCIAL', price: 681.5 },
    { brand: 'Continental', tireModel: 'HSR2', width: 295, ar: 75, rim: 22.5, type: 'COMMERCIAL', price: 705.75 },
    { brand: 'Continental', tireModel: 'HDR2', width: 11, ar: 0, rim: 22.5, type: 'COMMERCIAL', price: 698.0 },
    { brand: 'Yokohama', tireModel: 'TY517', width: 11, ar: 0, rim: 22.5, type: 'COMMERCIAL', price: 567.25 },
    { brand: 'Toyo', tireModel: 'Open Country A/T III', width: 265, ar: 70, rim: 17, type: 'ALL_TERRAIN', price: 251.0 },
    { brand: 'BFGoodrich', tireModel: 'KO2', width: 275, ar: 70, rim: 18, type: 'ALL_TERRAIN', price: 309.5 },
    { brand: 'Cooper', tireModel: 'Discoverer AT3', width: 265, ar: 70, rim: 17, type: 'ALL_TERRAIN', price: 218.75 },
    { brand: 'Michelin', tireModel: 'Defender LTX M/S', width: 275, ar: 65, rim: 18, type: 'HIGHWAY', price: 286.0 },
    { brand: 'Bridgestone', tireModel: 'Blizzak DM-V2', width: 245, ar: 65, rim: 17, type: 'WINTER', price: 232.4 },
  ];
  const products = await TireProduct.insertMany(
    tireSeed.map((t) => ({
      brand: t.brand,
      tireModel: t.tireModel,
      size: { width: t.width, aspectRatio: t.ar, rimDiameter: t.rim, construction: 'R' },
      formattedSize:
        t.ar > 0 ? `${t.width}/${t.ar}R${t.rim}` : `${t.width}R${t.rim}`,
      type: t.type,
      loadIndex: '',
      speedRating: '',
      baseRetailPrice: t.price,
      images: [],
      specifications: {},
      isActive: true,
    }))
  );
  console.warn(`   tire catalog: ${products.length} SKUs`);

  // ── Wholesale accounts + locations ─────────────────────────────────────────
  const acme = await WholesaleAccount.create({
    companyName: 'Acme Construction Co.',
    contactEmail: 'ap@acmeconstruction.test',
    contactPhone: '+15551110001',
    paymentTerms: 'NET_30',
    pricingTierId: platinumTier!._id,
    billingAddress: {
      street: '110 Industrial Way',
      city: 'Tacoma',
      state: 'WA',
      zip: '98421',
    },
  });

  const buildpro = await WholesaleAccount.create({
    companyName: 'BuildPro Logistics',
    contactEmail: 'billing@buildpro.test',
    contactPhone: '+15551110002',
    paymentTerms: 'NET_15',
    pricingTierId: goldTier!._id,
    billingAddress: {
      street: '8800 Trade Center Dr',
      city: 'Dallas',
      state: 'TX',
      zip: '75217',
    },
  });

  await WholesaleAccount.create({
    companyName: 'Pioneer Materials',
    contactEmail: 'accounts@pioneermaterials.test',
    contactPhone: '+15551110003',
    paymentTerms: 'PREPAID',
    pricingTierId: silverTier!._id,
    billingAddress: {
      street: '2200 Aggregate Rd',
      city: 'Memphis',
      state: 'TN',
      zip: '38118',
    },
  });

  const [acmeHQ, acmeNorth] = await StoreLocation.insertMany([
    {
      wholesaleAccountId: acme._id,
      name: 'Acme HQ - Main Yard',
      address: '110 Industrial Way',
      city: 'Tacoma',
      state: 'WA',
      zip: '98421',
      coordinates: { lat: 47.255, lng: -122.443 },
      contactPhone: '+15551110011',
    },
    {
      wholesaleAccountId: acme._id,
      name: 'Acme Site - North',
      address: '4900 N Yard Ln',
      city: 'Seattle',
      state: 'WA',
      zip: '98103',
      coordinates: { lat: 47.667, lng: -122.345 },
    },
    {
      wholesaleAccountId: acme._id,
      name: 'Acme Site - South',
      address: '700 S Operations Dr',
      city: 'Olympia',
      state: 'WA',
      zip: '98501',
      coordinates: { lat: 47.038, lng: -122.901 },
    },
  ]);

  const [buildproYard] = await StoreLocation.insertMany([
    {
      wholesaleAccountId: buildpro._id,
      name: 'BuildPro Yard - South',
      address: '8800 Trade Center Dr',
      city: 'Dallas',
      state: 'TX',
      zip: '75217',
      coordinates: { lat: 32.7287, lng: -96.6772 },
    },
  ]);

  // ── Users (one per role + a couple of extras) ──────────────────────────────
  const passwordHash = await bcrypt.hash(COMMON_PASSWORD, BCRYPT_ROUNDS);

  const users = await User.insertMany([
    // Moore Tires staff
    {
      email: 'admin@mooretires.test',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Nguyen',
      role: 'admin',
      phone: '+15550000001',
      isActive: true,
    },
    {
      email: 'ops@mooretires.test',
      passwordHash,
      firstName: 'Chris',
      lastName: 'Romero',
      role: 'admin',
      phone: '+15550000002',
      isActive: true,
    },
    // Wholesale buyer-side district manager (Acme)
    {
      email: 'dm.acme@acmeconstruction.test',
      passwordHash,
      firstName: 'John',
      lastName: 'Davis',
      role: 'district_manager',
      wholesaleAccountId: acme._id,
      phone: '+15551110100',
      isActive: true,
    },
    // Store employees (Acme HQ + Acme North + BuildPro)
    {
      email: 'employee.hq@acmeconstruction.test',
      passwordHash,
      firstName: 'Maya',
      lastName: 'Patel',
      role: 'store_employee',
      wholesaleAccountId: acme._id,
      storeLocationId: acmeHQ!._id,
      phone: '+15551110200',
      isActive: true,
    },
    {
      email: 'employee.north@acmeconstruction.test',
      passwordHash,
      firstName: 'Diego',
      lastName: 'Martinez',
      role: 'store_employee',
      wholesaleAccountId: acme._id,
      storeLocationId: acmeNorth!._id,
      phone: '+15551110201',
      isActive: true,
    },
    {
      email: 'employee@buildpro.test',
      passwordHash,
      firstName: 'Maria',
      lastName: 'Rodriguez',
      role: 'store_employee',
      wholesaleAccountId: buildpro._id,
      storeLocationId: buildproYard!._id,
      phone: '+15551110202',
      isActive: true,
    },
    // Retail customer (self-registers normally — included for parity)
    {
      email: 'retail@example.test',
      passwordHash,
      firstName: 'Avery',
      lastName: 'Lopez',
      role: 'retail_customer',
      phone: '+15551112000',
      isActive: true,
    },
  ]);
  console.warn(`   users: ${users.length} (one per role + extras)`);

  // ── Operational test data — customers, vehicles, technicians, SRs ──────────
  const techs = await Technician.insertMany([
    {
      fullName: 'Marcus Webb',
      phone: '+15550001001',
      email: 'marcus@mooretires.test',
      capabilities: ['STANDARD', 'MOBILE'],
      territory: 'North',
    },
    {
      fullName: 'Destiny Reyes',
      phone: '+15550001002',
      email: 'destiny@mooretires.test',
      capabilities: ['STANDARD', 'COMMERCIAL', 'ALIGNMENT'],
      territory: 'South',
    },
    {
      fullName: 'Leon Park',
      phone: '+15550001003',
      email: 'leon@mooretires.test',
      capabilities: ['STANDARD', 'MOBILE', 'ALIGNMENT'],
      territory: 'East',
    },
  ]);

  const customers = await Customer.insertMany([
    { fullName: 'Alex Johnson', phone: '+15559001001', email: 'alex@example.test' },
    { fullName: 'Brianna Kim', phone: '+15559001002', email: 'brianna@example.test' },
    { fullName: 'Carlos Ruiz', phone: '+15559001003' },
  ]);

  const vehicles = await Vehicle.insertMany([
    { customerId: customers[0]!._id, year: 2019, make: 'Honda', vehicleModel: 'Civic', licensePlate: 'ABC1234' },
    { customerId: customers[1]!._id, year: 2021, make: 'Ford', vehicleModel: 'F-150', licensePlate: 'XYZ9876' },
    { customerId: customers[2]!._id, year: 2017, make: 'Toyota', vehicleModel: 'Camry', licensePlate: 'DEF5678' },
  ]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0]!;
  await ServiceRequest.insertMany([
    {
      customerId: customers[0]!._id,
      vehicleId: vehicles[0]!._id,
      serviceType: 'ROTATION',
      preferredDate: dateStr,
      preferredTimeWindow: 'MORNING',
      status: 'PENDING',
    },
    {
      customerId: customers[1]!._id,
      vehicleId: vehicles[1]!._id,
      serviceType: 'INSTALL',
      preferredDate: dateStr,
      preferredTimeWindow: 'AFTERNOON',
      notes: 'Need all-season set, 265/70R17',
      status: 'PENDING',
    },
    {
      customerId: customers[2]!._id,
      vehicleId: vehicles[2]!._id,
      serviceType: 'REPAIR',
      preferredDate: dateStr,
      preferredTimeWindow: 'EVENING',
      isMobileService: true,
      status: 'PENDING',
    },
  ]);

  // ── Customer inventory snapshots for Acme HQ ───────────────────────────────
  // Pick the first four commercial tires for the Acme HQ inventory dataset
  // matching the SKUs referenced in the dashboard mockup.
  const commercial = products.filter((p) => p.type === 'COMMERCIAL').slice(0, 4);
  await CustomerInventory.create({
    wholesaleAccountId: acme._id,
    storeLocationId: acmeHQ!._id,
    items: commercial.map((p, i) => ({
      productId: p._id,
      currentQuantity: [6, 8, 4, 7][i] ?? 5,
      reorderThreshold: 10,
      targetQuantity: 40,
      autoReorder: i === 0,
    })),
    lastUploadedAt: new Date(),
  });

  // ── Recent orders for Acme so the customer dashboard has content ───────────
  const acmeBuyer = users.find((u) => u.email === 'dm.acme@acmeconstruction.test');
  if (acmeBuyer) {
    const [pA, pB, pC] = commercial;
    if (pA && pB && pC) {
      const orderShipping = {
        street: '110 Industrial Way',
        city: 'Tacoma',
        state: 'WA',
        zip: '98421',
      };
      await Order.insertMany([
        {
          userId: acmeBuyer._id,
          wholesaleAccountId: acme._id,
          storeLocationId: acmeHQ!._id,
          items: [
            { productId: pA._id, quantity: 8, unitPrice: pA.baseRetailPrice * 0.78, lineTotal: 8 * pA.baseRetailPrice * 0.78 },
            { productId: pB._id, quantity: 4, unitPrice: pB.baseRetailPrice * 0.78, lineTotal: 4 * pB.baseRetailPrice * 0.78 },
          ],
          status: 'SHIPPED',
          shippingAddress: orderShipping,
          distributionCenter: 'WA',
          subtotal: 8 * pA.baseRetailPrice * 0.78 + 4 * pB.baseRetailPrice * 0.78,
          taxAmount: 0,
          shippingCost: 145,
          total: 8 * pA.baseRetailPrice * 0.78 + 4 * pB.baseRetailPrice * 0.78 + 145,
          paymentMethod: 'INVOICE',
          trackingNumber: 'MT-SHIP-248731',
        },
        {
          userId: acmeBuyer._id,
          wholesaleAccountId: acme._id,
          storeLocationId: acmeHQ!._id,
          items: [
            { productId: pC._id, quantity: 6, unitPrice: pC.baseRetailPrice * 0.78, lineTotal: 6 * pC.baseRetailPrice * 0.78 },
          ],
          status: 'PROCESSING',
          shippingAddress: orderShipping,
          distributionCenter: 'WA',
          subtotal: 6 * pC.baseRetailPrice * 0.78,
          taxAmount: 0,
          shippingCost: 145,
          total: 6 * pC.baseRetailPrice * 0.78 + 145,
          paymentMethod: 'INVOICE',
        },
      ]);
    }
  }

  console.warn(`✅ Seeded:`);
  console.warn(`   ${centers.length} distribution centers`);
  console.warn(`   3 pricing tiers / ${products.length} tire SKUs`);
  console.warn(`   3 wholesale accounts / 4 store locations`);
  console.warn(`   ${users.length} users (admin x2, district_manager, store_employee x3, retail_customer)`);
  console.warn(`   ${techs.length} technicians, ${customers.length} customers, ${vehicles.length} vehicles, 3 service requests`);
  console.warn(`   2 orders for Acme dashboard demo`);
  console.warn('');
  console.warn('🔐 Common password for every seeded user: ' + COMMON_PASSWORD);
  console.warn('   See TEST_ACCOUNTS.md for the full credential list.');

  await disconnectDb();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
