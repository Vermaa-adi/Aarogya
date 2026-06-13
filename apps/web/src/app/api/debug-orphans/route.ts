import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await createAdminClient();
  
  // Find all doctor profiles for this email
  const { data: users } = await admin.from("users").select("*").eq("email", "adityavrma123@gmail.com");
  
  if (!users) return NextResponse.json({ error: "no users found" });

  const profiles = [];
  for (const u of users) {
    const { data: prof } = await admin.from("doctor_profiles").select("*, appointments(*)").eq("user_id", u.id).single();
    if (prof) profiles.push(prof);
  }

  return NextResponse.json({ users, profiles });
}
