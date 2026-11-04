import {
  DailyPlanParams,
  DailyPlanResponse,
  TaskEngineMode,
} from "../types/daily-plan";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const tasksUrl = (clientId: string) =>
  `${API_URL}/v2/clients/${clientId}/managements/tasks`;

async function getJson<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function getTaskEngineMode(
  accessToken: string,
  clientId: string
): Promise<TaskEngineMode> {
  const { mode } = await getJson<{ mode: TaskEngineMode }>(
    `${tasksUrl(clientId)}/engine-mode`,
    accessToken
  );
  return mode;
}

export async function getDailyPlan(
  accessToken: string,
  clientId: string,
  params: DailyPlanParams
): Promise<DailyPlanResponse> {
  const query = new URLSearchParams({
    tab: params.tab,
    page: String(params.page),
    limit: String(params.limit),
  });
  return getJson<DailyPlanResponse>(
    `${tasksUrl(clientId)}/daily-plan?${query}`,
    accessToken
  );
}
