import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const RegisterSchema = z.object({
  barberName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(6).max(200),
});

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
    if (!rateLimit(`register:${clientIp(req)}`, 5, 60_000)) {
      return NextResponse.json({ error: 'Demasiados intentos. Intenta más tarde.' }, { status: 429 });
    }

    const parsed = RegisterSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const { barberName, email, password } = parsed.data;

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
