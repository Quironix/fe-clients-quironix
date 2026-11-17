const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuditFieldChange {
  before?: unknown;
  after?: unknown;
  added?: unknown[];
  removed?: unknown[];
  value?: unknown;
}

export interface AuditLog {
  id: string;
  created_at: string;
  actor_type: "user" | "client_api_key" | "system";
  actor_id: string;
  actor_name: string;
  module: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string;
  debtor_id: string | null;
  action: string;
  changes: Record<string, AuditFieldChange>;
}

export interface AuditLogPage {
  items: AuditLog[];
  next_cursor: string | null;
}

export interface ActionsHistoryFilters {
  actor_id?: string;
  module?: string;
  action?: string;
  from?: string;
  to?: string;
  q?: string;
}

export const getActionsHistory = async (
  accessToken: string,
  clientId: string,
  filters: ActionsHistoryFilters,
  cursor?: string | null,
  limit = 50,
): Promise<AuditLogPage> => {
  const params = new URLSearchParams({ limit: String(limit) });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/actions-history?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || "Error al cargar el historial de acciones",
    );
  }

  return response.json();
};
