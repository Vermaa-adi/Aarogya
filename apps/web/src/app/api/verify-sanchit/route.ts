import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminClient = await createAdminClient();
  const userId = "d18313e2-3560-4204-a650-ad2302101c19"; // Sanchit Mittal
  
  // Update Sanchit's auth metadata just to be perfectly safe
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { is_verified: true }
  });

  return NextResponse.json({ success: !error, error });
}
