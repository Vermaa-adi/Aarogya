"use client";

import { useState, useTransition } from "react";
import { approveDoctor, rejectDoctor } from "./actions";

type DoctorData = {
  id: string;
  name: string;
  specialties: string[];
  license_no: string;
  license_doc_url: string | null;
  experience_years: number | null;
  users: { email: string } | null;
};

export default function ApprovalsClient({ doctors }: { doctors: DoctorData[] }) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: string, action: "approve" | "reject") => {
    if (action === "reject") {
      if (!confirm("Are you sure you want to permanently reject and delete this application?")) return;
    }

    setProcessingId(id);
    startTransition(async () => {
      let res;
      if (action === "approve") {
        res = await approveDoctor(id);
      } else {
        res = await rejectDoctor(id);
      }
      
      if (!res.success) {
        alert(res.message);
      }
      setProcessingId(null);
    });
  };

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <span className="text-4xl mb-3 block">👍</span>
        <p className="text-sm text-slate-600 font-medium">
          No pending doctor applications to review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {doctors.map((doc) => {
        const isProcessing = isPending && processingId === doc.id;

        return (
          <div 
            key={doc.id} 
            className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm transition-opacity ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{doc.name}</h3>
                <p className="text-sm font-medium text-slate-500 mb-2">{doc.users?.email || "No email"}</p>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4">
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Specialties</span>
                    <span className="font-medium text-slate-700">{doc.specialties?.join(", ") || "None"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">Experience</span>
                    <span className="font-medium text-slate-700">{doc.experience_years ? `${doc.experience_years} years` : "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">License Number</span>
                    <span className="font-medium text-slate-700">{doc.license_no || "Missing"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs uppercase tracking-wider">License Document</span>
                    {doc.license_doc_url ? (
                      <a href={doc.license_doc_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                        View Document ↗
                      </a>
                    ) : (
                      <span className="font-medium text-red-500">Not Uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center gap-2 self-start sm:self-stretch justify-center w-full sm:w-auto mt-4 sm:mt-0">
                <button
                  onClick={() => handleAction(doc.id, "approve")}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none w-full px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(doc.id, "reject")}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none w-full px-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
