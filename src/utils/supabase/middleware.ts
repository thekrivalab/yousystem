import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { E2E_SESSION_COOKIE } from "@/lib/e2e";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/auth/callback",
]);

const PROTECTED_PREFIXES = [
  "/home",
  "/routine",
  "/habits",
  "/goals",
  "/finance",
  "/health",
  "/projects",
  "/planning",
  "/achievements",
  "/conquistas",
  "/documents",
  "/dreams",
  "/memories",
  "/map",
  "/bucket-list",
  "/dashboard",
  "/settings",
  "/learning",
  "/relationships",
  "/planner",
  "/timeline",
  "/stats",
  "/compare",
  "/diary",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isE2E =
    process.env.NODE_ENV !== "production" &&
    process.env.E2E_TEST_MODE === "1" &&
    request.cookies.get(E2E_SESSION_COOKIE)?.value === "1";

  if (!user && !isE2E && isProtectedPath(pathname) && !PUBLIC_PATHS.has(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  supabaseResponse.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.cartocdn.com https://flagcdn.com https://*.githubusercontent.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://restcountries.com https://raw.githubusercontent.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  if (process.env.NODE_ENV === "production") {
    supabaseResponse.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    supabaseResponse.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
