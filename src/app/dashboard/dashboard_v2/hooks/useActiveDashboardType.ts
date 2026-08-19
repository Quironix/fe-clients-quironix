import { useEffect, useState } from "react";
import { DASHBOARD_TYPE_ORDER, DashboardType } from "../types";

const STORAGE_KEY = "quironix.dashboard.activeView";

export const useActiveDashboardType = (
  availableTypes: DashboardType[]
): [DashboardType | null, (type: DashboardType) => void] => {
  const [activeType, setActiveTypeState] = useState<DashboardType | null>(
    null
  );

  useEffect(() => {
    if (availableTypes.length === 0) {
      setActiveTypeState(null);
      return;
    }

    if (availableTypes.length === 1) {
      setActiveTypeState(availableTypes[0]);
      return;
    }

    const stored =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as DashboardType | null)
        : null;

    if (stored && availableTypes.includes(stored)) {
      setActiveTypeState(stored);
      return;
    }

    const fallback =
      DASHBOARD_TYPE_ORDER.find((type) => availableTypes.includes(type)) ||
      availableTypes[0];
    setActiveTypeState(fallback);
  }, [availableTypes.join(",")]);

  const setActiveType = (type: DashboardType) => {
    setActiveTypeState(type);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, type);
    }
  };

  return [activeType, setActiveType];
};
