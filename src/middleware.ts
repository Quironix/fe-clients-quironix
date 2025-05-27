import { auth } from "@/auth";
import { UserProfile } from "./app/onboarding/types";

export default auth(async (req: any) => {
  const session: any = req.auth;
  console.log("session", session.token);

  const response: any = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/auth/profile`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );

  const profile: UserProfile = await response.json();
  console.log("profile", profile?.client?.status);

  // Si no hay autenticación y no está en sign-in, redirigir a sign-in
  if (!req.auth && req.nextUrl.pathname !== "/sign-in") {
    const newUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Si está autenticado, verificar el estado del cliente
  if (req.auth) {
    const clientStatus = profile?.client?.status;
    console.log("clientStatus", clientStatus);

    // Si el estado es INVITED y no está en onboarding, redirigir a onboarding
    if (clientStatus === "INVITED" && req.nextUrl.pathname !== "/onboarding") {
      const newUrl = new URL("/onboarding", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    // Si el estado no es INVITED y está en onboarding, redirigir a dashboard
    if (clientStatus !== "INVITED" && req.nextUrl.pathname === "/onboarding") {
      const newUrl = new URL("/dashboard", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
