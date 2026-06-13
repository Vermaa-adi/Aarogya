"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function verifyAdminRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { adminClient: null, user: null };

  let role = user.user_metadata?.role || user.app_metadata?.role;
  if (!role) {
    // Use admin client to read the users table (RLS blocks cross-user reads)
    const ac = await createAdminClient();
    if (ac) {
      const { data: userData } = await ac
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      role = userData?.role;
    }
  }

  if (role !== "ADMIN") return { adminClient: null, user: null };

  const adminClient = await createAdminClient();
  return { adminClient, user };
}

export async function approveDoctor(doctorId: string) {
  const { adminClient, user } = await verifyAdminRole();
  if (!user || !adminClient) return { success: false, message: "Unauthorized." };

  const { error } = await adminClient
    .from("doctor_profiles")
    .update({ is_verified: true })
    .eq("id", doctorId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/admin/approvals");
  return { success: true };
}

export async function rejectDoctor(doctorId: string) {
  const { adminClient, user } = await verifyAdminRole();
  if (!user || !adminClient) return { success: false, message: "Unauthorized." };

  // First we need the user_id from the profile
  const { data: profile } = await adminClient
    .from("doctor_profiles")
    .select("user_id")
    .eq("id", doctorId)
    .single();

  if (!profile) return { success: false, message: "Profile not found." };

  const { error: profileError } = await adminClient
    .from("doctor_profiles")
    .delete()
    .eq("id", doctorId);

  if (profileError) {
    return { success: false, message: profileError.message };
  }

  // Also delete from public users table
  await adminClient.from("users").delete().eq("id", profile.user_id);

  revalidatePath("/admin/approvals");
  return { success: true };
}

