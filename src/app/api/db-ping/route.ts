import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dns from 'dns/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? '(not set)';
  const directUrl = process.env.DIRECT_URL ?? '(not set)';

  // Parse host from URL for DNS check
  let host = '';
  try {
    const u = new URL(dbUrl);
    host = u.hostname;
  } catch (_) {}

  let dnsResult: string | null = null;
  try {
    const addrs = await dns.lookup(host, { all: true });
    dnsResult = JSON.stringify(addrs);
  } catch (e: any) {
    dnsResult = `DNS error: ${e.code} - ${e.message}`;
  }

  let prismaResult: string;
  let data: any = null;
  try {
    data = await prisma.$queryRaw`SELECT 1 AS ok`;
    prismaResult = 'OK';
  } catch (e: any) {
    prismaResult = `Error: ${e.message}`;
  }

  const mask = (url: string) => url.replace(/:([^:@]{4})[^@]*@/, ':****@');

  return NextResponse.json({
    DATABASE_URL: mask(dbUrl),
    DIRECT_URL: mask(directUrl),
    host,
    dns: dnsResult,
    prisma: prismaResult,
    data,
  });
}
