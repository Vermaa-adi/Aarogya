"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getPatientProfileId(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profile) return profile.id;

  // Auto-heal
  const { data: created } = await supabase
    .from("patient_profiles")
    .insert({ user_id: userId, name: "Patient" })
    .select("id")
    .single();

  if (created) return created.id;

  const adminClient = await createAdminClient();
  if (adminClient) {
    await adminClient.from("users").upsert(
      { id: userId, email: "", role: "PATIENT" },
      { onConflict: "id" }
    );

    const { data: adminCreated } = await adminClient
      .from("patient_profiles")
      .upsert({ user_id: userId, name: "Patient" }, { onConflict: "user_id" })
      .select("id")
      .single();

    if (adminCreated) return adminCreated.id;
  }

  return null;
}

export async function uploadMedicalRecord(
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

  const file = formData.get("file") as File | null;
  const description = (formData.get("description") as string) || "";

  if (!file || file.size === 0) {
    return { success: false, message: "Please select a file to upload." };
  }

  if (file.size > 10 * 1024 * 1024) {
    return { success: false, message: "File must be less than 10 MB." };
  }

  const patientId = await getPatientProfileId(user.id);
  if (!patientId) {
    return { success: false, message: "Could not find or create patient profile." };
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("medical-records")
    .upload(filePath, file);

  if (uploadError) {
    return {
      success: false,
      message: `Upload failed: ${uploadError.message}`,
    };
  }

  const fileType = file.type.includes("pdf") ? "pdf" : "image";

  const { error: dbError } = await supabase.from("medical_records").insert({
    patient_id: patientId,
    file_url: filePath,
    file_type: fileType,
    description: description || null,
  });

  if (dbError) {
    return { success: false, message: dbError.message };
  }

  revalidatePath("/records");
  return { success: true, message: "Record uploaded successfully." };
}

export async function deleteMedicalRecord(recordId: string) {
  const supabase = await createClient();
  if (!supabase)
    return { success: false, message: "Service not configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const patientId = await getPatientProfileId(user.id);
  if (!patientId) {
    return { success: false, message: "Patient profile not found." };
  }

  // Get the record to verify ownership and get file path
  const { data: record } = await supabase
    .from("medical_records")
    .select("file_url, patient_id")
    .eq("id", recordId)
    .single();

  if (!record || record.patient_id !== patientId) {
    return { success: false, message: "Record not found or access denied." };
  }

  // Delete file from storage
  await supabase.storage.from("medical-records").remove([record.file_url]);

  // Delete DB row
  const { error } = await supabase
    .from("medical_records")
    .delete()
    .eq("id", recordId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/records");
  return { success: true, message: "Record deleted." };
}
