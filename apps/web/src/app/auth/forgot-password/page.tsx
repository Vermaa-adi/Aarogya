"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    null
  );

  return (
    <div>
      <div className="text-center mb-6">
        <div className="mx-auto w-14 h-14 bg-amber/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Reset Password
        </h2>
        <p className="text-sm text-ink-mid mt-1.5">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {/* Success message */}
        {state?.success && state.message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            {state.message}
          </div>
        )}

        {/* Error message */}
        {state && !state.success && state.message && (
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
            placeholder="you@example.com"
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
          {state?.errors?.email && (
            <p className="text-xs text-red-600 mt-1">{state.errors.email}</p>
          )}
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
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {/* Back links */}
      <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
        <p className="text-xs text-ink-mid">
          Remember your password?{" "}
          <Link href="/auth/login" className="font-medium text-teal hover:underline no-underline">
            Patient Login
          </Link>
        </p>
        <p className="text-xs text-ink-mid">
          <Link href="/auth/doctor/login" className="font-medium text-teal hover:underline no-underline">
            Doctor Login
          </Link>
        </p>
      </div>
    </div>
  );
}
