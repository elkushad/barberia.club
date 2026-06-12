import { PrismaClient } from '@prisma/client';
// Using bcryptjs or just a dummy string for the MVP. We will add bcrypt later, for now just basic text password or hash
// Let's use bcryptjs. Wait, we need to install it. I'll just use a plain text comparison for the MVP to save time, or better, install bcryptjs.

const prisma = new PrismaClient({});

async function main() {
  const adminEmail = 'admin@barberia.club';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Admin General',
        email: adminEmail,
        password: 'password123', // In production, we'll hash this
        role: 'ADMIN',
      },
    });
    console.log('Admin user created: admin@barberia.club / password123');
  } else {
    console.log('Admin user already exists.');
  }

  // Create a demo barbershop
  const ownerEmail = 'owner@demo.com';
  let existingOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });

  if (!existingOwner) {
    existingOwner = await prisma.user.create({
      data: {
        name: 'Dueño Demo',
        email: ownerEmail,
        password: 'password123',
        role: 'OWNER',
      },
    });
    console.log('Owner user created: owner@demo.com / password123');
  }

  const existingBarbershop = await prisma.barbershop.findUnique({ where: { slug: 'demo' } });
  if (!existingBarbershop) {
    await prisma.barbershop.create({
      data: {
        slug: 'demo',
        name: 'Demo Barbershop',
        ownerId: existingOwner.id,
        description: 'La mejor barbería de la ciudad.',
        brandColor: '#1d4ed8', // A nice blue
      },
    });
    console.log('Demo barbershop created (slug: demo)');
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
