import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminClient = await createAdminClient();
  
  // Sanchit's profile says user_id is d18313e2-3560-4204-a650-ad2302101c19
  const userId = "d18313e2-3560-4204-a650-ad2302101c19";

  const { data: userRow } = await adminClient.from("users").select("*").eq("id", userId).single();

  return NextResponse.json({
    profileUserId: userId,
    publicUserRowExists: !!userRow,
    publicUserRow: userRow,
  });
}
