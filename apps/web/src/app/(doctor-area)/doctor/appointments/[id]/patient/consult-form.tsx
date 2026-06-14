"use client";

import { useActionState, useEffect, useState } from "react";
import { saveConsultNotes } from "./actions";

interface ConsultFormProps {
  appointmentId: string;
  patientId: string;
  initialData: {
    notes: string | null;
    diagnosis: string | null;
    prescription: string | null;
  } | null;
  isCompleted: boolean;
}

export default function ConsultFormClient({
  appointmentId,
  patientId,
  initialData,
  isCompleted,
}: ConsultFormProps) {
  const [state, formAction, isPending] = useActionState(saveConsultNotes, null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [markComplete, setMarkComplete] = useState(isCompleted);

  useEffect(() => {
    if (state?.success) {
      const id = setTimeout(() => setShowSuccess(true), 0);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => {
        clearTimeout(id);
        clearTimeout(timer);
      };
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="patientId" value={patientId} />
      
      {/* Required for the action to know if it should complete the appointment */}
      <input type="hidden" name="completeAppointment" value={markComplete ? "true" : "false"} />

      {state?.message && !state.success && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.message}
        </div>
      )}
      
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          {state?.message || "Notes saved successfully."}
        </div>
      )}

      {/* Diagnosis */}
      <div>
        <label htmlFor="diagnosis" className="block text-sm font-semibold text-ink mb-1">
          Diagnosis
        </label>
        <input
          id="diagnosis"
          name="diagnosis"
          type="text"
          defaultValue={initialData?.diagnosis || ""}
          placeholder="e.g. Acute Pharyngitis"
          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-ink mb-1">
          Clinical Notes *
        </label>
        <textarea
          id="notes"
          name="notes"
          required
          rows={5}
          defaultValue={initialData?.notes || ""}
          placeholder="Patient presented with..."
          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all resize-y"
        />
      </div>

      {/* Prescription */}
      <div>
        <label htmlFor="prescription" className="block text-sm font-semibold text-ink mb-1">
          Prescription / Plan
        </label>
        <textarea
          id="prescription"
          name="prescription"
          rows={3}
          defaultValue={initialData?.prescription || ""}
          placeholder="e.g. Paracetamol 500mg SOS..."
          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all resize-y"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 gap-4 border-t border-border">
        {!isCompleted ? (
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input
              type="checkbox"
              checked={markComplete}
              onChange={(e) => setMarkComplete(e.target.checked)}
              className="w-4 h-4 text-teal rounded border-border focus:ring-teal"
            />
            Mark Consultation as Completed
          </label>
        ) : (
          <p className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            ✓ Consultation Completed
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto px-6 py-2.5 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none transition-colors cursor-pointer"
        >
          {isPending ? "Saving..." : markComplete && !isCompleted ? "Save & Complete" : "Save Notes"}
        </button>
      </div>
    </form>
  );
}
