"use client";
import { useAuthLayout } from "@/stores/authLayout";
import { useTranslations } from "next-intl";
import Loader from "../Loader";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuthLayout();
  const t = useTranslations("auth");

  return (
    <>
      <div className="container relative grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-gradient-to-br from-purple-800 via-blue-800 to-purple-800 p-10 text-white lg:flex overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/img/isotipo-login.png"
              alt=""
              className="absolute w-[250%] h-auto opacity-50 top-[70%] left-[50%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <div className="relative z-20 flex flex-col justify-center items-center h-full">
            <div className="pt-6">
              <img
                src="/img/logo.svg"
                className="w-[310px] h-[auto]"
                alt="DBT Panel"
              />
            </div>

            <div className="flex-1 flex flex-col justify-end pb-5">
              <div className="max-w-[700px]">
                <h1 className="text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] mb-4">
                  {t("authLayout.headline")}
                </h1>
                <p className="text-md leading-0.5">
                  {t("authLayout.subheadline")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:p-8 w-full px-4">
          <div className="mx-auto flex w-full flex-col justify-center sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center lg:hidden">
              <img
                src="/logo.svg"
                className="mx-auto h-12 w-auto"
                alt="DBT Panel"
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
