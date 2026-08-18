"use client";
import AuthLayout from "@/components/AuthLayout";
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
import useChangePassword from "@/hooks/useChangePassword";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { HTMLAttributes } from "react";

type ChangePasswordProps = HTMLAttributes<HTMLDivElement>;

export default function ChangePassword({
  className,
  ...props
}: ChangePasswordProps) {
  const { form, onSubmit, isLoading } = useChangePassword();
  const t = useTranslations("auth");

  return (
    <AuthLayout>
      <div className={cn("grid gap-3 space-y-1", className)} {...props}>
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("changePassword.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("changePassword.subtitle")}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-5">
              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>{t("changePassword.newPassword")}</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>
                      {t("changePassword.confirmPassword")}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    {t("changePassword.submitting")}
                  </span>
                ) : (
                  t("changePassword.submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
