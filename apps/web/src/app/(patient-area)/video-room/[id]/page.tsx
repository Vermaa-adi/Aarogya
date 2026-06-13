import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import VideoRoomClient from "@/components/video-room-client";

export const dynamic = "force-dynamic";


export default async function VideoRoomPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const appointmentId = params.id;
  
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch appointment to ensure it exists and user is authorized
  const { data: appointment } = await supabase
    .from("appointments")
    .select(`
      id, 
      status, 
      patient_id, 
      doctor_id,
      patient_profiles!inner(name),
      doctor_profiles!inner(name, specialties)
    `)
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    redirect("/dashboard");
  }

  // Ensure it is confirmed or completed (not pending or cancelled)
  if (appointment.status === "PENDING" || appointment.status === "CANCELLED" || appointment.status === "DECLINED") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-serif text-ink font-semibold">Call Unavailable</h1>
        <p className="text-ink-mid mt-2 mb-6">This appointment is {appointment.status.toLowerCase()}. You cannot join a call for this appointment.</p>
        <Link href="/dashboard" className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors no-underline inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const doctorName = appointment.doctor_profiles?.name || "Doctor";
  const doctorSpecialties = appointment.doctor_profiles?.specialties?.join(", ") || "General";
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/dashboard" className="text-xs text-teal font-medium hover:underline no-underline inline-flex items-center gap-1 mb-2">
          ← Back to Dashboard
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Consultation with {doctorName}
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          {doctorSpecialties}
        </p>
      </div>

      <div className="bg-ink rounded-2xl overflow-hidden shadow-xl border border-border">
        <VideoRoomClient remoteName={doctorName} role="patient" appointmentId={appointmentId} />
      </div>
    </div>
  );
}
