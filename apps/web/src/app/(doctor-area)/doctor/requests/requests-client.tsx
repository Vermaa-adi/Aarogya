"use client";

import { useState, useTransition } from "react";
import { acceptAppointment, declineAppointment } from "./actions";

type RequestData = {
  id: string;
  slot_start: string;
  reason: string | null;
  patient_profiles: { name: string; avatar_url?: string | null } | null;
};

export default function RequestsClient({ requests }: { requests: RequestData[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: string, action: "accept" | "decline") => {
    if (action === "decline") {
      if (!confirm("Are you sure you want to decline this appointment request?")) return;
    }

    setProcessingId(id);
    startTransition(async () => {
      let res;
      if (action === "accept") {
        res = await acceptAppointment(id);
      } else {
        res = await declineAppointment(id);
      }
      
      if (!res.success) {
        alert(res.message);
      } else {
        window.location.href = "/doctor/dashboard";
      }
      setProcessingId(null);
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-12 text-center shadow-sm">
        <span className="text-4xl mb-3 block">Inbox Zero! 🎉</span>
        <p className="text-sm text-ink-mid font-medium">
          You have no pending appointment requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const patient = req.patient_profiles;
        const initials = patient?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "P";
        const date = new Date(req.slot_start);
        const isProcessing = isPending && processingId === req.id;

        return (
          <div 
            key={req.id} 
            className={`bg-white rounded-xl border border-border p-5 shadow-sm transition-opacity ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                {patient?.avatar_url ? (
                  <img src={patient.avatar_url} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-light text-teal font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-ink text-sm">{patient?.name || "Patient"}</h3>
                  <p className="text-xs font-medium text-ink-mid mt-0.5">
                    Requested for: {date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} at {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                <button
                  onClick={() => handleAction(req.id, "decline")}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-medium rounded-lg transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAction(req.id, "accept")}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-4 py-2 bg-teal hover:bg-teal-dark text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                >
                  Accept
                </button>
              </div>
            </div>

            {req.reason && (
              <div className="bg-off-white rounded-lg p-3 text-xs text-ink-mid">
                <span className="font-semibold text-ink">Reason for visit:</span> {req.reason}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
