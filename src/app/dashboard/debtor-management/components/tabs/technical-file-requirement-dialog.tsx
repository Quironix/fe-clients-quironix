"use client";

import { ContactRoleField } from "@/app/dashboard/debtors/components/technical-file/contact-role-field";
import { useDebtorsStore } from "@/app/dashboard/debtors/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const CONTACT_ROLE_REQUIRED = "CONTACT_ROLE_REQUIRED";
export const DEBTOR_SCHEDULE_REQUIRED = "DEBTOR_SCHEDULE_REQUIRED";

export const isTechnicalFileRequirement = (message: string) =>
  message === CONTACT_ROLE_REQUIRED || message === DEBTOR_SCHEDULE_REQUIRED;

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

interface TechnicalFileRequirementDialogProps {
  requirement: string | null;
  contactId?: string;
  token: string;
  clientId: string;
  onCompleted: () => void;
  onCancel: () => void;
}

export function TechnicalFileRequirementDialog({
  requirement,
  contactId,
  token,
  clientId,
  onCompleted,
  onCancel,
}: TechnicalFileRequirementDialogProps) {
  const t = useTranslations("debtors.technicalFile");
  const { dataDebtor, updateDebtor, setDataDebtor } = useDebtorsStore();
  const [role, setRole] = useState("");
  const [days, setDays] = useState<string[]>(WEEKDAYS);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("18:00");
  const [saving, setSaving] = useState(false);

  const needsRole = requirement === CONTACT_ROLE_REQUIRED;
  const canSave = needsRole ? !!role : days.length > 0 && start < end;

  const save = async () => {
    setSaving(true);
    try {
      const changes = needsRole
        ? {
            contacts: (dataDebtor.contacts ?? []).map((contact: any) =>
              contact.id === contactId ? { ...contact, role } : contact,
            ),
          }
        : {
            attention_days_hours: days.map((day) => ({
              day,
              hour_start: start,
              hour_end: end,
            })),
          };
      await updateDebtor(token, clientId, { id: dataDebtor.id, ...changes });
      setDataDebtor({ ...dataDebtor, ...changes });
      onCompleted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!requirement} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {needsRole ? t("requireRoleTitle") : t("requireScheduleTitle")}
          </DialogTitle>
          <DialogDescription>
            {needsRole ? t("requireRoleHint") : t("requireScheduleHint")}
          </DialogDescription>
        </DialogHeader>

        {needsRole ? (
          <ContactRoleField
            value={role}
            onChange={(selected) => setRole(selected)}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              {WEEKDAYS.map((day) => (
                <label key={day} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={days.includes(day)}
                    onCheckedChange={(checked) =>
                      setDays(
                        checked === true
                          ? [...days, day]
                          : days.filter((d) => d !== day),
                      )
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <Input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <Input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" disabled={!canSave || saving} onClick={save}>
            {t("saveAndContinue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
