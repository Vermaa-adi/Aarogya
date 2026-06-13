"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpDoctor } from "./actions";

const SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "Ophthalmology",
  "Dentistry",
  "Psychiatry",
  "Gynecology",
  "ENT",
  "Pulmonology",
  "Urology",
  "Gastroenterology",
  "Endocrinology",
  "Oncology",
  "Nephrology",
  "Rheumatology",
];

export default function DoctorSignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpDoctor, null);

  useEffect(() => {
    if (state?.success) {
      if (state.emailOtpRequired && state.email) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(state.email)}&type=signup`);
      } else {
        router.push("/auth/doctor/login");
      }
      router.refresh();
    }
  }, [state, router]);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Register as a Doctor
        </h2>
        <p className="text-sm text-ink-mid mt-1.5">
          Join Aarogya to consult patients across Himachal Pradesh
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.message && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {state.message}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-medium text-ink-mid mb-1">
            Full Name *
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            placeholder="Dr. Reena Sharma"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.fullName && (
            <p className="text-xs text-red-600 mt-1">{state.errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-ink-mid mb-1">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="doctor@example.com"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.errors.email}</p>
          )}
        </div>

        {/* Phone Number (Optional) */}
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-ink-mid mb-1">
            Phone Number <span className="text-ink-light font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-light">
              🇮🇳
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="98765 43210"
              className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
            />
          </div>
          {state?.errors?.phone && (
            <p className="text-xs text-red-600 mt-1">{state.errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-ink-mid mb-1">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.password && (
            <p className="text-xs text-red-600 mt-1">{state.errors.password}</p>
          )}
        </div>

        {/* Specialties */}
        <div>
          <label htmlFor="specialties" className="block text-xs font-medium text-ink-mid mb-1">
            Specialisation(s) *
          </label>
          <select
            id="specialties"
            name="specialties"
            required
            multiple
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all min-h-[100px]"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-ink-light mt-1">
            Hold Cmd/Ctrl to select multiple specialties.
          </p>
          {state?.errors?.specialties && (
            <p className="text-xs text-red-600 mt-1">{state.errors.specialties}</p>
          )}
        </div>

        {/* License Number */}
        <div>
          <label htmlFor="licenseNo" className="block text-xs font-medium text-ink-mid mb-1">
            License / Registration Number *
          </label>
          <input
            id="licenseNo"
            name="licenseNo"
            type="text"
            required
            placeholder="HP-MCI-2024-001"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.licenseNo && (
            <p className="text-xs text-red-600 mt-1">{state.errors.licenseNo}</p>
          )}
        </div>

        {/* License Document Upload */}
        <div>
          <label htmlFor="licenseDoc" className="block text-xs font-medium text-ink-mid mb-1">
            License Document <span className="text-ink-light font-normal">(PDF or Image, max 5 MB)</span>
          </label>
          <input
            id="licenseDoc"
            name="licenseDoc"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full text-sm text-ink-mid file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-light file:text-teal-dark hover:file:bg-teal-light/80 cursor-pointer"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Registering...
            </>
          ) : (
            "Submit Registration"
          )}
        </button>
      </form>

      {/* Alternative actions */}
      <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
        <p className="text-xs text-ink-mid">
          Already registered?{" "}
          <Link href="/auth/doctor/login" className="font-medium text-teal hover:underline no-underline">
            Doctor Login
          </Link>
        </p>
        <p className="text-xs text-ink-mid">
          Are you a patient?{" "}
          <Link href="/auth/signup" className="font-medium text-amber hover:underline no-underline">
            Patient Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
