import { useQuery } from "@tanstack/react-query";
import {
  getAgingBuckets,
  getCashTrendWeekly,
  getCommitmentsSummary,
  getContactEffectiveness,
  getDebtorConcentration,
  getDsoProjection,
  getInvoicePhaseDistribution,
  getTaskProgress,
  getTeamOverview,
  getTodayPriorities,
  getUpcomingCommitments,
} from "../services";

interface BaseParams {
  accessToken: string;
  clientId: string;
  enabled?: boolean;
}

export const useAgingBuckets = ({
  accessToken,
  clientId,
  enabled = true,
}: BaseParams) =>
  useQuery({
    queryKey: ["dashboard_v2", "aging-buckets", clientId],
    queryFn: () => getAgingBuckets(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useDebtorConcentration = ({
  accessToken,
  clientId,
  enabled = true,
}: BaseParams) =>
  useQuery({
    queryKey: ["dashboard_v2", "debtor-concentration", clientId],
    queryFn: () => getDebtorConcentration(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useTeamOverview = ({
  accessToken,
  clientId,
  enabled = true,
}: BaseParams) =>
  useQuery({
    queryKey: ["dashboard_v2", "team-overview", clientId],
    queryFn: () => getTeamOverview(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useTodayPriorities = ({
  accessToken,
  clientId,
  executiveId,
  enabled = true,
}: BaseParams & { executiveId: string }) =>
  useQuery({
    queryKey: ["dashboard_v2", "today-priorities", clientId, executiveId],
    queryFn: () => getTodayPriorities(accessToken, clientId, executiveId),
    enabled: enabled && !!accessToken && !!clientId && !!executiveId,
    staleTime: 5 * 60 * 1000,
  });

export const useTaskProgress = ({
  accessToken,
  clientId,
  executiveId,
  teamWide,
  enabled = true,
}: BaseParams & { executiveId?: string; teamWide?: boolean }) =>
  useQuery({
    queryKey: ["dashboard_v2", "task-progress", clientId, executiveId, teamWide],
    queryFn: () => getTaskProgress(accessToken, clientId, { executiveId, teamWide }),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useCommitmentsSummary = ({
  accessToken,
  clientId,
  executiveId,
  enabled = true,
}: BaseParams & { executiveId?: string }) =>
  useQuery({
    queryKey: ["dashboard_v2", "commitments-summary", clientId, executiveId],
    queryFn: () => getCommitmentsSummary(accessToken, clientId, executiveId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useContactEffectiveness = ({
  accessToken,
  clientId,
  executiveId,
  period,
  enabled = true,
}: BaseParams & { executiveId?: string; period?: string }) =>
  useQuery({
    queryKey: ["dashboard_v2", "contact-effectiveness", clientId, executiveId, period],
    queryFn: () => getContactEffectiveness(accessToken, clientId, { executiveId, period }),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useInvoicePhaseDistribution = ({
  accessToken,
  clientId,
  executiveId,
  phase = 1,
  enabled = true,
}: BaseParams & { executiveId?: string; phase?: number }) =>
  useQuery({
    queryKey: ["dashboard_v2", "invoice-phase-distribution", clientId, executiveId, phase],
    queryFn: () => getInvoicePhaseDistribution(accessToken, clientId, { executiveId, phase }),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useDsoProjection = ({
  accessToken,
  clientId,
  enabled = true,
}: BaseParams) =>
  useQuery({
    queryKey: ["dashboard_v2", "dso-projection", clientId],
    queryFn: () => getDsoProjection(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useUpcomingCommitments = ({
  accessToken,
  clientId,
  executiveId,
  days = 7,
  enabled = true,
}: BaseParams & { executiveId?: string; days?: number }) =>
  useQuery({
    queryKey: ["dashboard_v2", "upcoming-commitments", clientId, executiveId, days],
    queryFn: () => getUpcomingCommitments(accessToken, clientId, { executiveId, days }),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useCashTrendWeekly = ({
  accessToken,
  clientId,
  executiveId,
  weeks = 8,
  enabled = true,
}: BaseParams & { executiveId?: string; weeks?: number }) =>
  useQuery({
    queryKey: ["dashboard_v2", "cash-trend-weekly", clientId, executiveId, weeks],
    queryFn: () => getCashTrendWeekly(accessToken, clientId, { executiveId, weeks }),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });
