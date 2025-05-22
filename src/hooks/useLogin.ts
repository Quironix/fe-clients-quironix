// import { signIn } from '@/services/auth';

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthLayout } from "@/stores/authLayout";
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);

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

  return { onSubmit, form, isLoading };
};

export default useLogin;
