import { TaskScope, TechnicalFileOutcome } from "../types/task-scope";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getTaskScope(
  accessToken: string,
  clientId: string,
  debtorId: string
): Promise<TaskScope | null> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/managements/tasks/invoice-items?debtor_id=${debtorId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const body = await response.text();
  return body ? (JSON.parse(body) as TaskScope) : null;
}

export async function registerTechnicalFileRequest(
  accessToken: string,
  clientId: string,
  taskId: string,
  outcome: TechnicalFileOutcome,
  requestedFields: string[]
): Promise<void> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/managements/tasks/${taskId}/technical-file-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ outcome, requestedFields }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || response.statusText);
  }
}
