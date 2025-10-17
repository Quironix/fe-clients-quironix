import { getCollectorQuadrants } from "../services";
import {
  CollectorQuadrantsParams,
  CollectorQuadrantsResponse,
} from "../services/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseCollectorQuadrantsParams {
  accessToken: string;
  clientId: string;
  params?: CollectorQuadrantsParams;
  enabled?: boolean;
}

interface UseCollectorQuadrantsReturn {
  data: CollectorQuadrantsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  invalidateQuadrants: () => void;
}

// Clave base para las queries de collector quadrants
const COLLECTOR_QUADRANTS_QUERY_KEY = "collector-quadrants";

export const useCollectorQuadrants = ({
  accessToken,
  clientId,
  params,
  enabled = true,
}: UseCollectorQuadrantsParams): UseCollectorQuadrantsReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [COLLECTOR_QUADRANTS_QUERY_KEY, clientId, params],
    queryFn: () => getCollectorQuadrants(accessToken, clientId, params),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const invalidateQuadrants = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [COLLECTOR_QUADRANTS_QUERY_KEY, clientId],
    });
  }, [queryClient, clientId]);

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    invalidateQuadrants,
  };
};

// Hook para invalidar cache de collector quadrants
export const useInvalidateCollectorQuadrants = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (clientId?: string) => {
      if (clientId) {
        queryClient.invalidateQueries({
          queryKey: [COLLECTOR_QUADRANTS_QUERY_KEY, clientId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [COLLECTOR_QUADRANTS_QUERY_KEY],
        });
      }
    },
    [queryClient]
  );
};
