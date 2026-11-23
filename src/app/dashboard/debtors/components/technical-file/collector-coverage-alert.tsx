"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Contact } from "../../types";
import { hasCollectorCoverage } from "../../utils/technical-file";

export function CollectorCoverageAlert({ contacts }: { contacts: Contact[] }) {
  const t = useTranslations("debtors.technicalFile");
  if (contacts.length === 0 || hasCollectorCoverage(contacts)) return null;

  return (
    <Alert className="border-amber-300 bg-amber-50">
      <TriangleAlert className="h-4 w-4 text-amber-600" />
      <AlertDescription>{t("noCollectorCoverage")}</AlertDescription>
    </Alert>
  );
}
