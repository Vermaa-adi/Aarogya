"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export async function requestPasswordReset(
  prevState: unknown,
  formData: FormData
) {
  const email = formData.get("email") as string;

  const result = forgotPasswordSchema.safeParse({ email });
  if (!result.success) {
    return {
      success: false,
      errors: { email: result.error.flatten().fieldErrors.email?.[0] },
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    result.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`,
    }
  );

  if (error) {
    return { success: false, message: error.message };
  }

  // Always return success to prevent email enumeration
  return {
    success: true,
    message:
      "If an account exists with that email, you will receive a password reset link shortly.",
  };
}
