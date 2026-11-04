import { useQuery } from "@tanstack/react-query";
import { getTaskScope } from "../services/task-scope";

export const TASK_SCOPE_QUERY_KEY = "task-scope";

interface UseTaskScopeParams {
  accessToken?: string;
  clientId?: string;
  debtorId?: string;
}

export const useTaskScope = ({
  accessToken,
  clientId,
  debtorId,
}: UseTaskScopeParams) =>
  useQuery({
    queryKey: [TASK_SCOPE_QUERY_KEY, clientId, debtorId],
    queryFn: () =>
      getTaskScope(accessToken as string, clientId as string, debtorId as string),
    enabled: !!accessToken && !!clientId && !!debtorId,
    refetchOnWindowFocus: false,
    retry: 1,
  });
