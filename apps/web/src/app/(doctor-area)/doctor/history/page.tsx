import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";


export default async function DoctorHistoryPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/doctor/login");
  }

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_verified) {
    redirect("/doctor/verification-pending");
  }

  // Fetch all completed appointments with notes for this doctor
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      slot_start,
      slot_end,
      status,
      reason,
      patient_profiles(name, avatar_url, user_id),
      consult_notes(diagnosis, notes, prescription)
    `)
    .eq("doctor_id", profile.id)
    .eq("status", "COMPLETED")
    .order("slot_start", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Consultation History
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Review your past appointments, clinical notes, and prescriptions.
        </p>
      </div>

      {!appointments || appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
          <p className="text-sm text-ink-mid font-medium">
            No completed consultations found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const patient = appt.patient_profiles as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawNotes = appt.consult_notes as any;
            const notes = Array.isArray(rawNotes) ? rawNotes[0] : rawNotes;
            const date = new Date(appt.slot_start);
            const dateStr = date.toLocaleDateString("en-IN", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const timeStr = date.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={appt.id} className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {patient?.avatar_url ? (
                      <img
                        src={patient.avatar_url}
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-light text-teal font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {patient?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "P"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-ink text-sm">
                        {patient?.name || "Patient"}
                      </h3>
                      <p className="text-xs font-medium text-ink-mid mt-0.5">
                        Consulted on: {dateStr} at {timeStr}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    href={`/doctor/appointments/${appt.id}/patient`}
                    className="px-4 py-2 bg-off-white hover:bg-gray-100 border border-border text-ink-mid hover:text-ink text-xs font-medium rounded-lg transition-colors no-underline"
                  >
                    View Details & Notes
                  </Link>
                </div>

                {appt.reason && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-ink-mid">Patient's Stated Reason:</p>
                    <p className="text-sm text-ink">{appt.reason}</p>
                  </div>
                )}

                {notes ? (
                  <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-teal-dark border-b border-teal-200 pb-1 text-xs">
                      Consultation Notes & Feedback
                    </h4>
                    {notes.diagnosis && (
                      <p className="text-sm text-ink">
                        <span className="font-medium">Diagnosis:</span> {notes.diagnosis}
                      </p>
                    )}
                    {notes.prescription && (
                      <div className="text-sm text-ink whitespace-pre-wrap">
                        <span className="font-medium block mb-1">Prescription/Plan:</span>
                        {notes.prescription}
                      </div>
                    )}
                    {notes.notes && (
                      <div className="text-sm text-ink whitespace-pre-wrap">
                        <span className="font-medium block mb-1">Clinical Notes (Private):</span>
                        {notes.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                    <span className="font-medium">Missing Details:</span> You haven't added clinical notes or a prescription for this consultation yet. Click "View Details & Notes" to add them.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
