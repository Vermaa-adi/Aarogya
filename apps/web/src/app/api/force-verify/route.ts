import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminClient = await createAdminClient();
  
  if (!adminClient) {
    return NextResponse.json({ error: "No admin client" });
  }

  // Update both test doctors
  const updates = [
    "d18313e2-3560-4204-a650-ad2302101c19", // Sanchit
    "0f0dcbf8-c6bb-4172-b09d-070c80ca2abe"  // Peeyush
  ];

  const results = [];
  for (const id of updates) {
    const { data, error } = await adminClient.auth.admin.updateUserById(id, {
      user_metadata: { is_verified: true }
    });
    results.push({ id, success: !error, error });
  }

  return NextResponse.json({ results });
}
