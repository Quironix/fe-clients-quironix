import { auth } from "@/auth";
import { UserProfile } from "./app/onboarding/types";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/sign-in", "/onboarding"];
const DASHBOARD_PATHS = ["/dashboard"];

// Cache para el perfil del usuario
const profileCache = new Map<
  string,
  { profile: UserProfile; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export default auth(async (req) => {
  // return undefined;
  const session = req.auth;
  const currentPath = req.nextUrl.pathname;

  // Si está en sign-in, permitir acceso sin validaciones
  if (currentPath === "/sign-in") {
    return NextResponse.next();
  }

  // Si no hay sesión y no está en una ruta pública, redirigir a sign-in
  if (
    !session?.token &&
    !PUBLIC_PATHS.some((path) => currentPath.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin));
  }

  // Si no hay sesión, permitir acceso a rutas públicas
  if (!session?.token) {
    return NextResponse.next();
  }

  try {
    // Verificar si tenemos el perfil en caché
    const cachedProfile = profileCache.get(session?.token);
    const now = Date.now();

    let profile: UserProfile;

    if (cachedProfile && now - cachedProfile.timestamp < CACHE_DURATION) {
      profile = cachedProfile.profile;
    } else {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );

      if (!response.ok) {
        // Si el token es inválido, limpiar la caché y redirigir a sign-in
        profileCache.delete(session?.token);
        return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin));
      }

      profile = await response.json();
      // Guardar en caché
      profileCache.set(session?.token, { profile, timestamp: now });
    }

    const clientStatus = profile?.client?.status;

    console.log("CLIENT STATUS", clientStatus);

    // Si el estado es INVITED
    if (clientStatus === "INVITED") {
      // Si no está en onboarding, redirigir a onboarding
      if (!currentPath.startsWith("/onboarding")) {
        return NextResponse.redirect(
          new URL("/onboarding", req.nextUrl.origin)
        );
      }
      return NextResponse.next();
    }

    // Si el estado existe y no es INVITED
    if (clientStatus) {
      // Si está en onboarding, redirigir a dashboard
      if (currentPath.startsWith("/onboarding")) {
        return NextResponse.redirect(
          new URL("/dashboard/overview", req.nextUrl.origin)
        );
      }
      // Si está intentando acceder a una ruta protegida sin estado válido
      if (!DASHBOARD_PATHS.some((path) => currentPath.startsWith(path))) {
        return NextResponse.redirect(
          new URL("/dashboard/overview", req.nextUrl.origin)
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error en middleware:", error);
    // En caso de error, limpiar la caché y redirigir a sign-in
    if (session?.token) {
      profileCache.delete(session?.token);
    }
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
