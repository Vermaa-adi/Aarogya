import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Shared helper: Gets the current authenticated user + patient profile.
 * Auto-heals the profile if it's missing (e.g. trigger bypass failures).
 * Redirects to /auth/login if the user is not authenticated.
 */
export async function getAuthenticatedPatient() {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Try to fetch existing profile
  let { data: profile } = await supabase
    .from("patient_profiles")
    .select("id, name, dob, blood_group, known_conditions, emergency_contact, avatar_url")
    .eq("user_id", user.id)
    .single();

  // Auto-heal: create profile if it doesn't exist
  if (!profile) {
    const name =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Patient";

    // Try with the anon client first (in case user has a session)
    const { data: created } = await supabase
      .from("patient_profiles")
      .insert({ user_id: user.id, name })
      .select("id, name, dob, blood_group, known_conditions, emergency_contact, avatar_url")
      .single();

    if (created) {
      profile = created;
    } else {
      // Anon insert might fail due to RLS — try admin client
      const adminClient = await createAdminClient();
      if (adminClient) {
        // Ensure public.users row exists
        await adminClient.from("users").upsert(
          {
            id: user.id,
            email: user.email || "",
            phone: user.user_metadata?.phone || null,
            role: "PATIENT",
          },
          { onConflict: "id" }
        );

        const { data: adminCreated } = await adminClient
          .from("patient_profiles")
          .upsert({ user_id: user.id, name }, { onConflict: "user_id" })
          .select("id, name, dob, blood_group, known_conditions, emergency_contact, avatar_url")
          .single();

        if (adminCreated) {
          profile = adminCreated;
        }
      }
    }
  }

  if (!profile) {
    // Absolute last resort — this should never happen
    redirect("/auth/login");
  }

  return { supabase, user, profile };
}
