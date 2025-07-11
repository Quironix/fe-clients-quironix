"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ColumnDef, OnChangeFn, VisibilityState } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import { useState } from "react";
import { FilterSection } from "./filter-section";
import { ColumnSection } from "./column-section";
import { FilterConfig } from "./types/sheet-types";

interface ColumnSettingsSheetProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  trigger?: React.ReactNode;
  filterConfig?: FilterConfig;
}

export function ColumnSettingsSheet<TData, TValue>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  trigger,
  filterConfig,
}: ColumnSettingsSheetProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterApply = (values: Record<string, any>) => {
    if (filterConfig?.onApply) {
      filterConfig.onApply(values);
    }
    setIsOpen(false);
  };

  const handleFilterReset = () => {
    if (filterConfig?.onReset) {
      filterConfig.onReset();
    }
  };

  // Crear configuración de filtros con callbacks que cierran el sheet
  const enhancedFilterConfig = filterConfig ? {
    ...filterConfig,
    onApply: handleFilterApply,
    onReset: handleFilterReset,
  } : undefined;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Columnas
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right">
        {/* Header */}
        <SheetHeader className="border-b bg-background">
          <SheetTitle>
            {filterConfig ? "Filtros y Columnas" : "Configuración de Columnas"}
          </SheetTitle>
        </SheetHeader>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Sección Filtros */}
          {enhancedFilterConfig && (
            <FilterSection config={enhancedFilterConfig} />
          )}

          {/* Separador */}
          {enhancedFilterConfig && <Separator />}

          {/* Sección Columnas */}
          <ColumnSection
            columns={columns}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={onColumnVisibilityChange}
            columnOrder={columnOrder}
            onColumnOrderChange={onColumnOrderChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
