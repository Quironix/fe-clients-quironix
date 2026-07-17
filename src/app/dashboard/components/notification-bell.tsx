"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfileContext } from "@/context/ProfileContext";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useUnreadNotifications,
} from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Notification } from "@/services/notifications";
import { IconBell, IconMail, IconPhoneIncoming } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const formatDuration = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

export const NotificationBell = () => {
  const { profile, session } = useProfileContext();
  const router = useRouter();
  const t = useTranslations("dashboard.notifications");

  const accessToken = session?.token as string;
  const clientId = profile?.client?.id as string;

  const { data: notifications = [] } = useUnreadNotifications(
    accessToken,
    clientId,
  );
  const markAsRead = useMarkNotificationAsRead(accessToken, clientId);
  const markAllAsRead = useMarkAllNotificationsAsRead(accessToken, clientId);

  const handleClick = (notification: Notification) => {
    markAsRead.mutate({ type: notification.type, id: notification.id });

    const query = notification.track_id
      ? notification.type === "EMAIL_REPLY"
        ? `?threadId=${notification.track_id}`
        : `?trackId=${notification.track_id}`
      : "";

    router.push(
      `/dashboard/debtor-management/${notification.debtor_id}/managements-list${query}`,
    );
  };

  if (!accessToken || !clientId) return null;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <IconBell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {notifications.length > 99 ? "99+" : notifications.length}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <span className="text-sm font-medium">{t("title")}</span>
          {notifications.length > 0 && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => markAllAsRead.mutate()}
            >
              {t("mark_all_as_read")}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            {t("empty")}
          </div>
        )}
        {notifications.map((notification) => {
          const isEmail = notification.type === "EMAIL_REPLY";
          const relativeTime = formatDistanceToNow(
            new Date(notification.created_at),
            { addSuffix: true, locale: es },
          );

          return (
            <DropdownMenuItem
              key={`${notification.type}-${notification.id}`}
              className={cn(
                "flex flex-col items-start gap-1 whitespace-normal border-l-2 py-2 pl-2.5",
                isEmail
                  ? "border-l-blue-500"
                  : "border-l-emerald-500",
              )}
              onClick={() => handleClick(notification)}
            >
              <div className="flex w-full items-center gap-1.5">
                {isEmail ? (
                  <IconMail className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                ) : (
                  <IconPhoneIncoming className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                )}
                <span className="flex-1 truncate text-sm font-medium">
                  {notification.debtor_name}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {relativeTime}
                </span>
              </div>
              {isEmail ? (
                <span className="line-clamp-1 block pl-5 text-xs text-muted-foreground">
                  {notification.subject || notification.body_preview}
                </span>
              ) : (
                <span className="pl-5 text-xs text-muted-foreground">
                  {notification.from_number}
                  {notification.duration !== undefined &&
                    notification.duration !== null &&
                    ` · ${formatDuration(notification.duration)}`}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
