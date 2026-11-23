"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  SALESPEOPLE_QUERY_KEY,
  useSalespeople,
} from "../../hooks/useTechnicalFile";
import {
  createSalesperson,
  updateSalesperson,
} from "../../services/technical-file";
import type { SalespersonInput } from "../../types/technical-file";

interface SalespersonFieldProps {
  value: string | null | undefined;
  onChange: (salespersonId: string | null) => void;
}

const NONE = "__none__";
const EMPTY_FORM = { name: "", email: "", phone: "" };

export function SalespersonField({ value, onChange }: SalespersonFieldProps) {
  const t = useTranslations("debtors.technicalFile");
  const { session, profile } = useProfileContext();
  const queryClient = useQueryClient();
  const { data: salespeople = [] } = useSalespeople();
  const [editing, setEditing] = useState<"new" | "edit" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const selected = salespeople.find((s) => s.id === value);

  const open = (mode: "new" | "edit") => {
    setForm(
      mode === "edit" && selected
        ? {
            name: selected.name,
            email: selected.email ?? "",
            phone: selected.phone ?? "",
          }
        : EMPTY_FORM,
    );
    setEditing(mode);
  };

  const save = async () => {
    const token = session?.token ?? "";
    const clientId = profile?.client?.id ?? "";
    const payload: SalespersonInput = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
    };
    try {
      const saved =
        editing === "edit" && selected
          ? await updateSalesperson(token, clientId, selected.id, payload)
          : await createSalesperson(token, clientId, payload);
      await queryClient.invalidateQueries({
        queryKey: [SALESPEOPLE_QUERY_KEY],
      });
      onChange(saved.id);
      setEditing(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("salespersonError"),
      );
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={value ?? NONE}
        onValueChange={(id) => onChange(id === NONE ? null : id)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("selectSalesperson")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{t("noSalesperson")}</SelectItem>
          {salespeople.map((salesperson) => (
            <SelectItem key={salesperson.id} value={salesperson.id}>
              {salesperson.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {editing ? (
        <div className="space-y-2 rounded-md border border-gray-200 p-3">
          <Input
            placeholder={t("salespersonName")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            placeholder={t("salespersonEmail")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            placeholder={t("salespersonPhone")}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {editing === "edit" && (
            <p className="text-xs text-muted-foreground">
              {t("salespersonSharedHint")}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!form.name.trim()}
              onClick={save}
            >
              {t("save")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing(null)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="link"
            className="px-0"
            onClick={() => open("new")}
          >
            {t("newSalesperson")}
          </Button>
          {selected && (
            <Button
              type="button"
              size="sm"
              variant="link"
              className="px-0"
              onClick={() => open("edit")}
            >
              {t("editSalesperson")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
