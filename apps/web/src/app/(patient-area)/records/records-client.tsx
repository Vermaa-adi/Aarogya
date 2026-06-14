"use client";

import { useActionState, useState, useTransition } from "react";
import { uploadMedicalRecord, deleteMedicalRecord } from "./actions";

interface RecordItem {
  id: string;
  file_url: string;
  file_type: string | null;
  description: string | null;
  created_at: string;
}

export default function RecordsClient({
  records: initialRecords,
}: {
  records: RecordItem[];
}) {
  const [uploadState, uploadAction, isUploading] = useActionState(
    uploadMedicalRecord,
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const handleDelete = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setDeletingId(recordId);
    startDeleteTransition(async () => {
      await deleteMedicalRecord(recordId);
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-ink mb-4">
          Upload New Record
        </h2>

        {uploadState?.message && (
          <div
            className={`text-sm px-4 py-3 rounded-lg mb-4 ${
              uploadState.success
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {uploadState.success ? "✓ " : ""}
            {uploadState.message}
          </div>
        )}

        <form action={uploadAction} className="space-y-4">
          <div>
            <label
              htmlFor="file"
              className="block text-xs font-medium text-ink-mid mb-1"
            >
              File (PDF, JPEG, or PNG — max 10 MB) *
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full text-sm text-ink-mid file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-light file:text-teal-dark hover:file:bg-teal-light/80 cursor-pointer"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-medium text-ink-mid mb-1"
            >
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="e.g. Blood test report — Feb 2026"
              maxLength={200}
              className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="px-5 py-2 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              "Upload Record"
            )}
          </button>
        </form>
      </div>

      {/* Records List */}
      <div>
        <h2 className="text-sm font-semibold text-ink mb-4">
          Your Records ({initialRecords.length})
        </h2>

        {initialRecords.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <span className="text-4xl mb-3 block">📋</span>
            <p className="text-sm text-ink-mid font-medium">
              No records uploaded yet
            </p>
            <p className="text-xs text-ink-light mt-1">
              Upload your medical reports, prescriptions, and test results.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {initialRecords.map((record) => {
              const date = new Date(record.created_at).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              );
              const isDeleting =
                isPendingDelete && deletingId === record.id;

              return (
                <div
                  key={record.id}
                  className={`bg-white rounded-xl border border-border p-4 flex items-center gap-4 ${isDeleting ? "opacity-50" : ""}`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-off-white flex items-center justify-center">
                    <span className="text-lg">
                      {record.file_type === "pdf" ? "📄" : "🖼️"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {record.description || "Untitled Record"}
                    </p>
                    <p className="text-xs text-ink-light">
                      {record.file_type?.toUpperCase()} · Uploaded {date}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      disabled={isDeleting}
                      className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
