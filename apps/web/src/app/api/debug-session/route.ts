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

  // Test RLS manually by calling a function that returns auth.uid()
  const { data: uidData } = await supabase.rpc("get_my_uid"); // We will create this

  return NextResponse.json({
    user_id: user.id,
    profile,
    error,
    uidData
  });
}
