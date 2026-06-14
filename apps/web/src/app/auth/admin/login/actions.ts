"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAdmin(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = adminLoginSchema.safeParse({ email, password });
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

  // Determine role
  let role: string | undefined;

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (userData) {
    role = userData.role;
  } else {
    role = authData.user.user_metadata?.role || "PATIENT";
    await supabase.from("users").insert({
      id: authData.user.id,
      email: authData.user.email,
      phone: authData.user.user_metadata?.phone || null,
      role: role,
    });
  }

  if (role !== "ADMIN") {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "Access denied: This portal is restricted to Administrators only.",
    };
  }

  return { success: true };
}
