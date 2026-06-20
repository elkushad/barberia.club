import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import net from 'net';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mask(url: string) {
  return url.replace(/:([^:@]{1,}?)@/, ':****@');
}

async function checkDnsAll(host: string) {
  const results: Record<string, any> = {};
  try { results.lookup_all = await dns.lookup(host, { all: true }); } catch (e: any) { results.lookup_all = `error: ${e.code}`; }
  try { results.resolve4 = await dns.resolve4(host); } catch (e: any) { results.resolve4 = `error: ${e.code}`; }
  try { results.resolve6 = await dns.resolve6(host); } catch (e: any) { results.resolve6 = `error: ${e.code}`; }
  return results;
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

async function testPrisma(label: string, url: string) {
  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    const r = await client.$queryRaw`SELECT 1 AS ok`;
    return `OK`;
  } catch (e: any) {
    const msg = e.message ?? '';
    const short = msg.split('\n').filter((l: string) => l.trim()).slice(-2).join(' | ');
    return short.substring(0, 250);
  } finally {
    await client.$disconnect().catch(() => {});
  }
}

export async function GET() {
  const directHost = 'db.xjdoxxknyokeoqscevsc.supabase.co';
  const poolerHost = 'aws-0-us-east-1.pooler.supabase.com';
  // Extract password from the current DATABASE_URL
  let pw = '';
  try { pw = new URL(process.env.DATABASE_URL ?? '').password; } catch (_) {}

  const [dnsDirect, dnsPooler] = await Promise.all([
    checkDnsAll(directHost),
    checkDnsAll(poolerHost),
  ]);

  const [tcp5432, tcp6543, tcpP6543, tcpP5432] = await Promise.all([
    tcpCheck(directHost, 5432),
    tcpCheck(directHost, 6543),
    tcpCheck(poolerHost, 6543),
    tcpCheck(poolerHost, 5432),
  ]);

  // Get IPv6 for direct host to try raw IPv6 connection
  const ipv6Addr = dnsDirect.resolve6?.[0] ?? dnsDirect.lookup_all?.[0]?.address ?? null;

  const urls: Record<string, string> = {
    pooler_tx: `postgresql://postgres.xjdoxxknyokeoqscevsc:${pw}@${poolerHost}:6543/postgres`,
    pooler_sess: `postgresql://postgres.xjdoxxknyokeoqscevsc:${pw}@${poolerHost}:5432/postgres`,
  };
  if (ipv6Addr) {
    urls.direct_ipv6 = `postgresql://postgres:${pw}@[${ipv6Addr}]:5432/postgres`;
  }

  const prismaResults: Record<string, string> = {};
  for (const [key, url] of Object.entries(urls)) {
    prismaResults[key] = await testPrisma(key, url);
  }

  return NextResponse.json({
    dns: { direct: dnsDirect, pooler: dnsPooler },
    tcp: { 'direct:5432': tcp5432, 'direct:6543': tcp6543, 'pooler:6543': tcpP6543, 'pooler:5432': tcpP5432 },
    ipv6Direct: ipv6Addr,
    prisma: prismaResults,
  });
}
