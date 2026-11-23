"use client";

import { Input } from "@/components/ui/input";
import { useContactRoles } from "../../hooks/useTechnicalFile";
import { functionOfRole } from "../../utils/technical-file";

export function ContactFunctionField({ role }: { role: string }) {
  const { data: roles = [] } = useContactRoles();

  return (
    <Input
      readOnly
      disabled
      value={functionOfRole(roles, role)}
      placeholder="—"
      className="bg-gray-50"
    />
  );
}
