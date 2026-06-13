import { getAuthenticatedPatient } from "@/lib/get-patient";
import ProfileFormClient from "./profile-form";

export const dynamic = "force-dynamic";


export default async function PatientProfilePage() {
  const { profile } = await getAuthenticatedPatient();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          My Profile
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Update your personal and medical information.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 sm:p-8 max-w-2xl">
        <ProfileFormClient profile={profile} />
      </div>
    </div>
  );
}
