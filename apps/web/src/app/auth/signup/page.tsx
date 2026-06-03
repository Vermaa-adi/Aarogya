"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpPatient } from "./actions";

export default function PatientSignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpPatient, null);

  useEffect(() => {
    if (state?.success && state.phone) {
      // Redirect to OTP verification page
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(state.phone)}&type=signup`);
    }
  }, [state, router]);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Create Patient Account
        </h2>
        <p className="text-sm text-ink-mid mt-1.5">
          Sign up to connect with verified doctors in Himachal Pradesh
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
            placeholder="Dr. Y.S. Parmar"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.fullName && (
            <p className="text-xs text-red-600 mt-1">{state.errors.fullName}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-xs font-medium text-ink-mid mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-light">
              🇮🇳
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="98765 43210"
              className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
            />
          </div>
          <p className="text-[10px] text-ink-light mt-1">
            Country code +91 will be added automatically if omitted.
          </p>
          {state?.errors?.phone && (
            <p className="text-xs text-red-600 mt-1">{state.errors.phone}</p>
          )}
        </div>

        {/* Email Address (Optional) */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-ink-mid mb-1">
            Email Address <span className="text-ink-light font-normal">(Optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.errors.email}</p>
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

        {/* DPDP Act Consent Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-border text-teal focus:ring-teal"
          />
          <label htmlFor="consent" className="text-xs text-ink-mid leading-normal select-none">
            I consent to Aarogya storing my name, contact number, and uploaded health records securely. I understand this platform is not for emergencies.
          </label>
        </div>
        {state?.errors?.consent && (
          <p className="text-xs text-red-600 mt-0.5">{state.errors.consent}</p>
        )}

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
              Sending OTP...
            </>
          ) : (
            "Verify Phone & Sign Up"
          )}
        </button>
      </form>

      {/* Alternative actions */}
      <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
        <p className="text-xs text-ink-mid">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-teal hover:underline no-underline">
            Log in
          </Link>
        </p>
        <p className="text-xs text-ink-mid">
          Are you a provider?{" "}
          <Link href="/auth/doctor/signup" className="font-medium text-amber hover:underline no-underline">
            Register as a Doctor
          </Link>
        </p>
      </div>
    </div>
  );
}
