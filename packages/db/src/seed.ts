/**
 * Seed script — populates dev/staging MongoDB with realistic test data.
 * Run: pnpm --filter @moore-tires/db seed
 */
import 'dotenv/config';
import { connectDb, disconnectDb, Customer, Vehicle, Technician, ServiceRequest } from './index.js';

async function seed(): Promise<void> {
  await connectDb();
  console.warn('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([
    Customer.deleteMany({}),
    Vehicle.deleteMany({}),
    Technician.deleteMany({}),
    ServiceRequest.deleteMany({}),
  ]);

  // Technicians
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

  // Customers
  const customers = await Customer.insertMany([
    { fullName: 'Alex Johnson', phone: '+15559001001', email: 'alex@example.test' },
    { fullName: 'Brianna Kim', phone: '+15559001002', email: 'brianna@example.test' },
    { fullName: 'Carlos Ruiz', phone: '+15559001003' },
  ]);

  // Vehicles
  const vehicles = await Vehicle.insertMany([
    { customerId: customers[0]!._id, year: 2019, make: 'Honda', model: 'Civic', licensePlate: 'ABC1234' },
    { customerId: customers[1]!._id, year: 2021, make: 'Ford', model: 'F-150', licensePlate: 'XYZ9876' },
    { customerId: customers[2]!._id, year: 2017, make: 'Toyota', model: 'Camry', licensePlate: 'DEF5678' },
  ]);

  // Service Requests
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

  console.warn(`✅ Seeded: 3 technicians, 3 customers, 3 vehicles, 3 service requests`);
  console.warn(`   Technician IDs: ${techs.map((t) => String(t._id)).join(', ')}`);

  await disconnectDb();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
