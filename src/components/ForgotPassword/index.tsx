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
import { useTranslations } from "next-intl";
import Link from "next/link";
import { HTMLAttributes } from "react";
import AuthLayout from "../AuthLayout";

type ForgotPasswordProps = HTMLAttributes<HTMLDivElement>;

export default function ForgotPassword({
  className,
  ...props
}: ForgotPasswordProps) {
  const { forgotPasswordForm, onSubmitForgotPassword, isLoading } =
    useForgotPassword();
  const { isLoading: isLoadingAuthLayout } = useAuthLayout();
  const t = useTranslations("auth");

  const renderRequestForm = () => (
    <Form {...forgotPasswordForm}>
      <form onSubmit={forgotPasswordForm.handleSubmit(onSubmitForgotPassword)}>
        <div className="grid gap-5">
          <FormField
            control={forgotPasswordForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>{t("forgotPassword.email")}</FormLabel>
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
              {t("forgotPassword.backToLogin")}
            </Link>
          </div>

          <Button
            className="bg-primary hover:bg-primary/80 text-white"
            disabled={isLoading}
          >
            {isLoadingAuthLayout || isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                {t("forgotPassword.submitting")}
              </span>
            ) : (
              t("forgotPassword.submit")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <AuthLayout>
      <div className={cn("grid gap-3 space-y-1", className)} {...props}>
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("forgotPassword.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("forgotPassword.subtitle")}
          </p>
        </div>

        {renderRequestForm()}
      </div>
    </AuthLayout>
  );
}
