"use server";

import { createClient } from "@/lib/supabase/server";

export async function verifyOtp(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string;
  const otp = formData.get("otp") as string;
  const type = (formData.get("type") as string) || "sms";

  if (!phone || !otp) {
    return { success: false, message: "Phone number and OTP are required." };
  }

  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    return { success: false, message: "Please enter a valid 6-digit OTP." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  const otpType = type === "signup" ? "sms" : "sms";

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: otpType as "sms",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Determine redirect based on user role
  let redirectTo = "/dashboard";
  if (data.user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (userData?.role === "DOCTOR") {
      redirectTo = "/doctor/dashboard";
    } else if (userData?.role === "ADMIN") {
      redirectTo = "/admin/approvals";
    }
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
