import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminClient = await createAdminClient();
  
  // Since we can't query pg_policies directly via REST, let's create a quick function
  // wait, we can just use the adminClient to call a new RPC
  const { data: policies, error } = await adminClient.rpc("get_users_policies");

  return NextResponse.json({ policies, error });
}
