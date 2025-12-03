export type ViewMode = "card" | "gauge" | "sparkline" | "ring" | "compact";
export type LayoutMode = "grid" | "list" | "kanban" | "dashboard";

export interface KPIPreferences {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  kpiOrder: string[];
  kpiViews: Record<string, ViewMode>;
  gridColumns: number;
  showCategories: boolean;
  showCharts: boolean;
  showCriticalOnly: boolean;
  filterCategory: string;
}

export const DEFAULT_PREFERENCES: KPIPreferences = {
  viewMode: "card",
  layoutMode: "grid",
  kpiOrder: [],
  kpiViews: {},
  gridColumns: 3,
  showCategories: true,
  showCharts: true,
  showCriticalOnly: false,
  filterCategory: "all",
};
