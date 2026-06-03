import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require specific roles
const PATIENT_ROUTES = ["/dashboard", "/profile", "/records", "/doctors", "/appointments"];
const DOCTOR_ROUTES = ["/doctor/dashboard", "/doctor/profile", "/doctor/requests", "/doctor/appointments"];
const ADMIN_ROUTES = ["/admin/approvals"];
const AUTH_ROUTES = ["/auth"];

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // ── Auth routes: redirect away if already signed in ──
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (user) {
      // Redirect to the appropriate dashboard based on role
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role === "DOCTOR") {
        return NextResponse.redirect(new URL("/doctor/dashboard", request.url));
      }
      if (userData?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/approvals", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return supabaseResponse;
  }

  // ── Protected routes: require auth ──
  const isPatientRoute = PATIENT_ROUTES.some((route) => pathname.startsWith(route));
  const isDoctorRoute = DOCTOR_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
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

  // Get user role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role;

  // ── Patient routes ──
  if (isPatientRoute && role !== "PATIENT") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // ── Doctor routes (verified only) ──
  if (isDoctorRoute) {
    if (role !== "DOCTOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    // Check verification
    const { data: doctorProfile } = await supabase
      .from("doctor_profiles")
      .select("is_verified")
      .eq("user_id", user.id)
      .single();

    if (!doctorProfile?.is_verified) {
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
