"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const doctorSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  licenseNo: z.string().min(3, "License number is required"),
});

export async function signUpDoctor(prevState: unknown, formData: FormData) {
  const rawFullName = formData.get("fullName") as string;
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;
  const rawSpecialties = formData.getAll("specialties") as string[];
  const rawLicenseNo = formData.get("licenseNo") as string;

  const result = doctorSignupSchema.safeParse({
    fullName: rawFullName,
    email: rawEmail,
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
        password: fieldErrors.password?.[0],
        specialties: fieldErrors.specialties?.[0],
        licenseNo: fieldErrors.licenseNo?.[0],
      },
    };
  }

  const { fullName, email, password, specialties, licenseNo } = result.data;
  const specialtiesArray = specialties;

  const supabase = await createClient();
  if (!supabase) {
    return { success: false, message: "Service not configured." };
  }

  // Upload license document if provided
  let licenseDocUrl: string | null = null;
  const licenseFile = formData.get("licenseDoc") as File | null;
  if (licenseFile && licenseFile.size > 0) {
    const fileExt = licenseFile.name.split(".").pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
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

  // Create user via Supabase Auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "DOCTOR",
        name: fullName,
        specialties: specialtiesArray,
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

  return {
    success: true,
  };
}
