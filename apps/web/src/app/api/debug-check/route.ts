import { createClient as createBaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const admin = createBaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check ALL doctor profiles
  const { data: doctors, error } = await admin
    .from("doctor_profiles")
    .select("id, user_id, name, is_verified");

  return NextResponse.json({ doctors, error });
}
