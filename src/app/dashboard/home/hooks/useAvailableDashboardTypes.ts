import { useMemo } from "react";
import { DashboardType } from "../types";

interface RoleLike {
  dashboard_type?: DashboardType | null;
}

export const useAvailableDashboardTypes = (
  profile: { roles?: RoleLike[] } | null
): DashboardType[] => {
  return useMemo(() => {
    const roles = profile?.roles || [];
    const types = new Set<DashboardType>();
    roles.forEach((role) => {
      if (
        role.dashboard_type === "MANAGER" ||
        role.dashboard_type === "COLLECTION_MANAGER" ||
        role.dashboard_type === "EXECUTIVE"
      ) {
        types.add(role.dashboard_type);
      }
    });
    return Array.from(types);
  }, [profile]);
};
