"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, message: "Patient profile not found." };

  // Verify ownership and check status/time
  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, slot_start, patient_id")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.patient_id !== profile.id) {
    return { success: false, message: "Appointment not found or unauthorized." };
  }

  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    return { success: false, message: `Cannot cancel an appointment that is ${appointment.status.toLowerCase()}.` };
  }

  const slotTime = new Date(appointment.slot_start);
  const now = new Date();
  
  // Rule: Can only cancel if > 2 hours before slot
  const diffHours = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours < 2) {
    return { success: false, message: "Appointments cannot be cancelled less than 2 hours before the scheduled time." };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: "CANCELLED" })
    .eq("id", appointmentId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/appointments");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function submitRating(prevState: unknown, formData: FormData) {
  const appointmentId = formData.get("appointmentId") as string;
  const doctorId = formData.get("doctorId") as string;
  const score = parseInt(formData.get("score") as string, 10);
  const review = formData.get("review") as string;

  if (!appointmentId || !doctorId || isNaN(score) || score < 1 || score > 5) {
    return { success: false, message: "Invalid rating data." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const { data: profile } = await supabase
    .from("patient_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, message: "Patient profile not found." };

  // Verify appointment was COMPLETED and belongs to patient
  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, patient_id")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.patient_id !== profile.id || appointment.status !== "COMPLETED") {
    return { success: false, message: "Can only rate completed appointments." };
  }

  // Check if rating already exists
  const { count } = await supabase
    .from("ratings")
    .select("id", { count: "exact", head: true })
    .eq("appointment_id", appointmentId);

  if (count && count > 0) {
    return { success: false, message: "You have already rated this appointment." };
  }

  // Insert rating
  const { error } = await supabase.from("ratings").insert({
    appointment_id: appointmentId,
    doctor_id: doctorId,
    patient_id: profile.id,
    score,
    review: review || null,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/appointments");
  revalidatePath(`/doctors/${doctorId}`);

  return { success: true };
}
