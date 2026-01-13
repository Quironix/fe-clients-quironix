import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ActivityIcon,
  AlertCircleIcon,
  BarChart3Icon,
  CircleDotIcon,
  GridIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  LayoutListIcon,
  MaximizeIcon,
  MinimizeIcon,
  RefreshCwIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
  ViewIcon,
} from "lucide-react";
import { LayoutMode, ViewMode } from "../types/preferences";

interface KPICustomizationToolbarProps {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  gridColumns: number;
  showCategories: boolean;
  showCharts: boolean;
  showCriticalOnly: boolean;
  onViewModeChange: (mode: ViewMode) => void;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onGridColumnsChange: (columns: number) => void;
  onToggleShowCategories: () => void;
  onToggleShowCharts: () => void;
  onToggleShowCriticalOnly: () => void;
  onReset: () => void;
}

export const KPICustomizationToolbar = ({
  viewMode,
  layoutMode,
  gridColumns,
  showCategories,
  showCharts,
  showCriticalOnly,
  onViewModeChange,
  onLayoutModeChange,
  onGridColumnsChange,
  onToggleShowCategories,
  onToggleShowCharts,
  onToggleShowCriticalOnly,
  onReset,
}: KPICustomizationToolbarProps) => {
  const viewModeIcons: Record<ViewMode, React.ReactNode> = {
    card: <GridIcon className="h-4 w-4" />,
    compact: <MinimizeIcon className="h-4 w-4" />,
    gauge: <BarChart3Icon className="h-4 w-4" />,
    detailed: <MaximizeIcon className="h-4 w-4" />,
    sparkline: <ActivityIcon className="h-4 w-4" />,
    ring: <CircleDotIcon className="h-4 w-4" />,
  };

  const layoutModeIcons: Record<LayoutMode, React.ReactNode> = {
    grid: <LayoutGridIcon className="h-4 w-4" />,
    list: <LayoutListIcon className="h-4 w-4" />,
    kanban: <ViewIcon className="h-4 w-4" />,
    dashboard: <LayoutDashboardIcon className="h-4 w-4" />,
  };

  return (
    <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-white shadow-sm">
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings2Icon className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm text-gray-900">
              Personalizar Vista
            </h3>
          </div>

          <Separator orientation="vertical" className="h-8 hidden md:block" />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">
                Vista:
              </label>
              <TooltipProvider>
                <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                  {(Object.keys(viewModeIcons) as ViewMode[]).map((mode) => (
                    <Tooltip key={mode}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === mode ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            viewMode === mode
                              ? "bg-blue-500 text-white hover:bg-blue-600"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => onViewModeChange(mode)}
                        >
                          {viewModeIcons[mode]}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{mode}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-8 hidden lg:block" />

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600">
                Layout:
              </label>
              <TooltipProvider>
                <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
                  {(Object.keys(layoutModeIcons) as LayoutMode[]).map((mode) => (
                    <Tooltip key={mode}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={layoutMode === mode ? "default" : "ghost"}
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            layoutMode === mode
                              ? "bg-purple-500 text-white hover:bg-purple-600"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => onLayoutModeChange(mode)}
                        >
                          {layoutModeIcons[mode]}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="capitalize">{mode}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {layoutMode === "grid" && (
              <>
                <Separator orientation="vertical" className="h-8 hidden xl:block" />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">
                    Columnas:
                  </label>
                  <Select
                    value={gridColumns.toString()}
                    onValueChange={(value) => onGridColumnsChange(Number(value))}
                  >
                    <SelectTrigger className="w-16 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-8 hidden xl:block" />

          <div className="flex flex-wrap items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showCategories}
                      onCheckedChange={onToggleShowCategories}
                      className="data-[state=checked]:bg-blue-500"
                    />
                    <label className="text-xs font-medium text-gray-600">
                      Categorías
                    </label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Mostrar resumen por categorías</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showCharts}
                      onCheckedChange={onToggleShowCharts}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <label className="text-xs font-medium text-gray-600">
                      Gráficos
                    </label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Mostrar gráficos de análisis</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showCriticalOnly}
                      onCheckedChange={onToggleShowCriticalOnly}
                      className="data-[state=checked]:bg-red-500"
                    />
                    <label className="text-xs font-medium text-gray-600">
                      Solo Críticos
                    </label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Mostrar solo KPIs críticos y con atención
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className="h-8 px-3"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restablecer preferencias</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </Card>
  );
};
