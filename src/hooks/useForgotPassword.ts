import { requestPasswordReset } from "@/app/(auth)/sign-in/services/auth.service";
import { useAuthLayout } from "@/stores/authLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema para solicitar recuperación de contraseña
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Por favor ingresa tu email" })
    .email({ message: "Email inválido" }),
});

export const useForgotPassword = () => {
  const router = useRouter();
  const { setIsLoading, isLoading } = useAuthLayout();
  const [email, setEmail] = useState("");

  // Form para solicitar recuperación
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Función para solicitar recuperación de contraseña
  const onSubmitForgotPassword = async (
    data: z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      setEmail(data.email);
      toast.success("Email enviado", {
        description: "Te hemos enviado un enlace para recuperar tu contraseña",
      });
      forgotPasswordForm.reset();

      // Redirect al sign-in después de enviar el correo
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (error: any) {
      toast.error("Error al enviar email", {
        description:
          error.message ||
          "Ocurrió un error al enviar el email de recuperación",
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
