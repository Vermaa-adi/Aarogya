import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ConsultFormClient from "./consult-form";

export const dynamic = "force-dynamic";


export default async function ConsultationPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const appointmentId = params.id;
  const supabase = await createClient();
  
  if (!supabase) redirect("/auth/doctor/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/doctor/login");

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_verified) redirect("/doctor/verification-pending");

  // Fetch appointment details along with patient info
  const { data: appointment } = await supabase
    .from("appointments")
    .select(`
      *,
      patient_profiles (
        id,
        name,
        avatar_url,
        users (email)
      )
    `)
    .eq("id", appointmentId)
    .eq("doctor_id", profile.id)
    .single();

  if (!appointment) redirect("/doctor/dashboard");

  const patient = appointment.patient_profiles as { id: string; name: string; avatar_url: string | null; users: { email: string } | null } | null;
  
  if (!patient) redirect("/doctor/dashboard");

  // Fetch patient medical records
  const { data: records } = await supabase
    .from("medical_records")
    .select("*")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });

  // Fetch existing consult notes
  const { data: existingNotes } = await supabase
    .from("consult_notes")
    .select("*")
    .eq("appointment_id", appointmentId)
    .single();

  const isCompleted = appointment.status === "COMPLETED";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/doctor/dashboard" className="text-sm font-medium text-teal hover:underline no-underline">
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-ink">
            Consultation Workspace
          </h1>
        </div>
        
        {appointment.video_url && !isCompleted && (
          <a
            href={appointment.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg shadow-sm hover:bg-teal-dark transition-colors no-underline"
          >
            <span>📹</span> Join Video Call
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Info & Records */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Card */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-4">Patient Details</h2>
            <div className="flex items-center gap-4 mb-4">
              {patient?.avatar_url ? (
                <img src={patient.avatar_url} alt={patient.name} className="w-14 h-14 rounded-full object-cover border border-border" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-teal-light text-teal font-bold text-lg flex items-center justify-center">
                  {patient?.name?.[0] || "P"}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-ink text-base">{patient?.name || "Patient"}</h3>
                <p className="text-xs text-ink-mid">{patient?.users?.email || "No email"}</p>
              </div>
            </div>

            <div className="bg-off-white rounded-lg p-3 text-xs space-y-2">
              <p><span className="text-ink-light">Reason for visit:</span> <span className="font-medium text-ink">{appointment.reason || "Not specified"}</span></p>
              <p><span className="text-ink-light">Slot:</span> <span className="font-medium text-ink">{new Date(appointment.slot_start).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span></p>
            </div>
          </div>

          {/* Medical Records */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h2 className="text-xs font-semibold text-ink-mid uppercase tracking-wider mb-4">Past Medical Records</h2>
            {records && records.length > 0 ? (
              <div className="space-y-3">
                {records.map(record => (
                  <div key={record.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-teal/50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium text-ink">{record.description || "Medical Record"}</h4>
                      <p className="text-[10px] text-ink-light">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <a
                      href={record.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-teal hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-light text-center py-4 bg-off-white rounded-lg">
                No medical records found for this patient.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Consultation Notes Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-border p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-serif text-xl font-semibold text-ink">Clinical Notes</h2>
              <p className="text-xs text-ink-mid mt-1">
                Record your diagnosis, notes, and treatment plan. These notes are saved securely.
              </p>
            </div>

            <ConsultFormClient 
              appointmentId={appointmentId} 
              patientId={patient.id} 
              initialData={existingNotes ? {
                notes: existingNotes.notes,
                diagnosis: existingNotes.diagnosis,
                prescription: existingNotes.prescription
              } : null}
              isCompleted={isCompleted}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
