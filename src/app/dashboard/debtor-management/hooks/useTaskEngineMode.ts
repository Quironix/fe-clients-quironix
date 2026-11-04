import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { getTaskEngineMode } from "../services/daily-plan";

export const useTaskEngineMode = () => {
  const { session, profile } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";

  return useQuery({
    queryKey: ["task-engine-mode", clientId],
    queryFn: () => getTaskEngineMode(accessToken, clientId),
    enabled: !!accessToken && !!clientId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
