import { useProfileContext } from "@/context/ProfileContext";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  LitigationManagement,
  registerLitigationManagement,
} from "../services/litigation-tracks";

export const useLitigationManagement = () => {
  const { session, profile } = useProfileContext();
  const t = useTranslations("litigation.management");

  return async (management: LitigationManagement) => {
    try {
      const { email, recipient } = await registerLitigationManagement(
        {
          accessToken: session?.token,
          clientId: profile?.client_id,
          profile: profile as any,
        },
        management
      );

      if (email === "SENT") toast.success(t("emailSent", { email: recipient }));
      if (email === "FAILED") {
        toast.warning(t("emailFailed", { email: recipient }));
      }
      if (email === "NO_EMAIL") toast.warning(t("contactWithoutEmail"));
    } catch {
      toast.warning(t("trackError"));
    }
  };
};
