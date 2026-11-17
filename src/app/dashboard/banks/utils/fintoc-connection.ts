import { ProfileType } from "@/context/ProfileContext";
import { formatDistanceToNow } from "date-fns";
import { enUS, es } from "date-fns/locale";

const BANKS_SCOPE = "client.onboarding.banks";

export const canManageBanks = (profile?: ProfileType | null): boolean =>
  profile?.type === "ADMIN" ||
  (profile?.roles ?? [])
    .flatMap((role) => role.scopes ?? [])
    .some((scope) => {
      const base = scope.split(":")[0];
      return base === BANKS_SCOPE || base.startsWith(`${BANKS_SCOPE}.`);
    });

export const timeAgo = (date: string | null | undefined, locale: string) =>
  date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: locale === "en" ? enUS : es,
      })
    : "";
