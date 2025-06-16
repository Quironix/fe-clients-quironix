"use client";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import useLogin from "@/hooks/useLogin";
import { cn } from "@/lib/utils";
import { useAuthLayout } from "@/stores/authLayout";
import { Loader2 } from "lucide-react";
import { HTMLAttributes } from "react";
import AuthLayout from "../AuthLayout";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

export default function Login({ className, ...props }: UserAuthFormProps) {
  const { onSubmit, form, isLoading } = useLogin();
  const { isLoading: isLoadingAuthLayout } = useAuthLayout();

  return (
    <AuthLayout>
      <div className={cn("grid gap-3 space-y-1", className)} {...props}>
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bienvenidos/as
          </h1>
          <p className="text-sm text-muted-foreground">
            Por favor, completa los datos para ingresar.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder="jhon@doe.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <div className="flex items-center justify-between">
                      <FormLabel>Contraseña</FormLabel>
                      {/* <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-muted-foreground hover:opacity-75"
                    >
                      Forgot password?
                    </Link> */}
                    </div>
                    <FormControl>
                      <PasswordInput placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mx-auto flex w-full flex-col justify-center space-y-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary font-medium text-center"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                disabled={isLoading}
              >
                {isLoadingAuthLayout ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    Iniciando
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
