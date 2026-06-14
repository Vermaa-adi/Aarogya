import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";


export default async function VerificationPendingPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/doctor/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/doctor/login");

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("is_verified")
    .eq("user_id", user.id)
    .single();

  if (profile?.is_verified) {
    redirect("/doctor/dashboard");
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-2xl border border-border p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-light rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">⏳</span>
        </div>
        
        <h1 className="font-serif text-2xl font-semibold text-ink mb-2">
          Verification Pending
        </h1>
        
        <p className="text-sm text-ink-mid mb-6 leading-relaxed">
          Your application to join Aarogya as a healthcare provider is currently under review. Our administration team is verifying your medical license and credentials.
        </p>

        <div className="bg-off-white rounded-xl p-4 text-left mb-6">
          <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">What happens next?</h3>
          <ul className="text-xs text-ink-mid space-y-2">
            <li className="flex gap-2">
              <span className="text-teal">✓</span> We verify your state medical council registration.
            </li>
            <li className="flex gap-2">
              <span className="text-teal">✓</span> We review your uploaded license document.
            </li>
            <li className="flex gap-2">
              <span className="text-teal">✓</span> You will receive an email once approved.
            </li>
          </ul>
        </div>

        <p className="text-xs text-ink-light mb-6">
          This usually takes 1-2 business days.
        </p>

        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full py-2.5 px-4 border border-border hover:bg-off-white text-ink-mid font-medium text-sm rounded-lg transition-colors duration-150 cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
