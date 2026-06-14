"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const doctorSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  licenseNo: z.string().min(3, "License number is required"),
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

export async function signUpDoctor(prevState: unknown, formData: FormData) {
  const rawFullName = formData.get("fullName") as string;
  const rawEmail = formData.get("email") as string;
  const rawPhone = formData.get("phone") as string;
  const rawPassword = formData.get("password") as string;
  const rawSpecialties = formData.getAll("specialties") as string[];
  const rawLicenseNo = formData.get("licenseNo") as string;

  const result = doctorSignupSchema.safeParse({
    fullName: rawFullName,
    email: rawEmail,
    phone: rawPhone,
    password: rawPassword,
    specialties: rawSpecialties,
    licenseNo: rawLicenseNo,
  });

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        fullName: fieldErrors.fullName?.[0],
        email: fieldErrors.email?.[0],
        phone: fieldErrors.phone?.[0],
        password: fieldErrors.password?.[0],
        specialties: fieldErrors.specialties?.[0],
        licenseNo: fieldErrors.licenseNo?.[0],
      },
    };
  }

  const { fullName, email, phone, password, specialties, licenseNo } = result.data;
  const formattedPhone = phone ? formatPhoneNumber(phone) : undefined;

  const supabase = await createClient();

  // Upload license document if provided
  let licenseDocUrl: string | null = null;
  const licenseFile = formData.get("licenseDoc") as File | null;
  if (licenseFile && licenseFile.size > 0) {
    const fileExt = licenseFile.name.split(".").pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload with anon client - we need anon client or admin client.
    // For doctor docs, the bucket RLS requires auth.uid(), which we don't have yet if email confirmation is required.
    // So we must use the admin client for the initial upload if we're not signed in yet!
    const adminClient = await createAdminClient();
    if (adminClient) {
      const { error: uploadError } = await adminClient.storage
        .from("doctor-docs")
        .upload(filePath, licenseFile);

      if (uploadError) {
        return {
          success: false,
          message: `License upload failed: ${uploadError.message}`,
        };
      }
      licenseDocUrl = filePath;
    }
  }

  // 1. Sign up user using anon client to trigger standard OTP email
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "DOCTOR",
        name: fullName,
        phone: formattedPhone || undefined,
        specialties,
        license_no: licenseNo,
        license_doc_url: licenseDocUrl,
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
  if (authData?.user) {
    const adminClient = await createAdminClient();
    if (adminClient) {
      await adminClient.from("users").upsert({
        id: authData.user.id,
        email,
        phone: formattedPhone || null,
        role: "DOCTOR",
      }, { onConflict: "id" });

      await adminClient.from("doctor_profiles").upsert({
        user_id: authData.user.id,
        name: fullName,
        specialties,
        license_no: licenseNo,
        license_doc_url: licenseDocUrl,
      }, { onConflict: "user_id" });
    }
  }

  // If session exists, email confirmation might be disabled
  if (authData?.session) {
    await supabase.auth.signOut();
    return { success: true, emailOtpRequired: false };
  }

  // Return success with flag to show OTP form
  return { success: true, emailOtpRequired: true, email };
}
