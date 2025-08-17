import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useProfileContext } from "@/context/ProfileContext";
import { usePaymentProjectionStore } from "../store";

export const usePaymentProjection = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const {
    data,
    isLoading,
    searchTerm,
    setSearchTerm,
    refreshData,
    createData,
  } = usePaymentProjectionStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      refreshData(session?.token, profile?.client?.id);
    }
  }, [session?.token, profile?.client?.id]);

  return {
    data,
    isLoading,
    searchTerm,
    setSearchTerm,
    refreshData: () => refreshData(session?.token, profile?.client?.id),
    createData: (data: any) => createData(session?.token, data, profile?.client?.id),
  };
};
