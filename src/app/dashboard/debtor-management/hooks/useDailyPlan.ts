import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { getDailyPlan } from "../services/daily-plan";
import { DailyPlanParams } from "../types/daily-plan";

export const DAILY_PLAN_QUERY_KEY = "daily-plan";

export const useDailyPlan = (params: DailyPlanParams) => {
  const { session, profile } = useProfileContext();
  const accessToken = session?.token || "";
  const clientId = profile?.client?.id || "";

  return useQuery({
    queryKey: [DAILY_PLAN_QUERY_KEY, clientId, params],
    queryFn: () => getDailyPlan(accessToken, clientId, params),
    enabled: !!accessToken && !!clientId,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
