import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { generateUniqueReferralCode, linkReferral, audit } from '@/lib/referrals';

const RegisterSchema = z.object({
  barberName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  password: z.string().min(6).max(200),
  whatsapp: z.string().trim().min(5).max(30),
  ref: z.string().trim().max(20).optional(),
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
    const { barberName, email, password, whatsapp, ref } = parsed.data;

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

    // Cada barbería nace con su propio código de referido único.
    const referralCode = await generateUniqueReferralCode();

    // Create User and Barbershop
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'OWNER',
        name: barberName, // use barberName as default owner name
        barbershops: {
          create: {
            name: barberName,
            slug,
            whatsapp,
            referralCode,
          }
        }
      },
      include: { barbershops: true },
    });

    const newShop = user.barbershops[0];

    // Asociación de referido (con todas las validaciones antifraude).
    if (ref && newShop) {
      await linkReferral({
        referredId: newShop.id,
        referredOwnerId: user.id,
        referredEmail: email,
        referredWhatsapp: whatsapp,
        code: ref,
      });
    }

    return NextResponse.json(
      { success: true, message: 'Barbería registrada exitosamente', slug },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
