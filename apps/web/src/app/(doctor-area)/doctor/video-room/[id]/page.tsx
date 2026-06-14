import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import VideoRoomClient from "@/components/video-room-client";

export const dynamic = "force-dynamic";


export default async function DoctorVideoRoomPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const appointmentId = params.id;
  
  const supabase = await createClient();
  if (!supabase) redirect("/auth/doctor/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/doctor/login");

  // Fetch appointment and verify the doctor owns it
  const { data: doctorProfile } = await supabase
    .from("doctor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!doctorProfile) redirect("/doctor/dashboard");

  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, status, doctor_id, patient_profiles(name)")
    .eq("id", appointmentId)
    .eq("doctor_id", doctorProfile.id)
    .single();

  if (!appointment) {
    redirect("/doctor/dashboard");
  }

  if (appointment.status !== "CONFIRMED") {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-serif text-ink font-semibold">Call Unavailable</h1>
        <p className="text-ink-mid mt-2 mb-6">This appointment is {appointment.status.toLowerCase()}. You can only start calls for confirmed appointments.</p>
        <Link href="/doctor/dashboard" className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal-dark transition-colors no-underline inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const patientName = (appointment.patient_profiles as { name: string } | null)?.name || "Patient";
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/doctor/dashboard" className="text-xs text-teal font-medium hover:underline no-underline inline-flex items-center gap-1 mb-2">
          ← Back to Dashboard
        </Link>
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Consultation with {patientName}
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          You are the host of this video consultation.
        </p>
      </div>

      <div className="bg-ink rounded-2xl overflow-hidden shadow-xl border border-border">
        <VideoRoomClient remoteName={patientName} role="doctor" appointmentId={appointmentId} />
      </div>
    </div>
  );
}
