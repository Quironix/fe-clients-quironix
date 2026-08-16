import { useQuery } from "@tanstack/react-query";
import {
  getAgingBuckets,
  getDebtorConcentration,
  getTeamOverview,
  getTodayPriorities,
} from "../services";

interface BaseParams {
  accessToken: string;
  clientId: string;
  enabled?: boolean;
}

export const useAgingBuckets = ({ accessToken, clientId, enabled = true }: BaseParams) =>
  useQuery({
    queryKey: ["dashboard_v2", "aging-buckets", clientId],
    queryFn: () => getAgingBuckets(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useDebtorConcentration = ({ accessToken, clientId, enabled = true }: BaseParams) =>
  useQuery({
    queryKey: ["dashboard_v2", "debtor-concentration", clientId],
    queryFn: () => getDebtorConcentration(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
  });

export const useTeamOverview = ({ accessToken, clientId, enabled = true }: BaseParams) =>
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
