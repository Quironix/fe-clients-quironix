import { useQuery } from "@tanstack/react-query";
import { getAll } from "../services";
import { KPIResponse } from "../services/types";

interface UseKPIDataParams {
  accessToken: string;
  clientId: string;
  filters?: { from?: string; to?: string };
  period?: string | null;
  enabled?: boolean;
}

export const useKPIData = ({
  accessToken,
  clientId,
  filters,
  period,
  enabled = true,
}: UseKPIDataParams) => {
  return useQuery<KPIResponse, Error>({
    queryKey: ["kpis", clientId, accessToken, filters, period],
    queryFn: () => getAll(accessToken, clientId, filters, period),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
};
