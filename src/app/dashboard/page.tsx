import React from "react";
import { redirect } from "next/navigation";

const Page = () => {
  redirect("/dashboard/overview");
  return <div>Page</div>;
};

export default Page;
