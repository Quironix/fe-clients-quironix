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
import { useTranslations } from "next-intl";
import { HTMLAttributes } from "react";
import AuthLayout from "../AuthLayout";

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

export default function Login({ className, ...props }: UserAuthFormProps) {
  const { onSubmit, form, isLoading } = useLogin();
  const { isLoading: isLoadingAuthLayout } = useAuthLayout();
  const t = useTranslations("auth");

  return (
    <AuthLayout>
      <div className={cn("grid gap-3 space-y-1", className)} {...props}>
        <div className="flex flex-col space-y-2 text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("login.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("login.subtitle")}
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
                    <FormLabel>{t("login.email")}</FormLabel>
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
                      <FormLabel>{t("login.password")}</FormLabel>
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
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                disabled={isLoading}
              >
                {isLoadingAuthLayout ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" />
                    {t("login.submitting")}
                  </span>
                ) : (
                  t("login.submit")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
}
