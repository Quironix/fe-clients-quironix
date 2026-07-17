const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type NotificationType = "EMAIL_REPLY" | "INCOMING_CALL";

export interface Notification {
  id: string;
  type: NotificationType;
  debtor_id: string;
  debtor_name: string;
  track_id: string | null;
  created_at: string;
  read_at: string | null;
  subject?: string | null;
  from_address?: string | null;
  body_preview?: string | null;
  from_number?: string | null;
  duration?: number | null;
}

export async function getNotifications(
  accessToken: string,
  clientId: string,
  unread: boolean = true,
  limit: number = 50,
): Promise<Notification[]> {
  const params = new URLSearchParams({
    unread: String(unread),
    limit: String(limit),
  });

  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/notifications?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (Array.isArray(error?.message) ? error.message[0] : error?.message) ||
        `Error ${response.status}`,
    );
  }

  return response.json();
}

export async function markNotificationAsRead(
  accessToken: string,
  clientId: string,
  type: NotificationType,
  id: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/notifications/${type}/${id}/read`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (Array.isArray(error?.message) ? error.message[0] : error?.message) ||
        `Error ${response.status}`,
    );
  }
}

export async function markAllNotificationsAsRead(
  accessToken: string,
  clientId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/notifications/read-all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (Array.isArray(error?.message) ? error.message[0] : error?.message) ||
        `Error ${response.status}`,
    );
  }
}
