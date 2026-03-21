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
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import ScopesSelector from "./scopes-selector";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  scopes: z.array(z.string()).min(1),
});

type CreateApiKeyFormValues = z.infer<typeof createApiKeySchema>;

interface ApiKeyFormProps {
  onSubmit: (data: CreateApiKeyFormValues) => Promise<void>;
  onCancel: () => void;
}

const ApiKeyForm = ({ onSubmit, onCancel }: ApiKeyFormProps) => {
  const t = useTranslations("integrations");

  const form = useForm<CreateApiKeyFormValues>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      description: "",
      scopes: [],
    },
  });

  const handleSubmit = async (data: CreateApiKeyFormValues) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full space-y-4"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("apiKeys.form.name")}
                <span className="text-orange-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("apiKeys.form.namePlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("apiKeys.form.description")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("apiKeys.form.descriptionPlaceholder")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scopes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("apiKeys.form.scopes")}
                <span className="text-orange-500">*</span>
              </FormLabel>
              <FormControl>
                <ScopesSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t("apiKeys.form.cancel")}
          </Button>
          <Button
            type="submit"
            className="bg-blue-700 text-white"
            disabled={form.formState.isSubmitting}
          >
            {t("apiKeys.form.submit")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ApiKeyForm;
