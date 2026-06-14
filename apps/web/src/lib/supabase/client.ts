import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === "your-supabase-url" || !anonKey || anonKey === "your-supabase-anon-key") {
    return null as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, anonKey);
}
