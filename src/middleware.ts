import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UserProfile } from "./app/onboarding/types";

const PUBLIC_PATHS = ["/sign-in", "/onboarding"];
const DASHBOARD_PATHS = ["/dashboard"];

// Mapeo de rutas a scopes requeridos
const ROUTE_SCOPE_MAP: Record<string, string> = {
  "/dashboard/overview": "client.dashboard",
  "/dashboard/companies": "client.onboarding.companies",
  "/dashboard/settings": "client.onboarding.settings",
  "/dashboard/integrations": "client.onboarding.integrations",
  "/dashboard/banks": "client.onboarding.banks",
  "/dashboard/users": "client.users.users",
  "/dashboard/roles": "client.users.roles",
  "/dashboard/actions-history": "client.users.actions_history",
  "/dashboard/debtors": "client.settings_account.debtors",
  "/dashboard/monthly-period": "client.settings_account.monthly_period",
  "/dashboard/cash-flow": "client.settings_account.cash_flow",
  "/dashboard/communications": "client.settings_account.communications",
  "/dashboard/indicators": "client.settings_account.indicators",
  "/dashboard/transactions/dte": "client.transactions.dte",
  "/dashboard/transactions/payments": "client.transactions.payments",
  "/dashboard/transactions/movements": "client.transactions.movements",
};

// Función para validar si el usuario tiene acceso a una ruta basándose en sus scopes
const hasAccessToRoute = (routePath: string, userScopes: string[]): boolean => {
  // Obtener el scope requerido para la ruta
  let requiredScope = ROUTE_SCOPE_MAP[routePath];

  // Si no se encuentra una coincidencia exacta, buscar por patrones de rutas padre
  if (!requiredScope) {
    // Buscar rutas padre que puedan coincidir
    const matchingRoute = Object.keys(ROUTE_SCOPE_MAP).find((route) => {
      // Verificar si la ruta actual empieza con alguna ruta definida
      return routePath.startsWith(route);
    });

    if (matchingRoute) {
      requiredScope = ROUTE_SCOPE_MAP[matchingRoute];
    }
  }

  // Si no hay scope definido para la ruta, permitir acceso por defecto
  if (!requiredScope) return true;

  // Si el usuario no tiene scopes, denegar acceso
  if (!userScopes || userScopes.length === 0) return false;

  // Verificar si algún scope del usuario coincide o es más específico que el scope requerido
  return userScopes.some((userScope) => {
    // Remover la parte de acción (:read, :edit, :delete) del scope del usuario
    const baseScopeUser = userScope.split(":")[0];
    // El usuario tiene acceso si su scope base coincide o es más específico que el requerido
    return (
      baseScopeUser === requiredScope ||
      baseScopeUser.startsWith(requiredScope + ".")
    );
  });
};

const fetchProfile = async (token: string) => {
  return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

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
      if (currentPath.startsWith("/onboarding")) {
        const response = await fetchProfile(session?.token);
        profile = await response.json();
        // Guardar en caché
        profileCache.set(session?.token, { profile, timestamp: now });
      }
    } else {
      const response = await fetchProfile(session?.token);

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

    console.log("CLIENT STATUSSSS", clientStatus);

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

      // Validar scopes para rutas del dashboard
      if (currentPath.startsWith("/dashboard")) {
        // Permitir acceso a la página de acceso denegado sin validar scopes
        if (currentPath === "/dashboard/access-denied") {
          return NextResponse.next();
        }

        // Validación específica para la ruta de companies - solo para clientes FACTORING
        if (currentPath.startsWith("/dashboard/companies")) {
          const clientType = profile?.client?.type;
          if (clientType !== "FACTORING") {
            console.log(
              `Acceso denegado a ${currentPath} - cliente tipo ${clientType} no es FACTORING`
            );

            const redirectUrl = new URL(
              "/dashboard/access-denied",
              req.nextUrl.origin
            );
            redirectUrl.searchParams.set("route", currentPath);
            redirectUrl.searchParams.set("reason", "client_type_not_factoring");
            return NextResponse.redirect(redirectUrl);
          }
        }

        // Obtener todos los scopes del usuario desde sus roles
        const userScopes =
          profile?.roles?.flatMap((role: any) => role.scopes || []) || [];

        // Verificar si el usuario tiene acceso a la ruta actual
        if (!hasAccessToRoute(currentPath, userScopes)) {
          console.log(
            `Acceso denegado a ${currentPath} para usuario con scopes:`,
            userScopes
          );

          // Agregar información adicional sobre el intento de acceso para logging
          console.log(`Usuario: ${profile?.email || "Desconocido"}`);
          console.log(`Ruta solicitada: ${currentPath}`);
          console.log(`Scopes disponibles: ${userScopes.join(", ")}`);

          // Redirigir a la página de acceso denegado con la ruta solicitada como parámetro
          const redirectUrl = new URL(
            "/dashboard/access-denied",
            req.nextUrl.origin
          );
          redirectUrl.searchParams.set("route", currentPath);
          return NextResponse.redirect(redirectUrl);
        }
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
