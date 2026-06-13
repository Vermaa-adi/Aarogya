import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminClient = await createAdminClient();
  const userId = "0f0dcbf8-c6bb-4172-b09d-070c80ca2abe"; // peeyush

  // 1. Check public.users
  const { data: userRow, error: userErr } = await adminClient.from("users").select("*").eq("id", userId).single();
  
  // 2. Check doctor_profiles
  const { data: docRow, error: docErr } = await adminClient.from("doctor_profiles").select("*").eq("user_id", userId).single();

  // 3. Try to upsert
  const { data: upsertRow, error: upsertErr } = await adminClient.from("doctor_profiles").upsert({
    user_id: userId,
    name: "peeyush test",
    specialties: ["General"],
    license_no: "12345",
    is_verified: true,
  }, { onConflict: "user_id" }).select().single();

  return NextResponse.json({
    userRow, userErr,
    docRow, docErr,
    upsertRow, upsertErr
  });
}
