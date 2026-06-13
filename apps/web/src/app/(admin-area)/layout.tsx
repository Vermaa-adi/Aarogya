import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verify role
  let role = user.user_metadata?.role || user.app_metadata?.role;
  if (!role) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    role = userData?.role;
  }

  if (role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-40 bg-slate-900 text-slate-100 shadow-md">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Logo */}
          <Link href="/admin/approvals" className="flex items-center gap-2 no-underline">
            <span className="text-xl">🛡️</span>
            <span className="font-serif font-semibold text-white tracking-tight">
              Aarogya Admin
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              href="/admin/approvals"
              className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors no-underline"
            >
              Doctor Approvals
            </Link>
          </nav>

          {/* User logout */}
          <div className="flex items-center gap-3">
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Sign out"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
