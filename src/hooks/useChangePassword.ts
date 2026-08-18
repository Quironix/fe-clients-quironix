"use client";

import { changeOwnPassword } from "@/app/(auth)/sign-in/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const useChangePassword = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");

  const formSchema = z
    .object({
      new_password: z
        .string()
        .min(1, { message: t("changePassword.passwordRequired") })
        .regex(passwordRegex, { message: t("changePassword.passwordFormat") }),
      confirm_password: z
        .string()
        .min(1, { message: t("changePassword.confirmPasswordRequired") }),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t("changePassword.passwordMismatch"),
      path: ["confirm_password"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!session?.token) return;
    setIsLoading(true);
    try {
      await changeOwnPassword(data.new_password, session.token);
      await fetch("/api/auth/clear-cache", { method: "POST" });
      toast.success(t("changePassword.successTitle"), {
        description: t("changePassword.successDescription"),
      });
      form.reset();
      router.push("/dashboard/overview");
      router.refresh();
    } catch (error: any) {
      const description =
        error?.message === "PASSWORD_SAME_AS_CURRENT"
          ? t("changePassword.samePassword")
          : error?.message === "INVALID_PASSWORD_FORMAT"
            ? t("changePassword.passwordFormat")
            : t("changePassword.errorDescription");

      toast.error(t("changePassword.errorTitle"), { description });
    } finally {
      setIsLoading(false);
    }
  };

  return { form, onSubmit, isLoading };
};

export default useChangePassword;
