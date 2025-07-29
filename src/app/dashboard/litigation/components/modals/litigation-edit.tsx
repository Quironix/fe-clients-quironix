"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useForgotPassword from "@/hooks/useForgotPassword";
import { cn } from "@/lib/utils";
import { useAuthLayout } from "@/stores/authLayout";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { HTMLAttributes } from "react";

type ForgotPasswordProps = HTMLAttributes<HTMLDivElement>;

export default function LitigationEdit({
  className,
  ...props
}: ForgotPasswordProps) {
  const { forgotPasswordForm, onSubmitForgotPassword, isLoading } =
    useForgotPassword();
  const { isLoading: isLoadingAuthLayout } = useAuthLayout();

  const renderRequestForm = () => (
    <Form {...forgotPasswordForm}>
      <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitForgotPassword)}>
        <div className="grid gap-5">
          <FormField
            control={forgotPasswordForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@quironix.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mx-auto flex w-full flex-col justify-center space-y-2">
            <Link
              href="/sign-in"
              className="text-sm text-primary font-medium text-center flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>

          <Button
            className="bg-primary hover:bg-primary/80 text-white"
            disabled={isLoading}
          >
            {isLoadingAuthLayout || isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                Recuperando contraseña...
              </span>
            ) : (
              "Recuperar contraseña"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
      <div className={cn("grid gap-3 space-y-1", className)} {...props}>
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email para recibir un enlace de recuperación
          </p>
        </div>

        {renderRequestForm()}
      </div>
  );
}
