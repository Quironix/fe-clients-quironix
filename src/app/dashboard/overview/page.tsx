import { redirect } from "next/navigation";

const OverviewRedirectPage = () => {
  redirect("/dashboard/home");
};

export default OverviewRedirectPage;
