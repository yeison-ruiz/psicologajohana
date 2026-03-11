import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require the 'psicologa' role (admin)
const ADMIN_ROUTES = ["/admin"];

// Routes that require the 'paciente' role
const PATIENT_ROUTES = ["/paciente", "/book", "/dashboard"];

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/registro", "/auth", "/blog"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if this is a public route — allow anyone
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  if (isPublic) {
    return supabaseResponse;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Hard restrict 'psicologa' role by email to prevent unauthorized access
  const ADMIN_EMAILS = ["carolinavillabon01@gmail.com", "ingyeisonruiz26@gmail.com"];
  const userEmail = user.email?.toLowerCase();
  const isAuthorizedAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
  
  const role = isAuthorizedAdmin ? "psicologa" : "paciente";

  // Check admin routes — only real admins can access
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute && role !== "psicologa") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Check patient routes — only 'paciente' can access
  const isPatientRoute = PATIENT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isPatientRoute && role !== "paciente") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
