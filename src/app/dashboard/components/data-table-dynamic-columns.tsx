"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  Menu,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface DataTableDynamicColumnsProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyMessage?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  className?: string;
  // Propiedades para búsqueda del servidor
  enableGlobalFilter?: boolean;
  searchPlaceholder?: string;
  debounceMs?: number;
  initialSearchValue?: string;
  // Propiedades para paginación del servidor (opcional durante loading)
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange: (page: number, pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  isServerSideLoading?: boolean;
  ctaNode?: React.ReactNode;
  enableColumnFilter?: boolean;
  initialColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;
  columnLabels?: Record<string, string>;

  // Propiedades para selección de filas
  enableRowSelection?: boolean;
  initialRowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  bulkActions?: Array<{
    label: string;
    onClick: (selectedRows: any[]) => void;
    variant?: "default" | "secondary" | "destructive" | "outline";
    icon?: React.ReactNode;
  }>;
  title?: string;
  description?: string;
}

export function DataTableDynamicColumns<TData, TValue>({
  columns,
  data,
  isLoading = false,
  loadingComponent,
  emptyMessage = "No se encontraron datos",
  pageSize = 15,
  pageSizeOptions = [15, 20, 25, 30, 40, 50],
  showPagination = true,
  className = "",
  // Valores por defecto para búsqueda del servidor
  enableGlobalFilter = false,
  searchPlaceholder = "Buscar...",
  debounceMs = 300,
  initialSearchValue = "",
  // Paginación del servidor (requerida)
  pagination,
  onPaginationChange,
  onSearchChange,
  isServerSideLoading = false,
  // Nuevas props para gestión de columnas
  ctaNode,
  enableColumnFilter = false,
  initialColumnVisibility,
  onColumnVisibilityChange,
  columnLabels = {},
  // Nuevas props para selección de filas
  enableRowSelection = false,
  initialRowSelection,
  onRowSelectionChange,
  bulkActions = [],
  title = "Filtros",
  description = "Selecciona las columnas que deseas mostrar en la tabla.",
}: DataTableDynamicColumnsProps<TData, TValue>) {
  // Estado para el valor de búsqueda del servidor
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  // Estado para la visibilidad de columnas
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility || {}
  );

  // Estado para la selección de filas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialRowSelection || {}
  );

  // Estado para el Sheet de configuración de columnas
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Estado para el orden de las columnas (drag & drop básico)
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  // Inicializar orden de columnas cuando cambien las columnas (solo columnas de datos)
  useEffect(() => {
    if (columns.length > 0 && columnOrder.length === 0) {
      const initialOrder = columns
        .filter((col) => (col as any).id !== "select") // Excluir columna de selección
        .map(
          (col, index) =>
            (col as any).accessorKey || (col as any).id || `column-${index}`
        );
      setColumnOrder(initialOrder);
    }
  }, [columns, columnOrder.length]);

  // Debounce para la búsqueda del servidor
  useEffect(() => {
    if (searchValue === initialSearchValue) return; // Evitar llamada inicial

    const timer = setTimeout(() => {
      onSearchChange?.(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearchChange, initialSearchValue]);

  // Manejar cambios en visibilidad de columnas (evitar llamada inicial)
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    onColumnVisibilityChange?.(columnVisibility);
  }, [columnVisibility, onColumnVisibilityChange, isFirstRender]);

  // Manejar cambios en selección de filas
  useEffect(() => {
    onRowSelectionChange?.(rowSelection);
  }, [rowSelection, onRowSelectionChange]);

  // Crear columna de selección si está habilitada
  const selectionColumn: ColumnDef<TData, TValue> = React.useMemo(
    () => ({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    []
  );

  // Reordenar columnas según el estado de columnOrder
  const orderedColumns = React.useMemo(() => {
    // Si no hay orden personalizado, usar orden original con selección al inicio
    if (columnOrder.length === 0) {
      return enableRowSelection ? [selectionColumn, ...columns] : columns;
    }

    // Reordenar solo las columnas de datos (sin selección)
    const orderedDataCols = columnOrder
      .map((colId) =>
        columns.find(
          (col) =>
            (col as any).accessorKey === colId || (col as any).id === colId
        )
      )
      .filter(Boolean) as ColumnDef<TData, TValue>[];

    // Agregar columnas que no están en el orden
    const missingCols = columns.filter(
      (col) =>
        !columnOrder.includes((col as any).accessorKey || (col as any).id)
    );

    const finalDataColumns = [...orderedDataCols, ...missingCols];

    // Siempre agregar la columna de selección al inicio si está habilitada
    return enableRowSelection
      ? [selectionColumn, ...finalDataColumns]
      : finalDataColumns;
  }, [columns, columnOrder, enableRowSelection, selectionColumn]);

  // Configuración de React Table para paginación del servidor
  const table = useReactTable({
    data,
    columns: orderedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || 1,
    enableRowSelection: enableRowSelection,
    state: {
      pagination: {
        pageIndex: (pagination?.page || 1) - 1,
        pageSize: pagination?.limit || pageSize,
      },
      columnVisibility,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const currentPagination = {
          pageIndex: (pagination?.page || 1) - 1,
          pageSize: pagination?.limit || pageSize,
        };
        const newPagination = updater(currentPagination);
        onPaginationChange(newPagination.pageIndex + 1, newPagination.pageSize);
      }
    },
  });

  // Función para limpiar la búsqueda del servidor
  const clearSearch = () => {
    setSearchValue("");
    onSearchChange?.("");
    onPaginationChange(1, pagination?.limit || pageSize);
  };

  // Función para resetear configuración de columnas
  const resetColumnConfig = () => {
    const resetVisibility: VisibilityState = {};
    table.getAllColumns().forEach((column) => {
      // No resetear la columna de selección
      if (column.id !== "select") {
        resetVisibility[column.id] = true;
      }
    });
    setColumnVisibility(resetVisibility);

    // Resetear orden de columnas también (solo columnas de datos)
    const initialOrder = columns
      .filter((col) => (col as any).id !== "select")
      .map(
        (col, index) =>
          (col as any).accessorKey || (col as any).id || `column-${index}`
      );
    setColumnOrder(initialOrder);

    setIsSheetOpen(false);
  };

  // Información de paginación del servidor
  const paginationInfo = {
    currentPage: pagination?.page || 1,
    pageSize: pagination?.limit || pageSize,
    total: pagination?.total || 0,
    totalPages: pagination?.totalPages || 1,
    hasNext: pagination?.hasNext || false,
    hasPrevious: pagination?.hasPrevious || false,
    showingFrom:
      (pagination?.total || 0) > 0
        ? ((pagination?.page || 1) - 1) * (pagination?.limit || pageSize) + 1
        : 0,
    showingTo: Math.min(
      (pagination?.page || 1) * (pagination?.limit || pageSize),
      pagination?.total || 0
    ),
  };

  return (
    <>
      {/* Barra de herramientas extendida */}
      <div className="space-y-4 mb-4">
        {/* Barra de búsqueda */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center justify-between gap-2 flex-1">
            {title && <div className="font-bold text-black">{title}</div>}
            {enableGlobalFilter && (
              <div className="relative flex-1 max-w-sm bg-white">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {searchValue && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {isServerSideLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-muted-foreground"></div>
                    Buscando...
                  </>
                ) : (
                  `${paginationInfo.total} resultado(s)`
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Botón para filtrar columnas */}
            {enableColumnFilter && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Columns className="h-4 w-4 mr-2 text-orange-400" />
                    Editar tabla
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-4 px-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="space-y-2">
                      {/* Renderizar columnas en el orden personalizado (sin la columna de selección) */}
                      {columnOrder
                        .map((colId) =>
                          table
                            .getAllColumns()
                            .find(
                              (col) =>
                                ((col.columnDef as any).accessorKey === colId ||
                                  col.id === colId) &&
                                col.id !== "select"
                            )
                        )
                        .filter(Boolean)
                        .filter((column) => column!.getCanHide())
                        .map((column) => {
                          if (!column) return null;

                          const columnLabel =
                            columnLabels[column.id] ||
                            (typeof column.columnDef.header === "string"
                              ? column.columnDef.header
                              : column.id);

                          const columnId =
                            (column.columnDef as any).accessorKey || column.id;

                          return (
                            <div
                              key={column.id}
                              className="group flex items-center justify-between space-x-2 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", columnId);
                                e.dataTransfer.effectAllowed = "move";
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "move";
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                const draggedColumnId =
                                  e.dataTransfer.getData("text/plain");
                                const dropColumnId = columnId;

                                if (draggedColumnId !== dropColumnId) {
                                  const newOrder = [...columnOrder];
                                  const dragIndex =
                                    newOrder.indexOf(draggedColumnId);
                                  const dropIndex =
                                    newOrder.indexOf(dropColumnId);

                                  // Remover elemento de la posición original
                                  newOrder.splice(dragIndex, 1);
                                  // Insertar en la nueva posición
                                  newOrder.splice(
                                    dropIndex,
                                    0,
                                    draggedColumnId
                                  );

                                  setColumnOrder(newOrder);
                                }
                              }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                  <Menu className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Checkbox
                                  id={column.id}
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                  }
                                />
                                <label
                                  htmlFor={column.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                                >
                                  {columnLabel}
                                </label>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <SheetFooter>
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={resetColumnConfig}
                        className="flex-1"
                      >
                        Limpiar
                      </Button>
                      <Button
                        onClick={() => setIsSheetOpen(false)}
                        className="flex-1"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            )}

            {/* Botón CTA personalizable */}
            {ctaNode && ctaNode}
          </div>
        </div>

        {/* Barra de acciones masivas */}
        {enableRowSelection && Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} elemento(s) seleccionado(s)
            </div>
            <div className="flex items-center gap-2">
              {bulkActions.map((action, index) => {
                const selectedRows = table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original);
                return (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    size="sm"
                    onClick={() => action.onClick(selectedRows)}
                    className="flex items-center gap-1"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRowSelection({})}
              >
                Limpiar selección
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className={`space-y-4 bg-white ${className}`}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-primary text-center"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading || isServerSideLoading ? (
                loadingComponent ? (
                  loadingComponent
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      Cargando...
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="text-center">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="text-center py-8"
                      >
                        {searchValue
                          ? "No se encontraron resultados para tu búsqueda"
                          : emptyMessage}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Controles de paginación del servidor */}
        {showPagination && (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="text-sm text-muted-foreground">
              Mostrando {paginationInfo.showingFrom} a{" "}
              {paginationInfo.showingTo} de {paginationInfo.total} registros
              {searchValue && (
                <span className="text-muted-foreground">
                  {" "}
                  (filtrado por búsqueda)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Filas por página</p>
                <Select
                  value={`${paginationInfo.pageSize}`}
                  onValueChange={(value) => {
                    onPaginationChange(
                      paginationInfo.currentPage,
                      Number(value)
                    );
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={paginationInfo.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {paginationInfo.currentPage} de{" "}
                {paginationInfo.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden size-8 lg:flex"
                  onClick={() => {
                    onPaginationChange(1, paginationInfo.pageSize);
                  }}
                  disabled={!paginationInfo.hasPrevious}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    onPaginationChange(
                      paginationInfo.currentPage - 1,
                      paginationInfo.pageSize
                    );
                  }}
                  disabled={!paginationInfo.hasPrevious}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    onPaginationChange(
                      paginationInfo.currentPage + 1,
                      paginationInfo.pageSize
                    );
                  }}
                  disabled={!paginationInfo.hasNext}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden size-8 lg:flex"
                  onClick={() => {
                    onPaginationChange(
                      paginationInfo.totalPages,
                      paginationInfo.pageSize
                    );
                  }}
                  disabled={!paginationInfo.hasNext}
                >
                  <span className="sr-only">Ir a la última página</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
