import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    let role = user.user_metadata?.role || user.app_metadata?.role;
    if (!role) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      role = userData?.role;
    }

    if (role === "DOCTOR") {
      redirect("/doctor/dashboard");
    } else if (role === "ADMIN") {
      redirect("/admin/approvals");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-off-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-[38px] h-[38px] bg-teal rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <circle cx="9" cy="9" r="7.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>
            <span className="font-serif text-2xl font-medium text-ink">Aarogya</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-2xl sm:px-10 border border-border">
          {children}
        </div>
      </div>
    </div>
  );
}
