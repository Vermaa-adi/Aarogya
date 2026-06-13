import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StartCallButton from "./start-call-button";

export const dynamic = "force-dynamic";

export default async function DoctorDashboardPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/doctor/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/doctor/login");

  const { data: profile } = await supabase
    .from("doctor_profiles")
    .select("id, name, is_verified")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_verified) {
    redirect("/doctor/verification-pending");
  }

  // Get all active appointments
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, slot_start, slot_end, status, reason, video_url, patient_profiles(name, user_id)")
    .eq("doctor_id", profile.id)
    .in("status", ["PENDING", "CONFIRMED"])
    .order("slot_start", { ascending: true });

  const pendingRequests = appointments?.filter(a => a.status === "PENDING") || [];
  
  const todayStr = new Date().toISOString().split("T")[0];
  const todaysConfirmed = appointments?.filter(a => 
    a.status === "CONFIRMED" && a.slot_start.startsWith(todayStr)
  ).sort((a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()) || [];

  // All upcoming confirmed appointments (including today)
  const now = new Date().toISOString();
  const upcomingConfirmed = appointments?.filter(a => 
    a.status === "CONFIRMED" && a.slot_start >= now
  ).sort((a, b) => new Date(a.slot_start).getTime() - new Date(b.slot_start).getTime()) || [];

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-light text-amber",
    CONFIRMED: "bg-green-50 text-green-700",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
          Welcome, {profile.name}
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Here is your overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats & Quick Actions */}
        <div className="md:col-span-1 space-y-6">
          {/* Action Required */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-light/30 border border-amber/20 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-amber-dark font-semibold text-sm">Action Required</span>
                <span className="bg-amber text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              </div>
              <p className="text-xs text-ink-mid mb-3">
                You have {pendingRequests.length} new appointment request(s) waiting for review.
              </p>
              <Link
                href="/doctor/requests"
                className="inline-block px-3 py-1.5 bg-amber hover:bg-amber-dark text-white text-xs font-medium rounded-lg transition-colors no-underline"
              >
                Review Requests →
              </Link>
            </div>
          )}

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border bg-off-white/50">
              <h2 className="text-sm font-semibold text-ink">Quick Links</h2>
            </div>
            <div className="divide-y divide-border">
              <Link href="/doctor/profile" className="block p-4 hover:bg-off-white transition-colors no-underline group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <div>
                      <p className="text-sm font-medium text-ink group-hover:text-teal transition-colors">Update Availability</p>
                      <p className="text-[10px] text-ink-light">Manage your weekly schedule</p>
                    </div>
                  </div>
                  <span className="text-ink-light group-hover:text-teal transition-colors">→</span>
                </div>
              </Link>
              <Link href="/doctor/requests" className="block p-4 hover:bg-off-white transition-colors no-underline group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👥</span>
                    <div>
                      <p className="text-sm font-medium text-ink group-hover:text-teal transition-colors">Appointment Requests</p>
                      <p className="text-[10px] text-ink-light">Accept or decline requests</p>
                    </div>
                  </div>
                  <span className="text-ink-light group-hover:text-teal transition-colors">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-border flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">Today&apos;s Schedule</h2>
              <span className="text-xs font-medium text-ink-mid bg-off-white px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <div className="p-5">
              {todaysConfirmed.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <span className="text-4xl mb-3">☕️</span>
                  <p className="text-sm text-ink-mid font-medium">No appointments today</p>
                  <p className="text-xs text-ink-light mt-1">Your schedule is clear.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaysConfirmed.map(appt => {
                    const patient = appt.patient_profiles as { name: string; user_id: string } | null;
                    const date = new Date(appt.slot_start);
                    const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                    
                    return (
                      <div key={appt.id} className="flex gap-4">
                        <div className="w-20 pt-1 text-right flex-shrink-0">
                          <p className="text-sm font-medium text-ink">{timeStr}</p>
                          <p className="text-[10px] text-ink-light">30 min</p>
                        </div>
                        <div className="flex-1 bg-off-white border border-border rounded-xl p-4 flex items-center justify-between group hover:border-teal/50 transition-colors">
                          <div>
                            <p className="text-sm font-semibold text-ink group-hover:text-teal transition-colors">
                              {patient?.name || "Patient"}
                            </p>
                            <p className="text-xs text-ink-mid mt-0.5">Video Consultation</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/doctor/appointments/${appt.id}/patient`}
                              className="text-xs font-medium text-ink-mid hover:text-ink no-underline"
                            >
                              Details
                            </Link>
                            <StartCallButton
                              appointmentId={appt.id}
                              patientUserId={patient?.user_id || ""}
                              doctorName={profile.name}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl border border-border flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">Upcoming Appointments</h2>
              <span className="text-xs font-medium text-teal bg-teal-light px-3 py-1 rounded-full">
                {upcomingConfirmed.length} upcoming
              </span>
            </div>

            <div className="p-5">
              {upcomingConfirmed.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <span className="text-3xl mb-2">📋</span>
                  <p className="text-sm text-ink-mid font-medium">No upcoming appointments</p>
                  <p className="text-xs text-ink-light mt-1">Check back later for new bookings.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingConfirmed.map(appt => {
                    const patient = appt.patient_profiles as { name: string; user_id: string } | null;
                    const date = new Date(appt.slot_start);
                    const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
                    const dateStr = date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
                    const isToday = date.toISOString().split("T")[0] === todayStr;
                    
                    return (
                      <div key={appt.id} className="bg-off-white border border-border rounded-xl p-4 flex items-center justify-between hover:border-teal/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-teal-light text-teal font-semibold text-sm flex items-center justify-center flex-shrink-0">
                            {patient?.name?.split(" ").map(n => n[0]).join("").slice(0,2) || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {patient?.name || "Patient"}
                            </p>
                            <p className="text-xs text-ink-mid mt-0.5">
                              {dateStr} at {timeStr}
                              {appt.reason && <span className="text-ink-light"> — {appt.reason}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isToday ? (
                            <StartCallButton
                              appointmentId={appt.id}
                              patientUserId={patient?.user_id || ""}
                              doctorName={profile.name}
                            />
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[appt.status] || "bg-gray-100 text-gray-500"}`}>
                              {appt.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
