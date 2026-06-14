"use client";

import { useState, useTransition, useActionState } from "react";
import { cancelAppointment, submitRating } from "./actions";
import Link from "next/link";

type AppointmentData = {
  id: string;
  slot_start: string;
  slot_end: string;
  status: string;
  reason: string | null;
  video_url: string | null;
  doctor_id: string;
  doctor_profiles: { name: string; specialties: string[]; avatar_url: string | null } | null;
  ratings: { id: string }[];
  consult_notes?: { diagnosis: string | null; notes: string | null; prescription: string | null }[] | null;
};

export default function AppointmentsClient({ appointments, initialTab }: { appointments: AppointmentData[]; initialTab?: "upcoming" | "past" }) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">(initialTab || "upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isPendingCancel, startCancelTransition] = useTransition();

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setCancellingId(id);
    startCancelTransition(async () => {
      const res = await cancelAppointment(id);
      if (!res.success) {
        alert(res.message);
      }
      setCancellingId(null);
    });
  };

  const now = new Date().getTime();
  const threshold = now - 4 * 60 * 60 * 1000; // 4 hours ago

  const upcoming = appointments.filter((a) => {
    if (["COMPLETED", "DECLINED", "CANCELLED"].includes(a.status)) return false;
    // If pending/confirmed, it's upcoming ONLY if it ended less than 4 hours ago
    const endTime = new Date(a.slot_end).getTime();
    return endTime > threshold;
  });

  const past = appointments.filter((a) => {
    if (["COMPLETED", "DECLINED", "CANCELLED"].includes(a.status)) return true;
    const endTime = new Date(a.slot_end).getTime();
    return endTime <= threshold;
  });

  const displayList = activeTab === "upcoming" ? upcoming : past;

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "upcoming"
              ? "text-teal border-b-2 border-teal"
              : "text-ink-mid hover:text-ink"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-3 text-sm font-medium transition-colors ${
            activeTab === "past"
              ? "text-teal border-b-2 border-teal"
              : "text-ink-mid hover:text-ink"
          }`}
        >
          Past ({past.length})
        </button>
      </div>

      {/* List */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <span className="text-4xl mb-3 block">📅</span>
          <p className="text-sm text-ink-mid font-medium">
            No {activeTab} appointments
          </p>
          <Link
            href="/doctors"
            className="inline-block mt-4 px-4 py-2 bg-teal text-white text-xs font-medium rounded-lg hover:bg-teal-dark transition-colors no-underline"
          >
            Book an Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((appt) => {
            const doc = appt.doctor_profiles;
            const initials = doc?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "DR";
            const date = new Date(appt.slot_start);
            const isCancelling = isPendingCancel && cancellingId === appt.id;

            // Check if cancel is allowed (> 2 hours before)
            const diffHours = (date.getTime() - new Date().getTime()) / (1000 * 60 * 60);
            const canCancel = (appt.status === "PENDING" || appt.status === "CONFIRMED") && diffHours >= 2;

            return (
              <div
                key={appt.id}
                className={`bg-white rounded-xl border border-border p-5 ${isCancelling ? "opacity-50" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {doc?.avatar_url ? (
                      <img src={doc.avatar_url} alt={doc.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-light text-teal font-bold text-sm flex items-center justify-center">
                        {initials}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-ink text-sm">{doc?.name || "Doctor"}</h3>
                      <p className="text-xs text-ink-mid">{doc?.specialties?.join(", ") || "General"}</p>
                      <p className="text-xs font-medium text-ink mt-0.5">
                        {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <StatusBadge status={appt.status} />
                    {appt.status === "CONFIRMED" && (
                      <Link
                        href={`/video-room/${appt.id}`}
                        className="px-3 py-1.5 bg-teal hover:bg-teal-dark text-white text-xs font-medium rounded-lg shadow-sm transition-colors no-underline"
                      >
                        Join Call
                      </Link>
                    )}
                  </div>
                </div>

                {appt.reason && (
                  <div className="bg-off-white rounded-lg p-3 text-xs text-ink-mid mb-4">
                    <span className="font-semibold">Reason:</span> {appt.reason}
                  </div>
                )}

                {(() => {
                  const rawNotes = appt.consult_notes as any;
                  const notes = Array.isArray(rawNotes) ? rawNotes[0] : rawNotes;
                  if (!notes) return null;
                  
                  return (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 text-xs text-ink-mid mb-4 space-y-3">
                      <h4 className="font-semibold text-teal-dark border-b border-teal-200 pb-1">Consultation Feedback</h4>
                      {notes.diagnosis && (
                        <p><span className="font-medium text-ink">Diagnosis:</span> {notes.diagnosis}</p>
                      )}
                      {notes.prescription && (
                        <div className="whitespace-pre-wrap"><span className="font-medium text-ink block mb-1">Prescription/Plan:</span>{notes.prescription}</div>
                      )}
                    </div>
                  );
                })()}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <Link
                    href={`/doctors/${appt.doctor_id}`}
                    className="text-xs font-medium text-teal hover:underline no-underline"
                  >
                    View Doctor Profile
                  </Link>

                  {canCancel && (
                    <button
                      onClick={() => handleCancel(appt.id)}
                      disabled={isCancelling}
                      className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                    </button>
                  )}

                  {appt.status === "COMPLETED" && (appt.ratings?.length || 0) === 0 && (
                    <RatingForm appointmentId={appt.id} doctorId={appt.doctor_id} />
                  )}
                  {appt.status === "COMPLETED" && (appt.ratings?.length || 0) > 0 && (
                    <span className="text-xs text-ink-light">✓ Rated</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-light text-amber-dark",
    CONFIRMED: "bg-green-100 text-green-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    DECLINED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-600",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

function RatingForm({ appointmentId, doctorId }: { appointmentId: string, doctorId: string }) {
  const [, formAction, isPending] = useActionState(submitRating, null);
  const [isOpen, setIsOpen] = useState(false);
  const [hoverScore, setHoverScore] = useState(0);
  const [score, setScore] = useState(0);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="text-xs font-medium text-amber hover:text-amber-dark transition-colors">
        ★ Leave a Review
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="doctorId" value={doctorId} />
      <input type="hidden" name="score" value={score} />
      
      <div className="flex gap-1" onMouseLeave={() => setHoverScore(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverScore(star)}
            onClick={() => setScore(star)}
            className={`text-sm ${
              star <= (hoverScore || score) ? "text-amber" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <input 
        name="review"
        type="text" 
        placeholder="Optional review..." 
        className="w-32 px-2 py-1 border border-border rounded text-xs outline-none focus:border-teal"
      />

      <button
        type="submit"
        disabled={isPending || score === 0}
        className="px-2 py-1 bg-teal text-white text-[10px] font-medium rounded disabled:opacity-50"
      >
        {isPending ? "..." : "Submit"}
      </button>
    </form>
  );
}
