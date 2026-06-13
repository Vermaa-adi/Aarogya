import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RequestsClient from "./requests-client";

export const dynamic = "force-dynamic";


export default async function DoctorRequestsPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/doctor/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/doctor/login");

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_verified) {
    redirect("/doctor/verification-pending");
  }

  // Fetch pending requests
  const { data: requests } = await supabase
    .from("appointments")
    .select(`
      id,
      slot_start,
      reason,
      patient_profiles(name, avatar_url)
    `)
    .eq("doctor_id", profile.id)
    .eq("status", "PENDING")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Appointment Requests
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Review and accept or decline incoming patient consultation requests.
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RequestsClient requests={(requests || []) as any[]} />
    </div>
  );
}
