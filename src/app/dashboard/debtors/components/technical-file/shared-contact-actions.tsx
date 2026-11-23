"use client";

import DebtorsSelectInline from "@/app/dashboard/components/debtors-select-inline";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  getSharedContactImpact,
  linkSharedContact,
} from "../../services/technical-file";

interface SharedContactActionsProps {
  debtorId: string;
  contactId: string;
}

export function SharedContactActions({
  debtorId,
  contactId,
}: SharedContactActionsProps) {
  const t = useTranslations("debtors.technicalFile");
  const { session, profile } = useProfileContext();
  const queryClient = useQueryClient();
  const [targetId, setTargetId] = useState<string>("");
  const [linking, setLinking] = useState(false);
  const [open, setOpen] = useState(false);
  const token = session?.token ?? "";
  const clientId = profile?.client?.id ?? "";
  const queryKey = ["shared-contact-impact", debtorId, contactId];

  const { data: impact } = useQuery({
    queryKey,
    queryFn: () => getSharedContactImpact(token, clientId, debtorId, contactId),
    enabled: !!token && !!clientId,
    staleTime: 30 * 1000,
  });

  const link = async () => {
    setLinking(true);
    try {
      await linkSharedContact(token, clientId, debtorId, contactId, targetId);
      await queryClient.invalidateQueries({ queryKey });
      setTargetId("");
      setOpen(false);
      toast.success(t("linked"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("saveError"));
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm">
        <Users size={16} className="text-muted-foreground" />
        <span className="text-muted-foreground">
          {impact && impact.affected_debtors > 1
            ? t("sharedWith", { count: impact.affected_debtors })
            : t("notShared")}
        </span>
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => setOpen(!open)}
        >
          {open ? t("cancel") : t("shareContact")}
        </Button>
      </div>
      {open && (
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <DebtorsSelectInline
              field={{ value: targetId, onChange: setTargetId, name: "target" }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!targetId || targetId === debtorId || linking}
            onClick={link}
          >
            {t("linkContact")}
          </Button>
        </div>
      )}
    </div>
  );
}
