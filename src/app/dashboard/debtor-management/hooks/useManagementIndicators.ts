import { getManagementIndicators } from "../services";
import { ManagementIndicators } from "../services/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

interface UseManagementIndicatorsParams {
  accessToken: string;
  clientId: string;
  enabled?: boolean;
}

interface UseManagementIndicatorsReturn {
  data: ManagementIndicators | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  invalidateIndicators: () => void;
}

// Clave base para las queries de management indicators
const MANAGEMENT_INDICATORS_QUERY_KEY = "management-indicators";

export const useManagementIndicators = ({
  accessToken,
  clientId,
  enabled = true,
}: UseManagementIndicatorsParams): UseManagementIndicatorsReturn => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [MANAGEMENT_INDICATORS_QUERY_KEY, clientId],
    queryFn: () => getManagementIndicators(accessToken, clientId),
    enabled: enabled && !!accessToken && !!clientId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true, // Refrescar al volver a la ventana para mantener datos actualizados
    retry: 2,
  });

  const invalidateIndicators = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [MANAGEMENT_INDICATORS_QUERY_KEY, clientId],
    });
  }, [queryClient, clientId]);

  return {
    data,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    invalidateIndicators,
  };
};

// Hook para invalidar cache de management indicators
export const useInvalidateManagementIndicators = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (clientId?: string) => {
      if (clientId) {
        queryClient.invalidateQueries({
          queryKey: [MANAGEMENT_INDICATORS_QUERY_KEY, clientId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: [MANAGEMENT_INDICATORS_QUERY_KEY],
        });
      }
    },
    [queryClient]
  );
};
