import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ApprovalsClient from "./approvals-client";

export const dynamic = "force-dynamic";


export default async function AdminApprovalsPage() {
  const supabase = await createClient();
  
  // The layout already guarantees role === ADMIN, but we still need to verify auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Use admin client to bypass RLS — this page is already guarded by the admin layout
  const adminClient = await createAdminClient();
  if (!adminClient) redirect("/auth/login");

  // Fetch all pending doctor profiles (is_verified = false)
  const { data: pendingDoctors } = await adminClient
    .from("doctor_profiles")
    .select(`
      id,
      name,
      specialties,
      license_no,
      license_doc_url,
      experience_years,
      users!inner (email)
    `)
    .eq("is_verified", false)
    .order("updated_at", { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold text-slate-900">
          Doctor Approvals
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review credentials for healthcare providers applying to join Aarogya.
        </p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ApprovalsClient doctors={(pendingDoctors || []) as any[]} />
    </div>
  );
}
