import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  
  if (!supabase) {
    return NextResponse.json({ error: "No client" });
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Not logged in" });
  }

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
    },
    profile,
  });
}
