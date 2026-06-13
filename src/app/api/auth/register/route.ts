import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .trim()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // replace multiple hyphens with single hyphen
}

export async function POST(req: Request) {
  try {
    const { barberName, email, password } = await req.json();

    if (!barberName || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está en uso' }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = generateSlug(barberName);
    if (!baseSlug) baseSlug = 'barberia';
    
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingShop = await prisma.barbershop.findUnique({
        where: { slug },
      });
      if (!existingShop) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Hashear la contraseña antes de guardarla (nunca en texto plano)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User and Barbershop
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'OWNER',
        name: barberName, // use barberName as default owner name
        barbershops: {
          create: {
            name: barberName,
            slug,
          }
        }
      },
    });

    return NextResponse.json({ success: true, message: 'Barbería registrada exitosamente' }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
