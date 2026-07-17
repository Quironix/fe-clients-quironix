import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  Notification,
  NotificationType,
} from "@/services/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const NOTIFICATIONS_QUERY_KEY = "notifications";

export function useUnreadNotifications(accessToken: string, clientId: string) {
  return useQuery<Notification[]>({
    queryKey: [NOTIFICATIONS_QUERY_KEY, clientId, "unread"],
    queryFn: () => getNotifications(accessToken, clientId, true, 50),
    enabled: !!accessToken && !!clientId,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationAsRead(accessToken: string, clientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, id }: { type: NotificationType; id: string }) =>
      markNotificationAsRead(accessToken, clientId, type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, clientId],
      });
    },
  });
}

export function useMarkAllNotificationsAsRead(
  accessToken: string,
  clientId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(accessToken, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_QUERY_KEY, clientId],
      });
    },
  });
}
