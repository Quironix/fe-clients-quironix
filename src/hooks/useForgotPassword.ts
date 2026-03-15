import { requestPasswordReset } from "@/app/(auth)/sign-in/services/auth.service";
import { useAuthLayout } from "@/stores/authLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const useForgotPassword = () => {
  const router = useRouter();
  const { setIsLoading, isLoading } = useAuthLayout();
  const [email, setEmail] = useState("");
  const t = useTranslations("auth");

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .min(1, { message: t("forgotPassword.emailRequired") })
      .email({ message: t("forgotPassword.emailInvalid") }),
  });

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema) as any,
    defaultValues: {
      email: "",
    },
  });

  const onSubmitForgotPassword = async (
    data: z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      setEmail(data.email);
      toast.success(t("forgotPassword.successTitle"), {
        description: t("forgotPassword.successDescription"),
      });
      forgotPasswordForm.reset();

      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
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
    forgotPasswordForm,
    onSubmitForgotPassword,
    isLoading,
    email,
  };
};

export default useForgotPassword;
