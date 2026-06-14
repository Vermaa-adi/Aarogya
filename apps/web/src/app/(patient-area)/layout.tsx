import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import RealtimeNotifications from "@/components/realtime-notifications";

export default async function PatientAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  if (role !== "PATIENT") {
    redirect("/unauthorized");
  }

  // Fetch patient profile for sidebar/navbar
  let { data: profile } = await supabase
    .from("patient_profiles")
    .select("id, name, avatar_url")
    .eq("user_id", user.id)
    .single();

  // Auto-heal: If profile doesn't exist, create it (handles trigger bypass failures)
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("patient_profiles")
      .insert({
        user_id: user.id,
        name: user.user_metadata?.name || user.user_metadata?.full_name || "Patient",
      })
      .select("id, name, avatar_url")
      .single();
    if (newProfile) profile = newProfile;
  }

  const patientName = profile?.name || user.user_metadata?.name || "Patient";
  const avatarUrl = profile?.avatar_url || null;
  const initials = patientName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-off-white">
      <Toaster />
      <RealtimeNotifications userId={user.id} role="PATIENT" profileId={profile?.id} />
      {/* ── Top Navbar ── */}
      <header className="sticky top-[36px] z-40 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 no-underline">
            <span className="text-xl">🩺</span>
            <span className="font-serif font-semibold text-teal text-lg tracking-tight">
              Aarogya
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden sm:flex items-center gap-1">
            {[
              { href: "/dashboard", label: "Dashboard", icon: "📊" },
              { href: "/doctors", label: "Find Doctors", icon: "🔍" },
              { href: "/appointments", label: "Appointments", icon: "📅" },
              { href: "/appointments?tab=past", label: "History", icon: "⏱️" },
              { href: "/records", label: "Records", icon: "📁" },
              { href: "/profile", label: "Profile", icon: "👤" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-ink-mid hover:text-teal hover:bg-teal-light rounded-lg transition-colors no-underline"
              >
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User avatar + logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={patientName}
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-light text-teal font-semibold text-xs flex items-center justify-center">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-xs font-medium text-ink-mid">
                {patientName}
              </span>
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-ink-light hover:text-red-600 transition-colors cursor-pointer"
                title="Sign out"
              >
                ↗ Logout
              </button>
            </form>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden flex items-center gap-0.5 px-3 pb-2 overflow-x-auto">
          {[
            { href: "/dashboard", label: "Home", icon: "📊" },
            { href: "/doctors", label: "Doctors", icon: "🔍" },
            { href: "/appointments", label: "Appts", icon: "📅" },
            { href: "/appointments?tab=past", label: "History", icon: "⏱️" },
            { href: "/records", label: "Records", icon: "📁" },
            { href: "/profile", label: "Profile", icon: "👤" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex-shrink-0 px-2.5 py-1 text-[10px] font-medium text-ink-mid hover:text-teal hover:bg-teal-light rounded-md transition-colors no-underline"
            >
              <span className="mr-0.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Page content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
