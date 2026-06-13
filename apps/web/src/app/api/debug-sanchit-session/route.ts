import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not logged in" });

  const { data: profile, error } = await supabase
    .from("doctor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Try to bypass RLS to see if it exists
  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = await createAdminClient();
  const { data: adminProfile } = await admin.from("doctor_profiles").select("*").eq("user_id", user.id).single();

  return NextResponse.json({
    user_id: user.id,
    user_metadata: user.user_metadata,
    profile_via_session: profile,
    session_error: error,
    profile_via_admin: adminProfile
  });
}
