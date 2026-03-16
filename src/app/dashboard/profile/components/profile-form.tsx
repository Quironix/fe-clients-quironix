"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import type { E164Number } from "libphonenumber-js/core";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { resetPassword, updateProfile } from "../services";
import AvatarInitials from "./avatar-initials";

const ProfileForm = () => {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const { profile, refreshProfile } = useProfileContext();
  const { data: session }: { data: { token: string } | null } =
    useSession() as { data: { token: string } | null };
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const profileFormSchema = z.object({
    first_name: z
      .string()
      .min(2, t("form.fieldRequired"))
      .max(50, t("form.maxChars", { max: 50 })),
    last_name: z
      .string()
      .min(2, t("form.fieldRequired"))
      .max(50, t("form.maxChars", { max: 50 })),
    phone_number: z
      .string()
      .min(8, t("form.fieldRequired"))
      .max(20, t("form.maxChars", { max: 20 })),
  });

  type ProfileFormValues = z.infer<typeof profileFormSchema>;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
    defaultValues: {
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      phone_number: profile?.phone_number ?? "",
    },
  });

  const handleSubmit = async (data: ProfileFormValues) => {
    if (!session?.token || !profile?.client?.id || !profile?.id) return;
    try {
      await updateProfile(profile.id, data, session.token, profile.client.id);
      await fetch("/api/auth/clear-cache", { method: "POST" });
      await refreshProfile();
      toast.success(t("toast.updateSuccess"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("toast.updateError"));
      }
    }
  };

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    setIsResettingPassword(true);
    try {
      await resetPassword(profile.email);
      toast.success(t("toast.passwordSent"));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("toast.passwordError"));
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  useEffect(() => {
    if (!profile) return;
    form.reset({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone_number: profile.phone_number ?? "",
    });
  }, [profile, form]);

  const roles: { id: string; name: string }[] = Array.isArray(profile?.roles)
    ? profile.roles
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <AvatarInitials
          firstName={profile?.first_name ?? ""}
          lastName={profile?.last_name ?? ""}
          size="lg"
        />
        <div>
          <p className="text-lg font-bold">
            {profile?.first_name} {profile?.last_name}
          </p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
          {roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {roles.map((role) => (
                <Badge key={role.id} variant="secondary">
                  {role.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.firstName")}
                    <span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.firstNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("form.lastName")}
                    <span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.lastNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel>{t("form.email")}</FormLabel>
            <FormControl>
              <Input
                type="email"
                value={profile?.email ?? ""}
                disabled
                readOnly
              />
            </FormControl>
          </FormItem>

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("form.phone")}
                  <span className="text-orange-500">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder={t("form.phonePlaceholder")}
                    defaultCountry="CL"
                    value={field.value as E164Number}
                    onChange={(value: E164Number | undefined) =>
                      field.onChange(value ?? "")
                    }
                    error={!!form.formState.errors.phone_number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center pt-2">
            <DialogConfirm
              title={t("resetPassword.confirmTitle")}
              description={t("resetPassword.confirmDescription")}
              confirmButtonText={
                isResettingPassword
                  ? tc("loading.sending")
                  : t("changePassword")
              }
              isOpen={isResetDialogOpen}
              setIsOpen={setIsResetDialogOpen}
              onConfirm={handleResetPassword}
              type="warning"
              triggerButton={
                <Button type="button" variant="outline">
                  {t("changePassword")}
                </Button>
              }
            />
            <Button
              type="submit"
              className="bg-blue-700 text-white"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? tc("loading.saving")
                : tc("buttons.save")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ProfileForm;
