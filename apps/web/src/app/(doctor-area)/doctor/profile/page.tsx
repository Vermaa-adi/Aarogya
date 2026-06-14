import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DoctorProfileForm from "./profile-form";

export const dynamic = "force-dynamic";


export default async function DoctorProfilePage() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/doctor/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/doctor/login");

  // Fetch full profile data
  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select(`
      *,
      users (email)
    `)
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/auth/doctor/login");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Doctor Profile
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Manage your public information and weekly availability.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
        <DoctorProfileForm profile={profile} />
      </div>
    </div>
  );
}
