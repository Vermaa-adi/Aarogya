"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAdmin } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/admin/approvals");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-semibold text-slate-900 tracking-tight">
          Admin Login
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Access the administrator verification dashboard.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-8">
          <form action={formAction} className="space-y-5">
            {state?.message && !state.success && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {state.message}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Work Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="admin@aarogya.com"
              />
              {state?.errors?.email && (
                <p className="mt-1.5 text-xs text-red-500">
                  {state.errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
              {state?.errors?.password && (
                <p className="mt-1.5 text-xs text-red-500">
                  {state.errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? "Signing in..." : "Sign in to Dashboard"}
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100 flex flex-col gap-2">
          <p className="text-sm text-slate-600">
            Don&apos;t have an admin account?{" "}
            <Link
              href="/auth/admin/signup"
              className="font-medium text-slate-900 hover:underline"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
