"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const patientSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must consent to the Privacy Policy to proceed" }),
  }),
});

function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s()-]+/g, "");
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

export async function signUpPatient(prevState: unknown, formData: FormData) {
  const rawFullName = formData.get("fullName") as string;
  const rawPhone = formData.get("phone") as string;
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  const rawConsent = formData.get("consent") === "on";

  const result = patientSignupSchema.safeParse({
    fullName: rawFullName,
    phone: rawPhone,
    email: rawEmail,
    password: rawPassword,
    consent: rawConsent,
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        fullName: fieldErrors.fullName?.[0],
        phone: fieldErrors.phone?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        consent: fieldErrors.consent?.[0],
      },
    };
  }

  const { fullName, phone, email, password } = result.data;
  const formattedPhone = phone ? formatPhoneNumber(phone) : undefined;

  const supabase = await createClient();

  // 1. Sign up user using anon client to trigger standard OTP email
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "PATIENT",
        name: fullName,
        phone: formattedPhone || undefined,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  // 2. Insert public records using admin client so they are ready upon verification
  // (We use admin client because RLS might prevent unverified users from inserting)
  if (authData?.user) {
    const adminClient = await createAdminClient();
    if (adminClient) {
      await adminClient.from("users").upsert({
        id: authData.user.id,
        email,
        phone: formattedPhone || null,
        role: "PATIENT",
      }, { onConflict: "id" });

      await adminClient.from("patient_profiles").upsert({
        user_id: authData.user.id,
        name: fullName,
      }, { onConflict: "user_id" });
    }
  }

  // If session exists, email confirmation might be disabled in Supabase, meaning they are fully logged in.
  if (authData?.session) {
    await supabase.auth.signOut();
    return { success: true, emailOtpRequired: false };
  }

  // Return success with flag to show OTP form
  return { success: true, emailOtpRequired: true, email };
}
