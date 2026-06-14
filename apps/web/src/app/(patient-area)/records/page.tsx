import { getAuthenticatedPatient } from "@/lib/get-patient";
import RecordsClient from "./records-client";

export const dynamic = "force-dynamic";


export default async function MedicalRecordsPage() {
  const { supabase, profile } = await getAuthenticatedPatient();

  // Fetch existing records
  const { data: records } = await supabase
    .from("medical_records")
    .select("id, file_url, file_type, description, created_at")
    .eq("patient_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          Medical Records
        </h1>
        <p className="text-sm text-ink-mid mt-1">
          Upload and manage your medical documents securely.
        </p>
      </div>

      <RecordsClient records={records || []} />
    </div>
  );
}
