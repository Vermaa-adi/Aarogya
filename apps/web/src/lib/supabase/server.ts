import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createClient as createBaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === "your-supabase-url" || !anonKey || anonKey === "your-supabase-anon-key") {
    return null as unknown as ReturnType<typeof createSSRClient>;
  }

  const cookieStore = await cookies();

  return createSSRClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Record<string, string>)
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url === "your-supabase-url" || !serviceRoleKey || serviceRoleKey === "your-service-role-key") {
    return null as unknown as ReturnType<typeof createBaseClient>;
  }

  return createBaseClient(url, serviceRoleKey);
}
