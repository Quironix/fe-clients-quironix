"use client";
import { cn, formatNumber } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { QuironMark } from "./quiron-mark";
import { IntentBadge } from "./intent-badge";
import { AgentStatusBadge } from "./agent-status-badge";

interface ExtractedPaymentProof {
  paid_on?: string | null;
  amount?: number | string | null;
  invoice_numbers?: string[] | null;
}

interface ExtractedPaymentPromise {
  date?: string | null;
  amount?: number | string | null;
  medium?: "CHECK" | "DEPOSIT_OR_TRANSFER" | null;
  invoice_numbers?: string[] | null;
}

export interface QuironExtracted {
  payment_proof?: ExtractedPaymentProof | null;
  payment_promise?: ExtractedPaymentPromise | null;
  disputed_amount?: boolean | null;
}

export interface QuironVerdictProps {
  intent?: string | null;
  confidence?: number | null;
  threshold?: number | null;
  secondaryIntents?: string[] | null;
  agentStatus?: string | null;
  guardrailTriggered?: boolean | null;
  toolsUsed?: string[] | null;
  summary?: string | null;
  extracted?: QuironExtracted | null;
  combo?: string | null;
  linkedTrackId?: string | null;
  suggestedReply?: string | null;
  onViewTrack?: () => void;
  compact?: boolean;
  className?: string;
}

const pct = (v?: number | null) =>
  v == null ? null : Math.round(v <= 1 ? v * 100 : v);

const amount = (v?: number | string | null) => {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? Number(v.replace(/[^\d.-]/g, "")) : v;
  return Number.isFinite(n) ? formatNumber(n as number) : String(v);
};

export const QuironVerdict = ({
  intent,
  confidence,
  threshold,
  secondaryIntents,
  agentStatus,
  guardrailTriggered,
  toolsUsed,
  summary,
  extracted,
  combo,
  linkedTrackId,
  suggestedReply,
  onViewTrack,
  compact = false,
  className,
}: QuironVerdictProps) => {
  const t = useTranslations("quiron");
  const tv = useTranslations("dashboard.invoice_inbox.verdict");

  const proof = extracted?.payment_proof;
  const promise = extracted?.payment_promise;
  const confPct = pct(confidence);
  const thrPct = pct(threshold);

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) =>
    value ? (
      <div className="flex gap-2 text-xs">
        <span className="text-muted-foreground min-w-24">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    ) : null;

  return (
    <div
      className={cn(
        compact ? "space-y-2" : "space-y-3 rounded-lg border p-3",
        className,
      )}
      style={
        compact
          ? undefined
          : {
              borderColor:
                "color-mix(in srgb, var(--quiron) 25%, transparent)",
              backgroundColor:
                "color-mix(in srgb, var(--quiron) 4%, transparent)",
            }
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <QuironMark size="sm" />
        <span className="text-sm font-semibold">{t("verdict_title")}</span>
        <AgentStatusBadge
          agentStatus={agentStatus}
          guardrailTriggered={guardrailTriggered}
          suggestedReply={suggestedReply}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <IntentBadge intent={intent} />
        {confPct != null && (
          <span className="text-[11px] text-muted-foreground">
            {t("confidence", { value: confPct })}
            {thrPct != null ? ` · ${t("threshold", { value: thrPct })}` : ""}
          </span>
        )}
      </div>
      {confPct != null && (
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${Math.min(confPct, 100)}%`,
              backgroundColor: "var(--quiron)",
            }}
          />
        </div>
      )}

      {secondaryIntents && secondaryIntents.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-muted-foreground">
            {t("secondary")}:
          </span>
          {secondaryIntents.map((s) => (
            <IntentBadge key={s} intent={s} />
          ))}
        </div>
      )}

      {(summary || proof || promise) && (
        <div className="space-y-1.5 rounded-md bg-background/60 p-2">
          <div className="text-xs font-semibold">{t("understood")}:</div>
          {summary && (
            <p className="text-xs text-muted-foreground">{summary}</p>
          )}
          {combo && (
            <div className="text-xs font-medium">{t(`combo.${combo}`)}</div>
          )}
          {promise && (
            <>
              <Row
                label={t("promise_date")}
                value={promise.date ?? undefined}
              />
              <Row
                label={t("promise_amount")}
                value={amount(promise.amount)}
              />
              <Row
                label={t("promise_medium")}
                value={
                  promise.medium ? t(`medium.${promise.medium}`) : undefined
                }
              />
              <Row
                label={t("invoices")}
                value={promise.invoice_numbers?.join(", ") || undefined}
              />
            </>
          )}
          {proof && (
            <>
              <Row
                label={t("proof_paid_on")}
                value={proof.paid_on ?? undefined}
              />
              <Row label={t("proof_amount")} value={amount(proof.amount)} />
              <Row
                label={t("invoices")}
                value={proof.invoice_numbers?.join(", ") || undefined}
              />
            </>
          )}
          {extracted?.disputed_amount && (
            <p className="text-xs font-medium text-red-600">
              {t("disputed_amount")}
            </p>
          )}
        </div>
      )}

      {toolsUsed && toolsUsed.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] text-muted-foreground">
            {t("tools")}:
          </span>
          {toolsUsed.map((tool) => (
            <span
              key={tool}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium"
            >
              {tool}
            </span>
          ))}
        </div>
      )}

      {agentStatus && (
        <p className="text-[11px] text-muted-foreground">
          {agentStatus === "ROUTED_TO_MATCHING"
            ? tv("route_matching")
            : guardrailTriggered
              ? tv("route_guardrail")
              : suggestedReply
                ? tv("route_suggestion")
                : agentStatus === "SHADOW_ONLY"
                  ? t("shadow_hint")
                  : agentStatus === "ESCALATED_TO_HUMAN"
                    ? tv("route_review")
                    : ""}
        </p>
      )}

      {linkedTrackId && onViewTrack && (
        <button
          type="button"
          onClick={onViewTrack}
          className="text-xs font-semibold"
          style={{ color: "var(--quiron-dark)" }}
        >
          {t("view_track")}
        </button>
      )}

      {suggestedReply && (
        <div className="space-y-1">
          <div className="text-xs font-semibold">{t("suggested_reply")}</div>
          <p className="whitespace-pre-wrap rounded-md bg-muted p-2 text-xs text-muted-foreground">
            {suggestedReply}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {t("suggested_reply_hint")}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuironVerdict;
