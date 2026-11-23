import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import {
  getContactRoles,
  getPaymentProfile,
  getSalespeople,
} from "../services/technical-file";

export const CONTACT_ROLES_QUERY_KEY = "contact-roles";
export const PAYMENT_PROFILE_QUERY_KEY = "debtor-payment-profile";
export const SALESPEOPLE_QUERY_KEY = "salespeople";

const useSessionIds = () => {
  const { session, profile } = useProfileContext();
  return {
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
  };
};

export const useContactRoles = () => {
  const { accessToken, clientId } = useSessionIds();
  return useQuery({
    queryKey: [CONTACT_ROLES_QUERY_KEY, clientId],
    queryFn: () => getContactRoles(accessToken, clientId),
    enabled: !!accessToken && !!clientId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const usePaymentProfile = (debtorId?: string) => {
  const { accessToken, clientId } = useSessionIds();
  return useQuery({
    queryKey: [PAYMENT_PROFILE_QUERY_KEY, clientId, debtorId],
    queryFn: () => getPaymentProfile(accessToken, clientId, debtorId as string),
    enabled: !!accessToken && !!clientId && !!debtorId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSalespeople = () => {
  const { accessToken, clientId } = useSessionIds();
  return useQuery({
    queryKey: [SALESPEOPLE_QUERY_KEY, clientId],
    queryFn: () => getSalespeople(accessToken, clientId),
    enabled: !!accessToken && !!clientId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
