import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await createAdminClient();
  
  // Get all appointments
  const { data: appointments } = await admin.from("appointments").select("*, doctor_profiles(name), patient_profiles(name)");

  // Get all doctors
  const { data: doctors } = await admin.from("doctor_profiles").select("id, name, user_id, is_verified");

  return NextResponse.json({ appointments, doctors });
}
