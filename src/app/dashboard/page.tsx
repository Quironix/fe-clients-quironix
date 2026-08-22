import React from "react";
import { redirect } from "next/navigation";

const Page = () => {
  redirect("/dashboard/home");
  return <div>Page</div>;
};

export default Page;
