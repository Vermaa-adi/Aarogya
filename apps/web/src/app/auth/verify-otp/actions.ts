"use server";

import { createClient } from "@/lib/supabase/server";

export async function verifyOtp(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;
  const type = formData.get("type") as "sms" | "signup" | "magiclink" | "email";

  const identifier = email || phone;

  if (!identifier || !otp) {
    return { success: false, message: "Email/Phone number and OTP are required." };
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { success: false, message: "Please enter a valid 6-digit OTP." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  let data, error;

  if (email) {
    const res = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: type === "signup" ? "signup" : "email",
    });
    data = res.data;
    error = res.error;
  } else {
    const res = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    data = res.data;
    error = res.error;
  }

  if (error) {
    return { success: false, message: error.message };
  }

  // Determine redirect based on user role, and sign out if it was a signup verification
  let redirectTo = "/dashboard";
  let shouldSignOut = false;

  if (data.user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (type === "signup") {
      shouldSignOut = true;
      if (userData?.role === "DOCTOR") {
        redirectTo = "/auth/doctor/login";
      } else if (userData?.role === "PATIENT") {
        redirectTo = "/auth/login";
      } else {
        redirectTo = "/auth/admin/login";
      }
    } else {
      // Normal login flow
      if (userData?.role === "DOCTOR") {
        const { data: doctorProfile } = await supabase
          .from("doctor_profiles")
          .select("is_verified")
          .eq("user_id", data.user.id)
          .single();
        
        if (doctorProfile?.is_verified) {
          redirectTo = "/doctor/dashboard";
        } else {
          redirectTo = "/doctor/verification-pending";
        }
      } else if (userData?.role === "ADMIN") {
        redirectTo = "/admin/approvals";
      }
    }
  }

  if (shouldSignOut) {
    await supabase.auth.signOut();
  }

  return { success: true, redirectTo };
}

export async function resendOtp(phone: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  const { error } = await supabase.auth.signInWithOtp({ phone });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "OTP resent successfully." };
}
