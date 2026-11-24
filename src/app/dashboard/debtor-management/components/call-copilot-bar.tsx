"use client";

import { useWebRTCContext } from "@/context/WebRTCContext";
import { cn, formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { QuironIcon } from "@/components/quiron/quiron-icon";
import { QuironLoader } from "@/components/quiron/quiron-loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronUp, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCallTranscription } from "../hooks/useCallTranscription";
import {
  getCallCopilotConfig,
  proposeCallManagement,
} from "../services/call-copilot";
import { proposalSignature, useCallCopilotStore } from "../store/call-copilot";
import type { CallProposal } from "../types/call-copilot";

const PROPOSE_INTERVAL_MS = 15000;
const HANGUP_GRACE_MS = 2500;
const MAX_TURNS = 400;
const LIVE_TEXT_CHARS = 90;

interface CallCopilotBarProps {
  debtorId: string;
  accessToken: string;
  clientId: string;
  onApply: () => void;
}

const formatDay = (iso: unknown) =>
  typeof iso === "string" ? format(new Date(iso), "dd-MM-yyyy") : null;

const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const summaryOf = (proposal: CallProposal) => {
  const amount = proposal.caseData.amount ?? proposal.caseData.paymentAmount;
  const day = formatDay(
    proposal.caseData.commitmentDate ?? proposal.caseData.paymentDate
  );
  const invoices = proposal.invoices.map((invoice) => invoice.number).join(", ");
  return {
    amount: typeof amount === "number" ? formatNumber(amount) : null,
    day,
    invoices,
  };
};

const darkQuironColors = {
  "--quiron-flow-1": "#406df6",
  "--quiron-flow-2": "#4f8bff",
  "--quiron-flow-3": "#2f9bff",
  "--quiron-flow-4": "#22d3c8",
  "--quiron-flow-5": "#9ff3e6",
  "--quiron-mark-1": "#1249c7",
  "--quiron-mark-2": "#3d7bff",
  "--quiron-mark-3": "#8fb3ff",
} as React.CSSProperties;

const Avatar = ({
  animated,
  error,
  icon,
}: {
  animated: boolean;
  error: boolean;
  icon?: boolean;
}) => (
  <div
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10"
    style={darkQuironColors}
  >
    {error ? (
      <QuironIcon size={22} tone="current" className="text-red-300" />
    ) : animated && !icon ? (
      <QuironLoader size={28} />
    ) : (
      <QuironIcon size={22} animated={animated} />
    )}
  </div>
);

const ghostButton =
  "h-9 shrink-0 rounded-full bg-white/10 px-4 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-40";
const acceptButton =
  "h-9 shrink-0 rounded-full bg-brand-orange px-5 text-sm font-semibold text-white hover:bg-brand-orange-dark disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/50";

const CommentSelect = ({
  proposal,
  value,
  label,
  onChange,
}: {
  proposal: CallProposal;
  value: string;
  label: (comment: string) => string;
  onChange: (comment: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={proposal.label}
          aria-expanded={open}
          className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 text-sm text-white hover:bg-white/20"
        >
          {label(value)}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={8}
        className="w-auto min-w-[12rem] rounded-2xl border-white/15 bg-primary-ink p-1 text-white"
      >
        {proposal.executiveCommentOptions?.map((comment) => (
          <button
            key={comment}
            type="button"
            onClick={() => {
              onChange(comment);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-white hover:bg-white/15"
          >
            {label(comment)}
            {comment === value && <Check className="h-4 w-4 text-emerald-300" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export const CallCopilotBar = ({
  debtorId,
  accessToken,
  clientId,
  onApply,
}: CallCopilotBarProps) => {
  const t = useTranslations("debtorManagement.callCopilot");
  const { callStreams, currentNumber } = useWebRTCContext();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [wasLive, setWasLive] = useState(false);
  const [choices, setChoices] = useState<Record<string, string>>({});

  const { data: config } = useQuery({
    queryKey: ["call-copilot-config", clientId],
    queryFn: () => getCallCopilotConfig(accessToken, clientId),
    enabled: !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const enabled = config?.enabled === true;

  const { turns, status } = useCallTranscription({
    enabled,
    accessToken,
    clientId,
  });
  const {
    summary,
    proposals,
    dismissed,
    saved,
    registered,
    startSession,
    setProposals,
    apply,
    dismiss,
  } = useCallCopilotStore();

  const turnsRef = useRef(turns);
  turnsRef.current = turns;
  const sentRef = useRef(0);
  const inFlightRef = useRef(false);
  const endedSentRef = useRef(false);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;

  useEffect(() => {
    if (!enabled || !callStreams) return;
    sentRef.current = 0;
    endedSentRef.current = false;
    setHidden(false);
    setOpen(false);
    setElapsed(0);
    setWasLive(true);
    setChoices({});
    startSession(callStreams.sessionId, currentNumber);
  }, [enabled, callStreams?.sessionId]);

  useEffect(() => {
    if (!callStreams) return;
    const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [callStreams?.sessionId]);

  const propose = useCallback(async (ended = false) => {
    const current = turnsRef.current;
    const sessionId = useCallCopilotStore.getState().sessionId;
    if (!sessionId || inFlightRef.current) return;
    if (ended) {
      if (endedSentRef.current) return;
    } else if (
      current.length === sentRef.current ||
      !current.some((turn) => turn.speaker === "DEBTOR")
    ) {
      return;
    }

    inFlightRef.current = true;
    sentRef.current = current.length;
    if (ended) endedSentRef.current = true;
    try {
      const response = await proposeCallManagement(
        accessToken,
        clientId,
        debtorId,
        {
          sessionId,
          turns: current.slice(-MAX_TURNS),
          ...(ended && {
            callEnded: true,
            durationSeconds: elapsedRef.current,
          }),
        }
      );
      setProposals(response.summary, response.proposals);
    } catch {
      sentRef.current = 0;
      endedSentRef.current = false;
    } finally {
      inFlightRef.current = false;
    }
  }, [accessToken, clientId, debtorId, setProposals]);

  useEffect(() => {
    if (!enabled || !callStreams) return;
    const timer = setInterval(() => propose(), PROPOSE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, callStreams, propose]);

  useEffect(() => {
    if (!enabled || callStreams) return;
    const timer = setTimeout(() => propose(true), HANGUP_GRACE_MS);
    return () => clearTimeout(timer);
  }, [enabled, callStreams, propose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const shown = proposals.filter(
    (proposal) => !dismissed.includes(proposalSignature(proposal))
  );

  const live = !!callStreams;
  const visible =
    enabled &&
    !hidden &&
    (live || wasLive || turns.length > 0 || shown.length > 0);
  if (!visible) return null;

  const commentLabel = (comment: string) => t(`noAnswerComments.${comment}`);
  const choiceOf = (proposal: CallProposal) =>
    choices[proposal.id] ?? proposal.executiveComment;
  const pickComment = (proposal: CallProposal, comment: string) =>
    setChoices((current) => ({ ...current, [proposal.id]: comment }));
  const nextText = (proposal: CallProposal) =>
    proposal.nextManagementDate
      ? t("nextManagement", { date: formatDay(proposal.nextManagementDate) })
      : "";

  const showsNext = (proposal: CallProposal) =>
    proposal.scenario === "NO_ANSWER" || proposal.scenario === "OTHER_INVOICES";

  const isSaved = (proposal: CallProposal) =>
    saved.includes(proposalSignature(proposal));
  const pending = shown.filter((proposal) => !isSaved(proposal));

  const acceptLabel = () =>
    pending.length > 1
      ? t("save")
      : saved.length > 0
        ? t("acceptAndSend")
        : t("accept");

  const handleApply = (proposal: CallProposal, mode: "accept" | "edit") => {
    const saving = mode === "accept" && pending.length > 1;
    apply(
      { ...proposal, executiveComment: choiceOf(proposal) },
      saving ? "save" : mode
    );
    if (!saving) setOpen(false);
    onApply();
  };

  const error = live && status === "error";
  const lastTurn = turns[turns.length - 1];
  const lastText = lastTurn
    ? lastTurn.text.length > LIVE_TEXT_CHARS
      ? `…${lastTurn.text.slice(-LIVE_TEXT_CHARS)}`
      : lastTurn.text
    : null;
  const placeholder = live
    ? error
      ? t("statusError")
      : status === "live"
        ? t("listening")
        : t("statusConnecting")
    : t("statusEnded");

  const single = shown.length === 1 ? shown[0] : null;
  const singleSummary = single ? summaryOf(single) : null;
  const singleBlocked = !!single && single.reviewReasons.length > 0;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-[min(94vw,820px)] -translate-x-1/2 flex-col gap-2">
      {open && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="pointer-events-auto max-h-[60vh] overflow-auto rounded-3xl border border-white/15 bg-primary-ink/95 p-3 text-white shadow-2xl backdrop-blur-md"
        >
          {summary && (
            <p className="px-2 pb-2 pt-1 text-sm text-white/70">{summary}</p>
          )}

          {shown.length === 0 ? (
            <p className="px-2 py-2 text-sm text-white/70">{t("noProposals")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {shown.map((proposal) => {
                const info = summaryOf(proposal);
                const blocked = proposal.reviewReasons.length > 0;
                const done = isSaved(proposal);
                return (
                  <div
                    key={proposalSignature(proposal)}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3 transition-opacity",
                      done && "opacity-60"
                    )}
                  >
                    <div className="min-w-[200px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">
                          {proposal.label}
                          {info.invoices && ` · ${info.invoices}`}
                        </span>
                        {blocked ? (
                          proposal.reviewReasons.map((reason) => (
                            <span
                              key={reason}
                              className="rounded-full bg-brand-orange/25 px-2 py-0.5 text-xs font-semibold text-brand-orange-soft"
                            >
                              {t(`reasons.${reason.split(":")[0]}`)}
                            </span>
                          ))
                        ) : !showsNext(proposal) ? (
                          <span className="rounded-full bg-emerald-300/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                            {Math.round(proposal.confidence * 100)}%
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-xs text-white/70">
                        {[
                          info.amount,
                          info.day &&
                            `${
                              proposal.scenario === "DEPOSIT_PROMISE"
                                ? t("commitmentDate")
                                : t("paymentDate")
                            }: ${info.day}`,
                          showsNext(proposal) && nextText(proposal),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    {done ? (
                      <span className="flex items-center gap-1 px-2 text-sm font-medium text-emerald-200">
                        <Check className="h-4 w-4" />
                        {t("saved")}
                      </span>
                    ) : (
                      <>
                        {proposal.executiveCommentOptions && (
                          <CommentSelect
                            proposal={proposal}
                            value={choiceOf(proposal)}
                            label={commentLabel}
                            onChange={(comment) => pickComment(proposal, comment)}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => dismiss(proposal, accessToken, clientId)}
                          className="px-1 text-xs text-white/70 hover:text-white"
                        >
                          {t("dismiss")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApply(proposal, "edit")}
                          className={ghostButton}
                        >
                          {t("edit")}
                        </button>
                        <button
                          type="button"
                          disabled={blocked}
                          onClick={() => handleApply(proposal, "accept")}
                          className={acceptButton}
                        >
                          {acceptLabel()}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {turns.length > 0 && (
            <div className="mt-3 border-t border-white/10 px-2 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {t("transcript")}
              </span>
              <div className="mt-2 flex max-h-40 flex-col gap-1 overflow-auto text-sm">
                {turns.map((turn, index) => (
                  <p key={index} className="text-white/85">
                    <span
                      className={cn(
                        "font-medium",
                        turn.speaker === "DEBTOR" ? "text-primary-soft" : "text-white"
                      )}
                    >
                      {turn.speaker === "EXECUTIVE" ? t("executive") : t("debtor")}:
                    </span>{" "}
                    {turn.text}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex min-h-14 items-center gap-3 rounded-full border border-white/15 bg-primary-ink p-[10px] text-white shadow-xl"
      >
        <Avatar
          animated={live && status === "live"}
          error={error}
          icon={shown.length > 0}
        />

        {single && singleSummary ? (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-medium">
                {single.label}
                {singleSummary.invoices && ` · ${singleSummary.invoices}`}
                {singleSummary.amount && ` · ${singleSummary.amount}`}
              </div>
              <div className="truncate text-xs text-white/70">
                {singleBlocked
                  ? single.reviewReasons
                      .map((reason) => t(`reasons.${reason.split(":")[0]}`))
                      .join(" · ")
                  : singleSummary.day
                    ? `${
                        single.scenario === "DEPOSIT_PROMISE"
                          ? t("commitmentDate")
                          : t("paymentDate")
                      }: ${singleSummary.day}`
                    : showsNext(single)
                      ? nextText(single)
                      : ""}
              </div>
            </div>
            {!singleBlocked && !showsNext(single) && (
              <span className="hidden shrink-0 rounded-full bg-emerald-300/15 px-2 py-0.5 text-xs font-semibold text-emerald-200 sm:inline">
                {Math.round(single.confidence * 100)}%
              </span>
            )}
            {single.executiveCommentOptions && (
              <CommentSelect
                proposal={single}
                value={choiceOf(single)}
                label={commentLabel}
                onChange={(comment) => pickComment(single, comment)}
              />
            )}
            <button
              type="button"
              onClick={() => handleApply(single, "edit")}
              className={ghostButton}
            >
              {t("edit")}
            </button>
            <button
              type="button"
              disabled={singleBlocked}
              onClick={() => handleApply(single, "accept")}
              className={acceptButton}
            >
              {t("accept")}
            </button>
          </>
        ) : shown.length > 1 ? (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand-orange" />
                {saved.length > 0
                  ? t("savedProgress", {
                      saved: saved.length,
                      total: shown.length,
                    })
                  : t("suggestedCount", { count: shown.length })}
              </div>
              <div className="truncate text-xs text-white/70">
                {pending.map((proposal) => proposal.label).join(" · ")}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              className={cn(acceptButton, "flex items-center gap-1")}
            >
              {t("review")}
              {open ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
          </>
        ) : (
          <div className="min-w-0 flex-1 truncate text-sm">
            {!live && registered > 0 ? (
              <span className="flex items-center gap-2 font-medium">
                <Check className="h-4 w-4 text-emerald-200" />
                {t("registered", { count: registered })}
              </span>
            ) : lastTurn && lastText ? (
              <>
                <span
                  className={cn(
                    "mr-2 font-medium",
                    lastTurn.speaker === "DEBTOR" ? "text-primary-soft" : "text-white/70"
                  )}
                >
                  {lastTurn.speaker === "EXECUTIVE" ? t("executive") : t("debtor")}
                </span>
                <span className={lastTurn.speaker === "DEBTOR" ? "text-white" : "text-white/70"}>
                  {lastText}
                </span>
              </>
            ) : (
              <span className="text-white/70">{placeholder}</span>
            )}
          </div>
        )}

        {live && (
          <span className="shrink-0 px-1 text-xs tabular-nums text-white/70">
            {formatClock(elapsed)}
          </span>
        )}

        {shown.length < 2 && (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t("collapse") : t("expand")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            {open ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </button>
        )}

        {!live && (
          <button
            type="button"
            onClick={() => setHidden(true)}
            aria-label={t("close")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
