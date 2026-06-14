import { getAuthenticatedPatient } from "@/lib/get-patient";
import Link from "next/link";

export const dynamic = "force-dynamic";


export default async function PatientDashboardPage() {
  const { supabase, profile } = await getAuthenticatedPatient();

  const patientName = profile?.name || "Patient";
  const firstName = patientName.split(" ")[0];

  // Fetch upcoming appointments (next 3)
  let upcomingAppointments: {
    id: string;
    slot_start: string;
    slot_end: string;
    status: string;
    reason: string | null;
    video_url: string | null;
    doctor_profiles: { name: string; specialties: string[]; avatar_url: string | null } | null;
  }[] = [];

  if (profile) {
    const { data: appointments } = await supabase
      .from("appointments")
      .select(
        "id, slot_start, slot_end, status, reason, video_url, doctor_profiles(name, specialties, avatar_url)"
      )
      .eq("patient_id", profile.id)
      .in("status", ["PENDING", "CONFIRMED"])
      .order("slot_start", { ascending: true })
      .limit(10); // Fetch a bit more in case we filter some out

    if (appointments) {
      const threshold = Date.now() - 4 * 60 * 60 * 1000; // 4 hours ago
      upcomingAppointments = appointments
        .filter((appt) => new Date(appt.slot_end).getTime() > threshold)
        .slice(0, 3) as typeof upcomingAppointments;
    }
  }

  // Fetch recent records count
  let recordsCount = 0;
  if (profile) {
    const { count } = await supabase
      .from("medical_records")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", profile.id);
    recordsCount = count || 0;
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-light text-amber",
    CONFIRMED: "bg-green-50 text-green-700",
    COMPLETED: "bg-blue-50 text-blue-700",
    DECLINED: "bg-red-50 text-red-600",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Here&apos;s an overview of your healthcare activity.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            href: "/doctors",
            icon: "🔍",
            label: "Find a Doctor",
            bg: "bg-teal-light",
          },
          {
            href: "/records",
            icon: "📁",
            label: "Upload Record",
            bg: "bg-amber-light",
          },
          {
            href: "/appointments",
            icon: "📅",
            label: "My Appointments",
            bg: "bg-blue-50",
          },
          {
            href: "/profile",
            icon: "👤",
            label: "Edit Profile",
            bg: "bg-purple-50",
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`${action.bg} rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all no-underline group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="text-xs font-medium text-ink-mid text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-semibold text-teal">
            {upcomingAppointments.length}
          </p>
          <p className="text-[10px] text-ink-light mt-0.5">Upcoming</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-semibold text-amber">{recordsCount}</p>
          <p className="text-[10px] text-ink-light mt-0.5">Records</p>
        </div>
        <Link href="/appointments?tab=past" className="bg-white rounded-xl border border-border p-4 text-center hover:shadow-md transition-shadow no-underline block group">
          <p className="text-2xl font-semibold text-ink-mid group-hover:text-teal transition-colors">—</p>
          <p className="text-[10px] text-ink-light mt-0.5">Past Consults</p>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Upcoming Appointments
          </h2>
          <Link
            href="/appointments"
            className="text-xs text-teal font-medium hover:underline no-underline"
          >
            View all →
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-sm text-ink-mid font-medium">
              No upcoming appointments
            </p>
            <p className="text-xs text-ink-light mt-1 mb-4">
              Find a doctor and book your first consultation.
            </p>
            <Link
              href="/doctors"
              className="inline-block px-4 py-2 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal-dark transition-colors no-underline"
            >
              Find a Doctor
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => {
              const doctor = appt.doctor_profiles;
              const date = new Date(appt.slot_start);
              const timeStr = date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = date.toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-xl border border-border p-4 flex items-center gap-4"
                >
                  {/* Doctor info */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-light text-teal font-semibold text-sm flex items-center justify-center">
                    {doctor?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2) || "Dr"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {doctor?.name || "Doctor"}
                    </p>
                    <p className="text-xs text-ink-light">
                      {doctor?.specialties?.join(", ") || "General"}
                    </p>
                    <p className="text-xs text-ink-mid mt-0.5">
                      {dateStr} at {timeStr}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[appt.status] || "bg-gray-100 text-gray-500"}`}
                    >
                      {appt.status}
                    </span>
                    {appt.status === "CONFIRMED" && (
                      <Link
                        href={`/video-room/${appt.id}`}
                        className="text-[10px] px-2 py-1 bg-teal/10 rounded-md text-teal font-semibold hover:bg-teal hover:text-white transition-colors no-underline"
                      >
                        Join Call →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
