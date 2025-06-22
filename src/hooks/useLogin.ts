// import { signIn } from '@/services/auth';

import { requestPasswordReset } from "@/app/(auth)/sign-in/services/auth.service";
import { useAuthLayout } from "@/stores/authLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Regex para validación de contraseña
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, {
      message: "Please enter your password",
    })
    .min(6, {
      message: "Password must be at least 6 characters long",
    }),
});

// Schema para recuperación de contraseña
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Por favor ingresa tu email" })
    .email({ message: "Email inválido" }),
});

const useLogin = () => {
  const router = useRouter();
  const { setIsLoading, isLoading } = useAuthLayout();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form para recuperación de contraseña
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Limpiar caché al iniciar sesión
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
        // Si el error viene del endpoint, mostramos el mensaje específico
        // const errorMessage = result.error.includes("Invalid password or email")
        //   ? "Email o contraseña incorrectos"
        //   : result.error;

        toast.error("Error de autenticación", {
          description: "Valida tus credenciales",
        });
        return;
      }

      // Si no hay error, procedemos con la redirección
      toast.success("Inicio de sesión exitoso", {
        description: "Bienvenido/a",
      });
      form.reset();
      router.push("/dashboard/overview");
    } catch (error: any) {
      console.log("ERROR", error);
      // Si el error viene del endpoint, mostramos el mensaje específico
      // const errorMessage = error.message.includes("Invalid password or email")
      //   ? "Email o contraseña incorrectos"
      //   : error.message || "Por favor verifica tus credenciales";

      toast.error("Error de autenticación", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para solicitar recuperación de contraseña
  const onSubmitForgotPassword = async (
    data: z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      toast.success("Email enviado", {
        description: "Te hemos enviado un enlace para recuperar tu contraseña",
      });
      forgotPasswordForm.reset();
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
    onSubmit,
    form,
    isLoading,
    forgotPasswordForm,
    onSubmitForgotPassword,
    passwordRegex,
  };
};

export default useLogin;
