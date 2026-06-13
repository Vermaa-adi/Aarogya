"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().optional(),
  blood_group: z.string().optional(),
  known_conditions: z.string().optional(),
  emergency_contact: z.string().optional(),
});

async function ensurePatientProfile(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profile) return true;

  // Auto-heal
  const { error } = await supabase
    .from("patient_profiles")
    .insert({ user_id: userId, name: "Patient" });

  if (!error) return true;

  const adminClient = await createAdminClient();
  if (adminClient) {
    await adminClient.from("users").upsert(
      { id: userId, email: "", role: "PATIENT" },
      { onConflict: "id" }
    );

    const { error: adminErr } = await adminClient
      .from("patient_profiles")
      .upsert({ user_id: userId, name: "Patient" }, { onConflict: "user_id" });

    if (!adminErr) return true;
  }

  return false;
}

export async function updatePatientProfile(
  prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();
  if (!supabase)
    return { success: false, message: "Service not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  // Ensure profile exists
  await ensurePatientProfile(user.id);

  const rawData = {
    name: formData.get("name") as string,
    dob: formData.get("dob") as string,
    blood_group: formData.get("blood_group") as string,
    known_conditions: formData.get("known_conditions") as string,
    emergency_contact: formData.get("emergency_contact") as string,
  };

  const result = profileSchema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        name: fieldErrors.name?.[0],
      },
    };
  }

  // Handle avatar upload
  let avatarUrl: string | undefined;
  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      return {
        success: false,
        message: `Avatar upload failed: ${uploadError.message}`,
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);
    avatarUrl = publicUrl;
  }

  const updateData: Record<string, unknown> = {
    name: result.data.name,
    dob: result.data.dob || null,
    blood_group: result.data.blood_group || null,
    known_conditions: result.data.known_conditions || null,
    emergency_contact: result.data.emergency_contact || null,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("patient_profiles")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully." };
}
