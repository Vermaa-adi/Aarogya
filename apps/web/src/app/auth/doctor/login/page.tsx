"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginDoctor } from "./actions";

export default function DoctorLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginDoctor, null);

  useEffect(() => {
    if (state?.success) {
      if (state.isVerified) {
        router.push("/doctor/dashboard");
      } else {
        router.push("/doctor/verification-pending");
      }
    }
  }, [state, router]);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Doctor Login
        </h2>
        <p className="text-sm text-ink-mid mt-1.5">
          Sign in to your Aarogya doctor portal
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state?.message && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {state.message}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-ink-mid mb-1">
            Email Address
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

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-ink-mid mb-1">
            Password
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

        {/* Forgot Password */}
        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-xs text-teal hover:underline no-underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Alternative actions */}
      <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
        <p className="text-xs text-ink-mid">
          Don&apos;t have an account?{" "}
          <Link href="/auth/doctor/signup" className="font-medium text-teal hover:underline no-underline">
            Register as Doctor
          </Link>
        </p>
        <p className="text-xs text-ink-mid">
          Are you a patient?{" "}
          <Link href="/auth/login" className="font-medium text-amber hover:underline no-underline">
            Patient Login
          </Link>
        </p>
      </div>
    </div>
  );
}
