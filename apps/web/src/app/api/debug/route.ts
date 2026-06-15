import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "undefined";
  
  const debugInfo: any = {
    url,
    anonLength: anon.length,
    nodeVersion: process.version,
    envNodeOptions: process.env.NODE_OPTIONS || "none",
  };

  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      method: "GET",
      headers: { "apikey": anon },
      cache: "no-store",
    });
    
    debugInfo.fetchStatus = res.status;
    debugInfo.fetchText = await res.text();
  } catch (err: any) {
    debugInfo.fetchError = err.message;
    debugInfo.fetchCause = err.cause ? err.cause.message : "no cause";
    debugInfo.stack = err.stack;
  }

  return NextResponse.json(debugInfo);
}
