import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Unauthorized — Aarogya",
  description: "You do not have permission to access this page.",
};

export default async function UnauthorizedPage() {
  let role: string | null = null;
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        isAuthenticated = true;
        role =
          user.user_metadata?.role ||
          user.app_metadata?.role ||
          null;
        if (!role) {
          const { data: userData } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          role = userData?.role ?? null;
        }
      }
    }
  } catch {
    // ignore — show generic unauthorized
  }

  const dashboardUrl =
    role === "DOCTOR"
      ? "/doctor/dashboard"
      : role === "ADMIN"
        ? "/admin/approvals"
        : "/dashboard";

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Shield icon */}
        <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-ink mb-3">
          Access Denied
        </h1>
        <p className="text-ink-mid text-base mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. This area requires
          a different role than your current account.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              href={dashboardUrl}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal hover:bg-teal-dark text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-150 no-underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal hover:bg-teal-dark text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-150 no-underline"
            >
              Sign In
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-cream border border-border text-ink text-sm font-medium rounded-lg transition-colors duration-150 no-underline"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
