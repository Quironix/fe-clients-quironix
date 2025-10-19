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
  enableGlobalFilter?: boolean;
  searchPlaceholder?: string;
  debounceMs?: number;
  initialSearchValue?: string;
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
  columnLabels?: Record<string, string>;
  enableRowSelection?: boolean;
  initialRowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  bulkActions?: Array<{
    label: string;
    onClick: (selectedRows: any[]) => void;
    variant?: "default" | "secondary" | "destructive" | "outline";
    icon?: React.ReactNode;
  }>;
  title?: string | React.ReactNode;
  description?: string;
  handleSuccessButton?: (config?: ColumnConfiguration) => void | Promise<void>;
  filterInputs?: React.ReactNode;
  initialColumnConfiguration?: ColumnConfiguration;
  isApplyingFilters?: boolean;
  onResetFilters?: () => void;
}

interface ColumnConfig {
  name: string;
  is_visible: boolean;
}

type ColumnConfiguration = ColumnConfig[];

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
  enableGlobalFilter = false,
  searchPlaceholder = "Buscar...",
  debounceMs = 300,
  initialSearchValue = "",
  pagination,
  onPaginationChange,
  onSearchChange,
  isServerSideLoading = false,
  ctaNode,
  enableColumnFilter = false,
  initialColumnVisibility,
  columnLabels = {},
  enableRowSelection = false,
  initialRowSelection,
  onRowSelectionChange,
  bulkActions = [],
  title = "Filtros",
  description = "Selecciona las columnas que deseas mostrar en la tabla.",
  handleSuccessButton,
  filterInputs,
  initialColumnConfiguration,
  isApplyingFilters = false,
  onResetFilters,
}: DataTableDynamicColumnsProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility || {}
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    initialRowSelection || {}
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (columns.length > 0 && columnOrder.length === 0) {
      const initialOrder = columns
        .filter((col) => (col as any).id !== "select")
        .map(
          (col, index) =>
            (col as any).accessorKey || (col as any).id || `column-${index}`
        );
      setColumnOrder(initialOrder);
    }
  }, [columns, columnOrder.length]);

  useEffect(() => {
    if (initialColumnConfiguration && initialColumnConfiguration.length > 0) {
      applyColumnConfiguration(initialColumnConfiguration);
    }
  }, [initialColumnConfiguration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearchChange]);

  useEffect(() => {
    onRowSelectionChange?.(rowSelection);
  }, [rowSelection, onRowSelectionChange]);

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

  const orderedColumns = React.useMemo(() => {
    if (columnOrder.length === 0) {
      return enableRowSelection ? [selectionColumn, ...columns] : columns;
    }

    const orderedDataCols = columnOrder
      .map((colId) =>
        columns.find(
          (col) =>
            (col as any).accessorKey === colId || (col as any).id === colId
        )
      )
      .filter(Boolean) as ColumnDef<TData, TValue>[];

    const missingCols = columns.filter(
      (col) =>
        !columnOrder.includes((col as any).accessorKey || (col as any).id)
    );

    const finalDataColumns = [...orderedDataCols, ...missingCols];

    return enableRowSelection
      ? [selectionColumn, ...finalDataColumns]
      : finalDataColumns;
  }, [columns, columnOrder, enableRowSelection, selectionColumn]);

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

  const clearSearch = () => {
    setSearchValue("");
    onSearchChange?.("");
    // No llamar a onPaginationChange aquí porque onSearchChange ya resetea a página 1
    // Esto evita hacer dos llamadas al API con estados inconsistentes
  };

  const resetColumnConfig = () => {
    const defaultConfig: ColumnConfiguration = columns
      .filter((col) => (col as any).id !== "select")
      .map((col, index) => ({
        name: (col as any).accessorKey || (col as any).id || `column-${index}`,
        is_visible: true,
      }));
    applyColumnConfiguration(defaultConfig);

    // Resetear los filtros si existe la función
    onResetFilters?.();

    setIsSheetOpen(false);
  };

  const createColumnConfiguration = (): ColumnConfiguration => {
    return columnOrder.map((columnName) => ({
      name: columnName,
      is_visible: columnVisibility[columnName] ?? true,
    }));
  };

  const applyColumnConfiguration = (config: ColumnConfiguration) => {
    const newVisibility: VisibilityState = {};
    const newOrder: string[] = [];
    config.forEach((col) => {
      newVisibility[col.name] = col.is_visible;
      newOrder.push(col.name);
    });
    setColumnVisibility(newVisibility);
    setColumnOrder(newOrder);
  };

  const handleApplyConfiguration = async () => {
    try {
      const currentConfig: ColumnConfiguration = createColumnConfiguration();
      if (handleSuccessButton && typeof handleSuccessButton === "function") {
        await handleSuccessButton(currentConfig);
      }
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error al aplicar configuración de columnas:", error);
    }
  };

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
      <div className="space-y-4 mb-4">
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

            {/* {searchValue && (
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
            )} */}
          </div>

          <div className="flex items-center gap-2">
            {ctaNode && ctaNode}
            {enableColumnFilter && mounted && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Columns className="h-4 w-4 mr-2 text-orange-400" />
                    Editar tabla
                  </Button>
                </SheetTrigger>
                <SheetContent className="min-w-[30vw]">
                  <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>{description}</SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 px-4 max-w-full overflow-x-hidden overflow-y-auto max-h-[calc(100vh-200px)]">
                    <div className="w-full border-b border-gray-200 mb-2 pb-1">
                      <span className="text-sm font-bold text-gray-500">
                        Columnas
                      </span>
                    </div>
                    <div className="space-y-1">
                      {columnOrder.map((colId) => {
                        const column = columns.find(
                          (col) =>
                            (col as any).accessorKey === colId ||
                            (col as any).id === colId
                        );
                        if (!column) return null;

                        const columnId = colId;
                        const tableColumn = table
                          .getAllColumns()
                          .find(
                            (col) =>
                              col.id === columnId ||
                              (col.columnDef as any).accessorKey === columnId
                          );
                        const columnLabel =
                          columnLabels[columnId] ||
                          (typeof column.header === "string"
                            ? column.header
                            : columnId);

                        return (
                          <div
                            key={columnId}
                            className="group flex items-center justify-between space-x-1 py-2 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
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
                                if (dragIndex > -1 && dropIndex > -1) {
                                  newOrder.splice(dragIndex, 1);
                                  newOrder.splice(
                                    dropIndex,
                                    0,
                                    draggedColumnId
                                  );
                                  setColumnOrder(newOrder);
                                }
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
                                <Menu className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <Checkbox
                                id={columnId}
                                checked={
                                  tableColumn
                                    ? tableColumn.getIsVisible()
                                    : columnVisibility[columnId] !== false
                                }
                                onCheckedChange={(value) => {
                                  if (tableColumn) {
                                    tableColumn.toggleVisibility(!!value);
                                  }
                                  setColumnVisibility((prev) => ({
                                    ...prev,
                                    [columnId]: !!value,
                                  }));
                                }}
                              />
                              <label
                                htmlFor={columnId}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                              >
                                {columnLabel}
                              </label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {filterInputs && filterInputs}
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
                        onClick={handleApplyConfiguration}
                        className="flex-1"
                        disabled={isApplyingFilters}
                      >
                        {isApplyingFilters ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Aplicando...
                          </>
                        ) : (
                          "Aplicar"
                        )}
                      </Button>
                    </div>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* {enableRowSelection && Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} elemento(s) seleccionado(s)
            </div>
          </div>
        )} */}
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

        {showPagination && (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="text-sm text-muted-foreground">
              Mostrando {paginationInfo.showingFrom} a{" "}
              {paginationInfo.showingTo} de {paginationInfo.total} registros
              {searchValue && (
                <span className="text-muted-foreground"> (filtrado)</span>
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
