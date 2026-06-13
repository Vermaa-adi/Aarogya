"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDoctorProfile(prevState: unknown, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const rawData = {
    bio: formData.get("bio") as string,
    fee_inr: parseInt(formData.get("fee_inr") as string, 10),
    experience_years: parseInt(formData.get("experience_years") as string, 10),
    availability: formData.get("availability") as string, // JSON string from client
  };

  // Handle avatar upload
  let avatarUrl: string | undefined;
  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    if (avatarFile.size > 2 * 1024 * 1024) {
      return { success: false, message: "Avatar must be less than 2 MB." };
    }
    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      return { success: false, message: `Avatar upload failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    avatarUrl = publicUrl;
  }

  let availabilityJson = {};
  try {
    availabilityJson = JSON.parse(rawData.availability || "{}");
  } catch {
    return { success: false, message: "Invalid availability data." };
  }

  const updateData: Record<string, unknown> = {
    bio: rawData.bio || null,
    fee_inr: isNaN(rawData.fee_inr) ? null : rawData.fee_inr,
    experience_years: isNaN(rawData.experience_years) ? null : rawData.experience_years,
    availability: availabilityJson,
    updated_at: new Date().toISOString(),
  };

  if (avatarUrl) {
    updateData.avatar_url = avatarUrl;
  }

  const { error } = await supabase
    .from("doctor_profiles")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/doctor/profile");
  return { success: true, message: "Profile updated successfully." };
}
