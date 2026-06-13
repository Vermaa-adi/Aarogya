"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const doctorLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginDoctor(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = doctorLoginSchema.safeParse({ email, password });
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Determine role — the trigger may not have created the users row yet
  let role: string | undefined;

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (userData) {
    role = userData.role;
  } else {
    // Row doesn't exist yet — read role from auth metadata and create it
    role = authData.user.user_metadata?.role || "PATIENT";
    await supabase.from("users").insert({
      id: authData.user.id,
      email: authData.user.email,
      phone: authData.user.user_metadata?.phone || null,
      role: role,
    });

    // Also create doctor profile if role is DOCTOR
    if (role === "DOCTOR") {
      const meta = authData.user.user_metadata || {};
      await supabase.from("doctor_profiles").insert({
        user_id: authData.user.id,
        name: meta.name || "Doctor",
        specialties: meta.specialties || [],
        license_no: meta.license_no || null,
        license_doc_url: meta.license_doc_url || null,
      });
    }
  }

  if (role !== "DOCTOR") {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Access denied: This portal is for doctors only.",
    };
  }

  // Check verification status
  const { data: doctorProfile } = await supabase
    .from("doctor_profiles")
    .select("is_verified")
    .eq("user_id", authData.user.id)
    .single();

  return {
    success: true,
    isVerified: doctorProfile?.is_verified ?? false,
  };
}
