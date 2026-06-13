import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await createAdminClient();
  const { data, error } = await admin.rpc('get_policies_for_table', { t_name: 'doctor_profiles' });
  
  if (error) {
    // Let's just query pg_policies directly
    const { data: policies, error: pgErr } = await admin.from("pg_policies").select("*").eq("tablename", "doctor_profiles");
    return NextResponse.json({ policies, pgErr });
  }

  return NextResponse.json({ data });
}
