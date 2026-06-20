import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import net from 'net';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mask(url: string) {
  return url.replace(/:([^:@]{1,}?)@/, ':****@');
}

async function checkDns(host: string) {
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.map((a: any) => a.address).join(', ');
  } catch (e: any) {
    return `DNS error: ${e.code}`;
  }
}

async function tcpCheck(host: string, port: number): Promise<string> {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    sock.setTimeout(5000);
    sock.connect(port, host, () => { sock.destroy(); resolve('TCP OK'); });
    sock.on('error', (e: any) => { resolve(`TCP error: ${e.code || e.message}`); });
    sock.on('timeout', () => { sock.destroy(); resolve('TCP timeout'); });
  });
}

async function testPrisma(url: string) {
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    const r = await client.$queryRaw`SELECT 1 AS ok`;
    return `OK: ${JSON.stringify(r)}`;
  } catch (e: any) {
    return `Error: ${e.message?.substring(0, 200)}`;
  } finally {
    await client.$disconnect();
  }
}

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? '(not set)';
  const directUrl = process.env.DIRECT_URL ?? '(not set)';

  // Hosts to check
  const directHost = 'db.xjdoxxknyokeoqscevsc.supabase.co';
  const poolerHost = 'aws-0-us-east-1.pooler.supabase.com';
  const pw = 'B6Lk3ICw9fTTe5UJ';

  const [
    dnsDirect, dnsPooler,
    tcp5432, tcp6543, tcpPooler6543, tcpPooler5432,
  ] = await Promise.all([
    checkDns(directHost),
    checkDns(poolerHost),
    tcpCheck(directHost, 5432),
    tcpCheck(directHost, 6543),
    tcpCheck(poolerHost, 6543),
    tcpCheck(poolerHost, 5432),
  ]);

  // Test each URL option
  const urlOptions = {
    direct_5432: `postgresql://postgres:${pw}@${directHost}:5432/postgres`,
    direct_6543: `postgresql://postgres:${pw}@${directHost}:6543/postgres`,
    pooler_tx: `postgresql://postgres.xjdoxxknyokeoqscevsc:${pw}@${poolerHost}:6543/postgres`,
    pooler_session: `postgresql://postgres.xjdoxxknyokeoqscevsc:${pw}@${poolerHost}:5432/postgres`,
  };

  const results: Record<string, string> = {};
  for (const [key, url] of Object.entries(urlOptions)) {
    results[key] = await testPrisma(url);
  }

  return NextResponse.json({
    env: { DATABASE_URL: mask(dbUrl), DIRECT_URL: mask(directUrl) },
    dns: { directHost: dnsDirect, poolerHost: dnsPooler },
    tcp: { 'direct:5432': tcp5432, 'direct:6543': tcp6543, 'pooler:6543': tcpPooler6543, 'pooler:5432': tcpPooler5432 },
    prisma: results,
  });
}
