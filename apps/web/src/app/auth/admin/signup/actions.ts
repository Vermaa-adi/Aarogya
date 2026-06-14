"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const adminSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signUpAdmin(prevState: unknown, formData: FormData) {
  const rawFullName = formData.get("fullName") as string;
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;

  const result = adminSignupSchema.safeParse({
    fullName: rawFullName,
    email: rawEmail,
    password: rawPassword,
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const { fullName, email, password } = result.data;
  const supabase = await createClient();

  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  // Security Check: Only allow exactly ONE admin account to ever be registered.
  const { count, error: countError } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "ADMIN");

  if (countError) {
    return { success: false, message: "Error verifying permissions." };
  }

  if (count && count >= 1) {
    return {
      success: false,
      message: "An Administrator account already exists. Registration is closed.",
    };
  }

  // 1. Sign up the user via Supabase Auth
  // We pass role: 'ADMIN' in metadata so the database trigger creates the correct user row.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "ADMIN",
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Administrator account created successfully!" };
}
