import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mask(url: string) {
  return url.replace(/:([^:@]{1,}?)@/, ':****@');
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? '(not set)';
  const directUrl = process.env.DIRECT_URL ?? '(not set)';

  let prismaResult: string;
  let data: any = null;
  try {
    data = await prisma.$queryRaw`SELECT 1 AS ok`;
    prismaResult = 'OK';
  } catch (e: any) {
    prismaResult = e.message?.substring(0, 500) ?? 'unknown error';
  }

  return NextResponse.json({
    DATABASE_URL: mask(dbUrl),
    DIRECT_URL: mask(directUrl),
    prisma: prismaResult,
    data,
  });
}
