"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function acceptAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, message: "Doctor profile not found." };

  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, doctor_id, slot_end")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.doctor_id !== profile.id || appointment.status !== "PENDING") {
    return { success: false, message: "Invalid appointment or unauthorized." };
  }

  // Generate Video Room URL
  // If we had a Daily.co API key, we would generate a real room here.
  // Since we are mocking it, we point to our internal video room UI.
  let videoUrl = `/video-room/${appointmentId}`;
  
  const dailyApiKey = process.env.DAILY_API_KEY;
  if (dailyApiKey) {
    try {
      const exp = Math.floor(new Date(appointment.slot_end).getTime() / 1000) + 1800; // slot_end + 30 mins
      
      const res = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${dailyApiKey}`,
        },
        body: JSON.stringify({
          properties: {
            exp,
            enable_chat: true,
          },
        }),
      });

      if (res.ok) {
        const roomData = await res.json();
        videoUrl = roomData.url;
      } else {
        console.error("Daily API Error:", await res.text());
      }
    } catch (e) {
      console.error("Failed to create Daily room:", e);
    }
  }

  const { error } = await supabase
    .from("appointments")
    .update({ 
      status: "CONFIRMED",
      video_url: videoUrl
    })
    .eq("id", appointmentId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/doctor/requests");
  revalidatePath("/doctor/dashboard");
  revalidatePath("/doctor/appointments");

  return { success: true };
}

export async function declineAppointment(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Not authenticated." };

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, message: "Doctor profile not found." };

  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, doctor_id")
    .eq("id", appointmentId)
    .single();

  if (!appointment || appointment.doctor_id !== profile.id || appointment.status !== "PENDING") {
    return { success: false, message: "Invalid appointment or unauthorized." };
  }

  const { error } = await supabase
    .from("appointments")
    .update({ 
      status: "DECLINED",
      // Optionally store the decline reason if we add a column for it in the future
      // For now, we just decline it.
    })
    .eq("id", appointmentId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/doctor/requests");
  revalidatePath("/doctor/dashboard");

  return { success: true };
}
