"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePaymentProfile } from "../../hooks/useTechnicalFile";
import type {
  PaymentCalendar,
  PaymentCalendarProposal,
} from "../../types/technical-file";
import {
  describeCalendar,
  dismissProposal,
  isProposalDismissed,
} from "../../utils/technical-file";

interface PaymentCalendarSectionProps {
  debtorId?: string;
  value: PaymentCalendar | null | undefined;
  onChange: (calendar: PaymentCalendar | null) => void;
}

const DEFAULT_CALENDAR: PaymentCalendar = {
  kind: "MONTHLY",
  days: [],
  cutoff_days: 0,
  cutoff_base: "DUE_DATE",
  holiday_rule: "ADVANCE",
};

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => i + 1);
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const WEEKS = [1, 2, 3, 4, 5];

const fromProposal = (proposal: PaymentCalendarProposal): PaymentCalendar => ({
  ...DEFAULT_CALENDAR,
  kind: proposal.kind,
  days: proposal.days,
  weekday: proposal.weekday,
  weeks: proposal.kind === "WEEKLY" ? [] : undefined,
});

const toggle = (list: number[] = [], item: number, checked: boolean) =>
  checked
    ? [...list, item].sort((a, b) => a - b)
    : list.filter((n) => n !== item);

export function PaymentCalendarSection({
  debtorId,
  value,
  onChange,
}: PaymentCalendarSectionProps) {
  const t = useTranslations("debtors.technicalFile");
  const { data: profile } = usePaymentProfile(debtorId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PaymentCalendar>(
    value ?? DEFAULT_CALENDAR,
  );
  const [hidden, setHidden] = useState(
    () => !!debtorId && isProposalDismissed(debtorId),
  );

  const proposal = profile?.payment_calendar_proposal;
  const alert = profile?.payment_calendar_alert;
  const showProposal = !value && !!proposal && !hidden && !editing;
  const isValid =
    draft.kind === "MONTHLY" ? (draft.days?.length ?? 0) > 0 : !!draft.weekday;

  const startEditing = (base: PaymentCalendar) => {
    setDraft(base);
    setEditing(true);
  };

  const dismiss = () => {
    if (debtorId) dismissProposal(debtorId);
    setHidden(true);
  };

  const apply = () => {
    onChange(draft);
    setEditing(false);
  };

  const changeKind = (kind: string) =>
    setDraft(
      kind === "MONTHLY"
        ? {
            ...draft,
            kind,
            days: draft.days ?? [],
            weekday: undefined,
            weeks: undefined,
          }
        : {
            ...draft,
            kind: "WEEKLY",
            days: undefined,
            weekday: draft.weekday ?? 5,
            weeks: draft.weeks ?? [],
          },
    );

  return (
    <div className="space-y-3 rounded-md border border-gray-200 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <CalendarDays size={16} /> {t("paymentCalendar")}
      </p>

      {alert && value && (
        <Alert className="border-amber-300 bg-amber-50">
          <TriangleAlert className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            {t("calendarAlert", {
              out: alert.out_of_calendar,
              total: alert.total,
            })}
          </AlertDescription>
        </Alert>
      )}

      {showProposal && proposal && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="space-y-2">
            <p>
              {t("calendarProposal", {
                calendar: describeCalendar(proposal),
                coverage: Math.round(proposal.coverage * 100),
              })}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => startEditing(fromProposal(proposal))}
              >
                {t("confirm")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => startEditing(fromProposal(proposal))}
              >
                {t("correct")}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
                {t("dismiss")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("proposalNeedsCutoff")}
            </p>
          </AlertDescription>
        </Alert>
      )}

      {value && !editing && (
        <div className="flex items-center justify-between text-sm">
          <span>
            {t("calendarSummary", {
              calendar: describeCalendar(value),
              cutoff: value.cutoff_days,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => startEditing(value)}
            >
              {t("edit")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(null)}
            >
              {t("remove")}
            </Button>
          </div>
        </div>
      )}

      {!value && !editing && !showProposal && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => startEditing(DEFAULT_CALENDAR)}
        >
          {t("addCalendar")}
        </Button>
      )}

      {editing && (
        <div className="space-y-3">
          <Select value={draft.kind} onValueChange={changeKind}>
            <SelectTrigger className="w-60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">{t("kindMonthly")}</SelectItem>
              <SelectItem value="WEEKLY">{t("kindWeekly")}</SelectItem>
            </SelectContent>
          </Select>

          {draft.kind === "MONTHLY" ? (
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_MONTH.map((day) => (
                <label
                  key={day}
                  className="flex w-12 items-center gap-1 text-xs"
                >
                  <Checkbox
                    checked={draft.days?.includes(day) ?? false}
                    onCheckedChange={(c) =>
                      setDraft({
                        ...draft,
                        days: toggle(draft.days, day, c === true),
                      })
                    }
                  />
                  {day}
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Select
                value={String(draft.weekday ?? 5)}
                onValueChange={(w) =>
                  setDraft({ ...draft, weekday: Number(w) })
                }
              >
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      {t(`weekdays.${w}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span>{t("weeksOfMonth")}</span>
                {WEEKS.map((week) => (
                  <label key={week} className="flex items-center gap-1">
                    <Checkbox
                      checked={draft.weeks?.includes(week) ?? false}
                      onCheckedChange={(c) =>
                        setDraft({
                          ...draft,
                          weeks: toggle(draft.weeks, week, c === true),
                        })
                      }
                    />
                    {week}
                  </label>
                ))}
                <span className="text-muted-foreground">
                  {t("allWeeksHint")}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs">{t("cutoffDays")}</label>
              <Input
                type="number"
                min={0}
                value={draft.cutoff_days}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    cutoff_days: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs">{t("cutoffBase")}</label>
              <Select
                value={draft.cutoff_base}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    cutoff_base: v as PaymentCalendar["cutoff_base"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DUE_DATE">{t("baseDueDate")}</SelectItem>
                  <SelectItem value="RECEPTION">
                    {t("baseReception")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs">{t("holidayRule")}</label>
              <Select
                value={draft.holiday_rule}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    holiday_rule: v as PaymentCalendar["holiday_rule"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADVANCE">{t("holidayAdvance")}</SelectItem>
                  <SelectItem value="POSTPONE">
                    {t("holidayPostpone")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={!isValid} onClick={apply}>
              {t("save")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditing(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
