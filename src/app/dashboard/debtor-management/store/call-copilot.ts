import { create } from "zustand";
import { recordCallOutcome } from "../services/call-copilot";
import type { CallProposal } from "../types/call-copilot";

type ApplyMode = "accept" | "save" | "edit";

interface CallCopilotStore {
  sessionId: string | null;
  phone: string;
  summary: string | null;
  proposals: CallProposal[];
  dismissed: string[];
  saved: string[];
  registered: number;
  pendingApply: { proposal: CallProposal; mode: ApplyMode } | null;
  lastApplied: { proposal: CallProposal; mode: ApplyMode } | null;
  startSession: (sessionId: string, phone: string) => void;
  setProposals: (summary: string | null, proposals: CallProposal[]) => void;
  apply: (proposal: CallProposal, mode: ApplyMode) => void;
  consumePending: () => void;
  dismiss: (
    proposal: CallProposal,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  reportTrackCreated: (
    trackId: string | undefined,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
}

export const proposalSignature = (proposal: CallProposal) =>
  `${proposal.id}|${JSON.stringify(proposal.caseData)}|${proposal.invoices
    .map((invoice) => invoice.id)
    .join(",")}`;

export const useCallCopilotStore = create<CallCopilotStore>((set, get) => ({
  sessionId: null,
  phone: "",
  summary: null,
  proposals: [],
  dismissed: [],
  saved: [],
  registered: 0,
  pendingApply: null,
  lastApplied: null,

  startSession: (sessionId, phone) =>
    set({
      sessionId,
      phone,
      summary: null,
      proposals: [],
      dismissed: [],
      saved: [],
      registered: 0,
      pendingApply: null,
      lastApplied: null,
    }),

  setProposals: (summary, proposals) => set({ summary, proposals }),

  apply: (proposal, mode) => {
    const applied = { proposal, mode };
    set({ pendingApply: applied, lastApplied: applied });
  },

  consumePending: () => set({ pendingApply: null }),

  dismiss: async (proposal, accessToken, clientId) => {
    const { sessionId, dismissed } = get();
    set({ dismissed: [...dismissed, proposalSignature(proposal)] });
    if (!sessionId) return;
    try {
      await recordCallOutcome(accessToken, clientId, sessionId, {
        outcome: "DISCARDED",
        proposalId: proposal.id,
      });
    } catch {}
  },

  reportTrackCreated: async (trackId, accessToken, clientId) => {
    const { sessionId, proposals, lastApplied } = get();
    if (!sessionId || proposals.length === 0) return;
    const outcome = lastApplied
      ? lastApplied.mode === "edit"
        ? "EDITED"
        : "ACCEPTED"
      : "MANUAL";
    set((state) => {
      if (!lastApplied) return { lastApplied: null };
      const signature = proposalSignature(lastApplied.proposal);
      if (lastApplied.mode === "save") {
        return {
          lastApplied: null,
          saved: [...state.saved, signature],
          registered: state.registered + 1,
        };
      }
      return {
        lastApplied: null,
        dismissed: [...state.dismissed, ...state.saved, signature],
        saved: [],
        registered: state.registered + 1,
      };
    });
    try {
      await recordCallOutcome(accessToken, clientId, sessionId, {
        outcome,
        proposalId: lastApplied?.proposal.id,
        trackId,
      });
    } catch {}
  },
}));
