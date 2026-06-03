"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginWithEmail, loginWithOtp } from "./actions";

export default function PatientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");

  // Email form action state
  const [emailState, emailAction, isEmailPending] = useActionState(loginWithEmail, null);
  // OTP form action state
  const [otpState, otpAction, isOtpPending] = useActionState(loginWithOtp, null);

  // Handle successful email login
  useEffect(() => {
    if (emailState?.success) {
      router.push(redirectTo);
      router.refresh();
    }
  }, [emailState, router, redirectTo]);

  // Handle successful OTP trigger
  useEffect(() => {
    if (otpState?.success && otpState.phone) {
      router.push(`/auth/verify-otp?phone=${encodeURIComponent(otpState.phone)}&type=login&redirectTo=${encodeURIComponent(redirectTo)}`);
    }
  }, [otpState, router, redirectTo]);

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-semibold text-ink">
          Log in to Aarogya
        </h2>
        <p className="text-sm text-ink-mid mt-1.5">
          Access your telemedicine appointments and records
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("phone")}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "phone"
              ? "border-teal text-teal"
              : "border-transparent text-ink-light hover:text-ink-mid"
          }`}
        >
          📱 Phone &amp; OTP
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex-1 pb-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "email"
              ? "border-teal text-teal"
              : "border-transparent text-ink-light hover:text-ink-mid"
          }`}
        >
          ✉️ Email &amp; Password
        </button>
      </div>

      {/* ── TAB 1: PHONE OTP LOGIN ── */}
      {activeTab === "phone" && (
        <form action={otpAction} className="space-y-4">
          {otpState?.message && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {otpState.message}
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-xs font-medium text-ink-mid mb-1">
              Registered Phone Number
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
            {otpState?.errors?.phone && (
              <p className="text-xs text-red-600 mt-1">{otpState.errors.phone}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isOtpPending}
            className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isOtpPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      )}

      {/* ── TAB 2: EMAIL PASSWORD LOGIN ── */}
      {activeTab === "email" && (
        <form action={emailAction} className="space-y-4">
          {emailState?.message && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {emailState.message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-ink-mid mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
            />
            {emailState?.errors?.email && (
              <p className="text-xs text-red-600 mt-1">{emailState.errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-xs font-medium text-ink-mid">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-teal hover:underline no-underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
            />
            {emailState?.errors?.password && (
              <p className="text-xs text-red-600 mt-1">{emailState.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isEmailPending}
            className="w-full py-2.5 px-4 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isEmailPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      )}

      {/* Switch actions */}
      <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
        <p className="text-xs text-ink-mid">
          New to Aarogya?{" "}
          <Link href="/auth/signup" className="font-medium text-teal hover:underline no-underline">
            Sign up for free
          </Link>
        </p>
        <p className="text-xs text-ink-mid">
          Are you a provider?{" "}
          <Link href="/auth/doctor/login" className="font-medium text-amber hover:underline no-underline">
            Doctor Login
          </Link>
        </p>
      </div>
    </div>
  );
}
