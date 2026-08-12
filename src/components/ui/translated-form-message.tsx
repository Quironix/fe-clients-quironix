"use client";

import { useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface TranslatedFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const VALIDATION_KEY_PREFIX = "validation.";

export function TranslatedFormMessage({ className, children, ...props }: TranslatedFormMessageProps) {
  const { error, formMessageId } = useFormField();
  const t = useTranslations("common");

  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  const isI18nKey = typeof body === "string" && body.startsWith(VALIDATION_KEY_PREFIX);
  const displayText = isI18nKey ? t(body as Parameters<typeof t>[0]) : body;

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {displayText}
    </p>
  );
}
