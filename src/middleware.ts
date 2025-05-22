import { auth } from "@/auth";

// import { supabase } from './services/supabase/supabaseClient';

export default auth(async (req: any) => {
  if (!req.auth && req.nextUrl.pathname !== "/sign-in") {
    const newUrl = new URL("/sign-in", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (req.auth && req.nextUrl.pathname === "/dashboard") {
    debugger;
    // supabase.auth.setSession({
    //   access_token: req.auth.access_token,
    //   refresh_token: req.auth.refresh_token,
    // });

    // const { data } = await getProjectsByCompanyId(req.auth.user.company.id);

    // const newUrl = new URL(`/dashboard/${data?.[0]?.id}`, req.nextUrl.origin);
    // return Response.redirect(newUrl);
  }
});
export const config = {
  matcher: ["/dashboard/:path*"],
};
