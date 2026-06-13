"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveConsultNotes(prevState: unknown, formData: FormData) {
  const appointmentId = formData.get("appointmentId") as string;
  const patientId = formData.get("patientId") as string;
  const notes = formData.get("notes") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const prescription = formData.get("prescription") as string;
  const completeAppointment = formData.get("completeAppointment") === "true";

  if (!appointmentId || !patientId || !notes) {
    return { success: false, message: "Appointment ID, Patient ID, and Notes are required." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, message: "Doctor profile not found." };

  // Verify ownership of the appointment
  const { data: appointment } = await supabase
    .from("appointments")
    .select("doctor_id, status")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.doctor_id !== profile.id) {
    return { success: false, message: "Invalid appointment or unauthorized." };
  }

  // Insert or update notes (schema: appointment_id, notes, prescription, diagnosis)
  const { error: notesError } = await supabase.from("consult_notes").upsert({
    appointment_id: appointmentId,
    diagnosis: diagnosis || null,
    notes: notes,
    prescription: prescription || null,
  }, { onConflict: "appointment_id" });

  if (notesError) {
    return { success: false, message: notesError.message };
  }

  // Update appointment status if marked complete
  if (completeAppointment && appointment.status !== "COMPLETED") {
    const { error: apptError } = await supabase
      .from("appointments")
      .update({ status: "COMPLETED" })
      .eq("id", appointmentId);

    if (apptError) {
      return { success: false, message: apptError.message };
    }
  }

  revalidatePath(`/doctor/appointments/${appointmentId}/patient`);
  revalidatePath(`/doctor/dashboard`);

  return { success: true, message: "Consultation notes saved successfully." };
}
