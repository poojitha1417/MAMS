const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.transaction.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();
  await prisma.base.deleteMany();

  console.log('Seeding Bases...');
  const baseAlpha = await prisma.base.create({
    data: { name: 'Base Alpha', location: 'Northern Sector' }
  });
  const baseBravo = await prisma.base.create({
    data: { name: 'Base Bravo', location: 'Southern Sector' }
  });
  const baseCharlie = await prisma.base.create({
    data: { name: 'Base Charlie', location: 'Eastern Sector' }
  });

  console.log('Seeding Assets...');
  const tank = await prisma.asset.create({
    data: { name: 'M1A2 Abrams Tank', type: 'VEHICLE', description: 'Main Battle Tank' }
  });
  const humvee = await prisma.asset.create({
    data: { name: 'Humvee', type: 'VEHICLE', description: 'Light Tactical Vehicle' }
  });
  const rifle = await prisma.asset.create({
    data: { name: 'M4 Carbine', type: 'WEAPON', description: 'Standard Issue Rifle' }
  });
  const ammo = await prisma.asset.create({
    data: { name: '5.56mm Rounds Box', type: 'AMMUNITION', description: '1000 rounds per box' }
  });

  console.log('Seeding Users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cdrPassword = await bcrypt.hash('cdr123', 10);
  const logPassword = await bcrypt.hash('log123', 10);

  // Admin User
  const admin = await prisma.user.create({
    data: { username: 'admin', passwordHash: adminPassword, role: 'ADMIN' }
  });

  // Base Commander for Base Alpha
  const commander = await prisma.user.create({
    data: { username: 'commander_alpha', passwordHash: cdrPassword, role: 'COMMANDER', baseId: baseAlpha.id }
  });

  // Logistics Officer for Base Bravo
  const logistics = await prisma.user.create({
    data: { username: 'logistics_bravo', passwordHash: logPassword, role: 'LOGISTICS', baseId: baseBravo.id }
  });

  console.log('Seeding Transactions...');
  // Initial Purchase for Alpha
  await prisma.transaction.create({
    data: {
      assetId: tank.id,
      toBaseId: baseAlpha.id,
      type: 'PURCHASE',
      quantity: 10,
      reference: 'PO-001',
      userId: admin.id
    }
  });

  // Transfer Alpha -> Bravo
  await prisma.transaction.create({
    data: {
      assetId: rifle.id,
      toBaseId: baseAlpha.id,
      type: 'PURCHASE',
      quantity: 50,
      reference: 'PO-002',
      userId: admin.id
    }
  });

  await prisma.transaction.create({
    data: {
      assetId: rifle.id,
      fromBaseId: baseAlpha.id,
      toBaseId: baseBravo.id,
      type: 'TRANSFER',
      quantity: 20,
      reference: 'TR-101',
      userId: commander.id
    }
  });

  // Expenditure at Alpha
  await prisma.transaction.create({
    data: {
      assetId: ammo.id,
      toBaseId: baseAlpha.id,
      type: 'PURCHASE',
      quantity: 100,
      reference: 'PO-003',
      userId: admin.id
    }
  });

  await prisma.transaction.create({
    data: {
      assetId: ammo.id,
      fromBaseId: baseAlpha.id,
      type: 'EXPEND',
      quantity: 30,
      reference: 'EX-501',
      userId: commander.id
    }
  });

  console.log('Seeding Complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
