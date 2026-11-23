"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Contact } from "../../types";
import { functionsWithoutDefault } from "../../utils/technical-file";

export function ContactsSummary({ contacts }: { contacts: Contact[] }) {
  const t = useTranslations("debtors.technicalFile");
  const active = contacts.filter((contact) => contact.enabled !== false);
  const defaults = active.filter((contact) => contact.default).length;
  const missing = functionsWithoutDefault(contacts);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t("contactsSummary", { active: active.length, defaults })}
      </p>
      {missing.length > 0 && (
        <Alert className="border-amber-300 bg-amber-50">
          <TriangleAlert className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            {t("missingDefault", { functions: missing.join(", ") })}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
