"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const otpRequestSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s()-]+/g, ""); // remove spaces, dashes, parens
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

export async function loginWithEmail(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate fields
  const result = emailLoginSchema.safeParse({ email, password });
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
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  // Ensure role is PATIENT
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (userData?.role !== "PATIENT") {
    // Sign out user to avoid invalid session caching
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Access denied: This portal is for patients only.",
    };
  }

  return {
    success: true,
  };
}

export async function loginWithOtp(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string;

  // Validate fields
  const result = otpRequestSchema.safeParse({ phone });
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        phone: fieldErrors.phone?.[0],
      },
    };
  }

  const formattedPhone = formatPhoneNumber(result.data.phone);
  const supabase = await createClient();

  // Security pre-check: verify number exists and belongs to a patient
  const { data: userExists, error: searchError } = await supabase
    .from("users")
    .select("role")
    .eq("phone", formattedPhone)
    .maybeSingle();

  if (searchError) {
    return {
      success: false,
      message: "An error occurred checking credentials.",
    };
  }

  if (!userExists) {
    return {
      success: false,
      message: "No patient account found with this phone number. Please sign up first.",
    };
  }

  if (userExists.role !== "PATIENT") {
    return {
      success: false,
      message: "Access denied: This login portal is for patients only.",
    };
  }

  // Trigger Supabase OTP send
  const { error: otpError } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (otpError) {
    return {
      success: false,
      message: otpError.message,
    };
  }

  return {
    success: true,
    phone: formattedPhone,
  };
}
