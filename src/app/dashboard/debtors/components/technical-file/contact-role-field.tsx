"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { useContactRoles } from "../../hooks/useTechnicalFile";
import { functionOfRole } from "../../utils/technical-file";

interface ContactRoleFieldProps {
  value: string;
  onChange: (role: string, derivedFunction: string) => void;
}

export function ContactRoleField({ value, onChange }: ContactRoleFieldProps) {
  const t = useTranslations("debtors.technicalFile");
  const { data: roles = [] } = useContactRoles();
  const isLegacy =
    roles.length > 0 && !!value && !roles.some((role) => role.name === value);
  const isLoading = roles.length === 0 && !!value;

  return (
    <Select
      value={value || undefined}
      onValueChange={(role) => onChange(role, functionOfRole(roles, role))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("selectRole")} />
      </SelectTrigger>
      <SelectContent>
        {isLegacy && (
          <SelectItem value={value} disabled>
            {t("unclassifiedRole", { role: value })}
          </SelectItem>
        )}
        {roles.map((role) => (
          <SelectItem key={role.name} value={role.name}>
            {role.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
