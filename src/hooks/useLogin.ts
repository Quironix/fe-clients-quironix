import { requestPasswordReset } from "@/app/(auth)/sign-in/services/auth.service";
import { useAuthLayout } from "@/stores/authLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, SignInResponse } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const useLogin = () => {
  const router = useRouter();
  const { setIsLoading, isLoading } = useAuthLayout();
  const t = useTranslations("auth");

  const formSchema = z.object({
    email: z
      .string()
      .min(1, { message: t("login.emailRequired") })
      .email({ message: t("login.emailInvalid") }),
    password: z
      .string()
      .min(1, {
        message: t("login.passwordRequired"),
      })
      .min(6, {
        message: t("login.passwordMinLength"),
      }),
  });

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, { message: t("forgotPassword.emailRequired") })
      .email({ message: t("forgotPassword.emailInvalid") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema) as any,
    defaultValues: {
      email: "",
    },
  });

  const clearCache = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    clearCache();
    try {
      const result = (await signIn("credentials", {
        redirectTo: "/dashboard/overview",
        ...data,
        redirect: false,
      })) as unknown as SignInResponse;

      if (result?.error) {
        toast.error(t("login.errorTitle"), {
          description: t("login.errorDescription"),
        });
        return;
      }

      toast.success(t("login.successTitle"), {
        description: t("login.successDescription"),
      });
      form.reset();
      router.push("/dashboard/overview");
    } catch (error: any) {
      console.log("ERROR", error);
      toast.error(t("login.errorTitle"), {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForgotPassword = async (
    data: z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      toast.success(t("forgotPassword.successTitle"), {
        description: t("forgotPassword.successDescription"),
      });
      forgotPasswordForm.reset();
    } catch (error: any) {
      toast.error(t("forgotPassword.errorTitle"), {
        description:
          error.message ||
          t("forgotPassword.errorDescription"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onSubmit,
    form,
    isLoading,
    forgotPasswordForm,
    onSubmitForgotPassword,
    passwordRegex,
  };
};

export default useLogin;
