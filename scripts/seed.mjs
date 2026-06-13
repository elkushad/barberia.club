import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

// Credenciales tomadas de variables de entorno; los valores por defecto son
// solo para desarrollo local. En producción define SEED_ADMIN_PASSWORD y
// SEED_OWNER_PASSWORD (y cámbialas tras el primer acceso).
const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@barberia.club';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'changeme-admin';
const ownerEmail = process.env.SEED_OWNER_EMAIL || 'owner@demo.com';
const ownerPassword = process.env.SEED_OWNER_PASSWORD || 'changeme-owner';

async function main() {
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminHash, role: 'ADMIN' },
    create: {
      name: 'Admin General',
      email: adminEmail,
      password: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin listo: ${adminEmail}`);

  const ownerHash = await bcrypt.hash(ownerPassword, 10);
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { password: ownerHash },
    create: {
      name: 'Dueño Demo',
      email: ownerEmail,
      password: ownerHash,
      role: 'OWNER',
    },
  });
  console.log(`Dueño demo listo: ${ownerEmail}`);

  const existingBarbershop = await prisma.barbershop.findUnique({ where: { slug: 'demo' } });
  if (!existingBarbershop) {
    await prisma.barbershop.create({
      data: {
        slug: 'demo',
        name: 'Demo Barbershop',
        ownerId: owner.id,
        description: 'La mejor barbería de la ciudad.',
        brandColor: '#1d4ed8',
      },
    });
    console.log('Barbería demo creada (slug: demo)');
  }

  if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_OWNER_PASSWORD) {
    console.warn(
      '\n⚠  Se usaron contraseñas por defecto. Define SEED_ADMIN_PASSWORD y ' +
      'SEED_OWNER_PASSWORD antes de sembrar en cualquier entorno real.'
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
