"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ColumnDef, OnChangeFn, VisibilityState } from "@tanstack/react-table";
import { Menu, Settings2 } from "lucide-react";
import { useState } from "react";

// Importar dnd-kit
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ColumnConfig {
  id: string;
  displayName: string;
  visible: boolean;
  order: number;
  canHide: boolean;
}

interface ColumnSettingsSheetProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  trigger?: React.ReactNode;
}

// Componente individual sortable
function SortableColumnItem({
  config,
  onVisibilityChange,
}: {
  config: ColumnConfig;
  onVisibilityChange: (columnId: string, visible: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 py-2 px-2 rounded-lg ${
        isDragging ? "bg-muted/50" : "hover:bg-muted/30"
      }`}
    >
      {/* Drag handle */}
      <div
        className="cursor-grab p-1 touch-none"
        {...attributes}
        {...listeners}
      >
        <Menu className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={config.visible}
        onCheckedChange={(checked) => onVisibilityChange(config.id, !!checked)}
        disabled={!config.canHide}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />

      {/* Label */}
      <label
        className="text-sm text-foreground cursor-pointer flex-1 select-none"
        onClick={() => onVisibilityChange(config.id, !config.visible)}
      >
        {config.displayName}
      </label>
    </div>
  );
}

export function ColumnSettingsSheet<TData, TValue>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  trigger,
}: ColumnSettingsSheetProps<TData, TValue>) {
  const [isOpen, setIsOpen] = useState(false);

  // Convertir columnas a configuración interna
  const getColumnConfigs = (): ColumnConfig[] => {
    const configs = columns
      .filter((col) => {
        const columnDef = col as any;
        return columnDef.accessorKey || columnDef.id;
      })
      .map((col, index) => {
        const columnDef = col as any;
        const id = columnDef.accessorKey || columnDef.id;
        const displayName =
          columnDef.meta?.displayName || columnDef.header || id;
        const visible = columnVisibility[id] !== false;
        const canHide = columnDef.enableHiding !== false;

        // Buscar el orden en columnOrder o usar el índice
        let order = index;
        if (columnOrder && columnOrder.includes(id)) {
          order = columnOrder.indexOf(id);
        }

        return {
          id,
          displayName,
          visible,
          order,
          canHide,
        };
      });

    // Ordenar por el campo order
    return configs.sort((a, b) => a.order - b.order);
  };

  const [columnConfigs, setColumnConfigs] =
    useState<ColumnConfig[]>(getColumnConfigs());

  // Actualizar configuraciones cuando cambien las props
  useState(() => {
    setColumnConfigs(getColumnConfigs());
  });

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleVisibilityChange = (columnId: string, visible: boolean) => {
    const newConfigs = columnConfigs.map((config) =>
      config.id === columnId ? { ...config, visible } : config
    );
    setColumnConfigs(newConfigs);

    // Crear nuevo estado de visibilidad
    const newVisibility: VisibilityState = {};
    newConfigs.forEach((config) => {
      newVisibility[config.id] = config.visible;
    });
    onColumnVisibilityChange(() => newVisibility);
  };

  // Manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columnConfigs.findIndex((item) => item.id === active.id);
      const newIndex = columnConfigs.findIndex((item) => item.id === over?.id);

      const newConfigs = arrayMove(columnConfigs, oldIndex, newIndex);

      // Actualizar order
      newConfigs.forEach((config, index) => {
        config.order = index;
      });

      setColumnConfigs(newConfigs);

      // Notificar cambio de orden
      if (onColumnOrderChange) {
        const newOrder = newConfigs.map((config) => config.id);
        onColumnOrderChange(newOrder);
      }
    }
  };

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
        <SheetHeader className=" border-b bg-background">
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Sección Columnas */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Columnas</h3>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columnConfigs.map((config) => config.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {columnConfigs.map((config) => (
                    <SortableColumnItem
                      key={config.id}
                      config={config}
                      onVisibilityChange={handleVisibilityChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
