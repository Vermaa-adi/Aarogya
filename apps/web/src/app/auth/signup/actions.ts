"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const patientSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must consent to the Privacy Policy to proceed" }),
  }),
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

export async function signUpPatient(prevState: unknown, formData: FormData) {
  const rawFullName = formData.get("fullName") as string;
  const rawPhone = formData.get("phone") as string;
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  const rawConsent = formData.get("consent") === "on";

  // Validate fields
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
  const formattedPhone = formatPhoneNumber(phone);

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    phone: formattedPhone,
    password: password,
    options: {
      data: {
        role: "PATIENT",
        name: fullName,
        email: email || undefined,
      },
    },
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    phone: formattedPhone,
  };
}
