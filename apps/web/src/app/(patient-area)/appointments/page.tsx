import { getAuthenticatedPatient } from "@/lib/get-patient";
import AppointmentsClient from "./appointments-client";

export const dynamic = "force-dynamic";


export default async function AppointmentsPage(props: { searchParams: Promise<{ booked?: string; tab?: string }> }) {
  const { supabase, profile } = await getAuthenticatedPatient();

  // Fetch all appointments for the patient
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      slot_start,
      slot_end,
      status,
      reason,
      video_url,
      doctor_id,
      doctor_profiles(name, specialties, avatar_url),
      ratings(id),
      consult_notes(diagnosis, notes, prescription)
    `)
    .eq("patient_id", profile.id)
    .order("slot_start", { ascending: false });

  const searchParams = await props.searchParams;
  const justBooked = searchParams.booked === "true";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          My Appointments
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Manage your upcoming consultations and view past history.
        </p>
      </div>

      {justBooked && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-start gap-3">
          <span className="text-green-600 text-lg mt-0.5">✓</span>
          <div>
            <h3 className="text-sm font-semibold">Appointment Requested Successfully</h3>
            <p className="text-xs mt-0.5">
              Your request has been sent to the doctor. You will be notified once it is confirmed.
            </p>
          </div>
        </div>
      )}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <AppointmentsClient appointments={(appointments || []) as any[]} initialTab={searchParams.tab as "upcoming" | "past" | undefined} />
    </div>
  );
}
