"use client";

import { useActionState, useEffect, useState } from "react";
import { updatePatientProfile } from "./actions";

interface ProfileData {
  name: string;
  dob: string | null;
  blood_group: string | null;
  known_conditions: string | null;
  emergency_contact: string | null;
  avatar_url: string | null;
}

function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, formAction, isPending] = useActionState(
    updatePatientProfile,
    null
  );
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      // Defer state update to avoid synchronous cascading renders warning
      const id = setTimeout(() => setShowSuccess(true), 0);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => {
        clearTimeout(id);
        clearTimeout(timer);
      };
    }
  }, [state]);

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <form action={formAction} className="space-y-6">
      {showSuccess && state?.message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          ✓ {state.message}
        </div>
      )}
      {!state?.success && state?.message && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.message}
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-teal-light text-teal font-bold text-xl flex items-center justify-center">
            {initials}
          </div>
        )}
        <div>
          <label
            htmlFor="avatar"
            className="text-xs font-medium text-teal hover:underline cursor-pointer"
          >
            Change Photo
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />
          <p className="text-[10px] text-ink-light mt-0.5">
            JPEG, PNG or WebP, max 2 MB
          </p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-xs font-medium text-ink-mid mb-1"
        >
          Full Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={profile.name}
          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-600 mt-1">{state.errors.name}</p>
        )}
      </div>

      {/* DOB + Blood Group (side by side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="dob"
            className="block text-xs font-medium text-ink-mid mb-1"
          >
            Date of Birth
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            defaultValue={profile.dob || ""}
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          />
        </div>
        <div>
          <label
            htmlFor="blood_group"
            className="block text-xs font-medium text-ink-mid mb-1"
          >
            Blood Group
          </label>
          <select
            id="blood_group"
            name="blood_group"
            defaultValue={profile.blood_group || ""}
            className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
          >
            <option value="">Select</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Known Conditions */}
      <div>
        <label
          htmlFor="known_conditions"
          className="block text-xs font-medium text-ink-mid mb-1"
        >
          Known Medical Conditions
        </label>
        <textarea
          id="known_conditions"
          name="known_conditions"
          rows={3}
          defaultValue={profile.known_conditions || ""}
          placeholder="e.g. Diabetes Type 2, Hypertension..."
          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all resize-none"
        />
      </div>

      {/* Emergency Contact */}
      <div>
        <label
          htmlFor="emergency_contact"
          className="block text-xs font-medium text-ink-mid mb-1"
        >
          Emergency Contact
        </label>
        <input
          id="emergency_contact"
          name="emergency_contact"
          type="tel"
          defaultValue={profile.emergency_contact || ""}
          placeholder="+91 98765 43210"
          className="w-full px-3.5 py-2 border border-border rounded-lg text-sm text-ink bg-off-white outline-none focus:border-teal transition-all"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto px-6 py-2.5 bg-teal hover:bg-teal-dark disabled:bg-teal-mid/50 text-white font-medium text-sm rounded-lg shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
      >
        {isPending ? (
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
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}

export default function ProfileFormClient({
  profile,
}: {
  profile: ProfileData;
}) {
  return <ProfileForm profile={profile} />;
}
