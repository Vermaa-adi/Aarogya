"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getPatientProfileId(userId: string) {
  const supabase = await createClient();
  
  // Try to read profile
  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profile) return profile.id;

  // Auto-heal: try inserting with anon client
  const { data: created } = await supabase
    .from("patient_profiles")
    .insert({ user_id: userId, name: "Patient" })
    .select("id")
    .single();

  if (created) return created.id;

  // Fallback: use admin client
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

export async function createBooking(prevState: unknown, formData: FormData) {
  const doctorId = formData.get("doctorId") as string;
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const reason = formData.get("reason") as string;

  if (!doctorId || !dateStr || !timeStr) {
    return { success: false, message: "Please select a date and time." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const patientId = await getPatientProfileId(user.id);
  if (!patientId) return { success: false, message: "Could not create patient profile. Please try again." };

  // Construct start and end datetimes
  const slotStart = new Date(`${dateStr}T${timeStr}:00`);
  const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // Assume 30 min slots

  if (isNaN(slotStart.getTime())) {
    return { success: false, message: "Invalid date or time." };
  }

  // Check for conflicts (patient already has appointment at this time)
  const { count: conflictCount } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId)
    .not("status", "in", '("CANCELLED","DECLINED")')
    .lt("slot_start", slotEnd.toISOString())
    .gt("slot_end", slotStart.toISOString());

  if (conflictCount && conflictCount > 0) {
    return { success: false, message: "You already have an appointment scheduled for this time." };
  }

  // Check for conflicts (doctor already has appointment at this time)
  const { count: docConflictCount } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("doctor_id", doctorId)
    .not("status", "in", '("CANCELLED","DECLINED")')
    .lt("slot_start", slotEnd.toISOString())
    .gt("slot_end", slotStart.toISOString());

  if (docConflictCount && docConflictCount > 0) {
    return { success: false, message: "This slot is no longer available. Please select another time." };
  }

  // Insert PENDING appointment
  const { error } = await supabase.from("appointments").insert({
    patient_id: patientId,
    doctor_id: doctorId,
    slot_start: slotStart.toISOString(),
    slot_end: slotEnd.toISOString(),
    status: "PENDING",
    reason: reason || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  
  return { success: true };
}
