import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require specific roles
const PATIENT_ROUTES = ["/dashboard", "/profile", "/records", "/doctors", "/appointments"];
const DOCTOR_ROUTES = ["/doctor/dashboard", "/doctor/profile", "/doctor/requests", "/doctor/appointments"];
const ADMIN_ROUTES = ["/admin/approvals"];
const AUTH_ROUTES = ["/auth"];

// Helper to check if a pathname matches a route boundary-safely
const isMatch = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(route + "/");

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = url && url !== "your-supabase-url" && anonKey && anonKey !== "your-supabase-anon-key";

  if (!isConfigured) {
    return new NextResponse(
      `<html>
        <head>
          <title>Aarogya Setup Required</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #F7F6F2; color: #1A1A1A; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 2.5rem; border-radius: 1.25rem; box-shadow: 0 10px 30px rgba(0,0,0,0.04); max-width: 500px; border: 1px solid rgba(0,0,0,0.08); text-align: center; }
            .logo { font-size: 2.5rem; margin-bottom: 1.5rem; }
            h1 { font-family: Georgia, serif; color: #0F6E56; margin-top: 0; font-size: 1.75rem; }
            p { line-height: 1.6; color: #4A4A4A; font-size: 0.95rem; }
            ol { text-align: left; padding-left: 1.5rem; line-height: 1.7; color: #4A4A4A; font-size: 0.9rem; margin-top: 1.5rem; }
            li { margin-bottom: 0.8rem; }
            code { background: #E1F5EE; color: #085041; padding: 0.2rem 0.4rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; }
            a { color: #0F6E56; font-weight: 500; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">🩺</div>
            <h1>Aarogya Setup Required</h1>
            <p>Before launching the telemedicine platform, please configure your Supabase settings:</p>
            <ol>
              <li>Copy <code>apps/web/.env.example</code> to <code>apps/web/.env.local</code></li>
              <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
              <li>Copy the <strong>Project URL</strong> and <strong>API Key (anon)</strong> from your Supabase Dashboard settings</li>
              <li>Add them to <code>apps/web/.env.local</code> as <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
              <li>Restart the dev server using <code>npm run dev</code></li>
            </ol>
          </div>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  const { user, supabaseResponse, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => isMatch(pathname, route));

  // ── Auth routes: redirect away if already signed in ──
  if (isAuthRoute) {
    if (user) {
      // Get role from metadata first, fallback to DB query
      let role = user.user_metadata?.role || user.app_metadata?.role;
      if (!role) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();
        role = userData?.role;
      }

      if (role === "DOCTOR") {
        return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
      }
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/approvals", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // ── Protected routes: require auth ──
  const isPatientRoute = PATIENT_ROUTES.some((route) => isMatch(pathname, route));
  const isDoctorRoute = DOCTOR_ROUTES.some((route) => isMatch(pathname, route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => isMatch(pathname, route));
  const isDoctorPending = pathname === "/doctor/verification-pending";

  if (!isPatientRoute && !isDoctorRoute && !isAdminRoute && !isDoctorPending) {
    return supabaseResponse; // Public route
  }

  // Not logged in → redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Get user role from metadata first, fallback to DB query
  let role = user.user_metadata?.role || user.app_metadata?.role;
  if (!role) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    role = userData?.role;
  }

  // ── Patient routes ──
  if (isPatientRoute && role !== "PATIENT") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ── Doctor routes (verified only) ──
  if (isDoctorRoute) {
    if (role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    // Check verification status from metadata first, fallback to DB query
    let isVerified = user.user_metadata?.is_verified;
    if (isVerified === undefined) {
      const { data: doctorProfile } = await supabase
        .from("doctor_profiles")
        .select("is_verified")
        .eq("user_id", user.id)
        .single();
      isVerified = doctorProfile?.is_verified;
    }

    if (!isVerified) {
      return NextResponse.redirect(new URL("/doctor/verification-pending", request.url));
    }
  }

  // ── Doctor pending page (any DOCTOR can access) ──
  if (isDoctorPending && role !== "DOCTOR") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ── Admin routes ──
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (browser icon)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
