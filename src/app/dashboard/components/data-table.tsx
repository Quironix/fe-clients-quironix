"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  OnChangeFn,
  useReactTable,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  loadingComponent?: React.ReactNode;
  emptyMessage?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  className?: string;
  // Nuevas propiedades para búsqueda
  enableGlobalFilter?: boolean;
  searchPlaceholder?: string;
  searchableColumns?: string[];
  globalFilterFunction?: (
    row: any,
    columnId: string,
    value: any,
    addMeta: any
  ) => boolean;
  debounceMs?: number;
  // Nuevas propiedades para visibilidad de columnas
  enableColumnVisibility?: boolean;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  // Nuevas propiedades para ordenamiento de columnas
  columnOrder?: ColumnOrderState;
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>;
  // Nuevas propiedades para layout personalizado
  title?: string;
  toolbar?: React.ReactNode;
  toolbarLayout?: 'default' | 'split'; // default: todo junto, split: título a la izquierda, acciones a la derecha
  hideDefaultControls?: boolean; // ocultar controles por defecto de búsqueda y columnas
  // Nuevas propiedades para selección de filas
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  loadingComponent,
  emptyMessage = "No se encontraron datos",
  pageSize = 15,
  pageSizeOptions = [15, 20, 25, 30, 40, 50],
  showPagination = true,
  className = "",
  // Valores por defecto para búsqueda
  enableGlobalFilter = false,
  searchPlaceholder = "Buscar...",
  searchableColumns,
  globalFilterFunction,
  debounceMs = 300,
  // Valores por defecto para visibilidad de columnas
  enableColumnVisibility = false,
  columnVisibility,
  onColumnVisibilityChange,
  // Valores por defecto para ordenamiento de columnas
  columnOrder,
  onColumnOrderChange,
  // Valores por defecto para layout personalizado
  title,
  toolbar,
  toolbarLayout = 'default',
  hideDefaultControls = false,
  // Valores por defecto para selección de filas
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  onSelectedRowsChange,
}: DataTableProps<TData, TValue>) {
  // Estado para el valor de búsqueda
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Estado para la visibilidad de columnas
  const [internalColumnVisibility, setInternalColumnVisibility] =
    useState<VisibilityState>(columnVisibility || {});

  // Estado para el ordenamiento de columnas
  const [internalColumnOrder, setInternalColumnOrder] =
    useState<ColumnOrderState>(columnOrder || []);
  
  // Estado para la selección de filas
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>(rowSelection || {});

  // Usar el estado interno o el controlado externamente
  let currentColumnVisibility = columnVisibility || internalColumnVisibility;
  
  // Asegurar que la columna de selección esté siempre visible si está habilitada
  if (enableRowSelection) {
    currentColumnVisibility = { select: true, ...currentColumnVisibility };
  }
  
  // Asegurar que la columna de selección esté siempre primera si está habilitada
  let currentColumnOrder = columnOrder || internalColumnOrder;
  if (enableRowSelection && currentColumnOrder.length > 0) {
    // Filtrar 'select' del orden actual y agregarlo al inicio
    const orderWithoutSelect = currentColumnOrder.filter(id => id !== 'select');
    currentColumnOrder = ['select', ...orderWithoutSelect];
  } else if (enableRowSelection) {
    currentColumnOrder = ['select'];
  }
  
  const currentRowSelection = rowSelection || internalRowSelection;

  const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (
    updaterOrValue
  ) => {
    if (onColumnVisibilityChange) {
      onColumnVisibilityChange(updaterOrValue);
    } else {
      setInternalColumnVisibility(updaterOrValue);
    }
  };

  const handleColumnOrderChange: OnChangeFn<ColumnOrderState> = (
    updaterOrValue
  ) => {
    if (onColumnOrderChange) {
      onColumnOrderChange(updaterOrValue);
    } else {
      setInternalColumnOrder(updaterOrValue);
    }
  };
  
  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (
    updaterOrValue
  ) => {
    if (onRowSelectionChange) {
      onRowSelectionChange(updaterOrValue);
    } else {
      setInternalRowSelection(updaterOrValue);
    }
  };

  // Función personalizada de filtrado
  const customGlobalFilterFn = (row: any, columnId: string, value: string) => {
    if (globalFilterFunction) {
      return globalFilterFunction(row, columnId, value, {});
    }

    // Si se especifican columnas específicas para buscar
    if (searchableColumns && searchableColumns.length > 0) {
      return searchableColumns.some((colId) => {
        const cellValue = row.getValue(colId);
        if (cellValue == null) return false;
        return String(cellValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      });
    }

    // Búsqueda en todas las columnas visibles
    return columns.some((column: any) => {
      if (!column.accessorKey) return false;
      const cellValue = row.getValue(column.accessorKey as string);
      if (cellValue == null) return false;
      return String(cellValue)
        .toLowerCase()
        .includes(String(value).toLowerCase());
    });
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setGlobalFilter(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs]);

  // Debug: verificar si la selección está habilitada
  console.log('enableRowSelection:', enableRowSelection);
  
  // Crear columnas con selección si está habilitada
  const columnsWithSelection = enableRowSelection ? [
    {
      id: "select",
      header: ({ table }: any) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Seleccionar todas las filas"
          />
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Seleccionar fila"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
      minSize: 40,
      maxSize: 40,
    },
    ...columns,
  ] : columns;
  
  // Debug: verificar columnas finales
  console.log('columnsWithSelection:', columnsWithSelection.map(col => ({ 
    id: col.id || (col as any).accessorKey, 
    enableHiding: col.enableHiding 
  })));

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customGlobalFilterFn,
    enableRowSelection: enableRowSelection,
    state: {
      globalFilter,
      columnVisibility: currentColumnVisibility,
      columnOrder: currentColumnOrder,
      rowSelection: currentRowSelection,
    },
    getRowId: (_, index) => index.toString(), // Añadir ID único para las filas
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnOrderChange: handleColumnOrderChange,
    onRowSelectionChange: handleRowSelectionChange,
    initialState: {
      pagination: {
        pageSize,
      },
      columnVisibility: enableRowSelection ? { select: true, ...currentColumnVisibility } : currentColumnVisibility,
    },
  });

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchValue("");
    setGlobalFilter("");
    table.setPageIndex(0);
  };
  
  // Efecto para notificar cambios en las filas seleccionadas
  useEffect(() => {
    if (onSelectedRowsChange && enableRowSelection) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onSelectedRowsChange(selectedRows);
    }
  }, [currentRowSelection, onSelectedRowsChange, enableRowSelection, table]);

  // Renderizar toolbar personalizado o por defecto
  const renderToolbar = () => {
    if (toolbarLayout === 'split') {
      return (
        <div className="flex items-center justify-between mb-4">
          {/* Lado izquierdo - Título */}
          <div>
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
          </div>
          
          {/* Lado derecho - Controles y acciones */}
          <div className="flex items-center gap-3">
            {/* Búsqueda */}
            {enableGlobalFilter && !hideDefaultControls && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-9 pr-9 w-64"
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
            
            {/* Información de búsqueda y selección */}
            <div className="flex items-center gap-4">
              {searchValue && (
                <div className="text-sm text-muted-foreground">
                  {table.getFilteredRowModel().rows.length} resultado(s)
                </div>
              )}
              
              {enableRowSelection && table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} seleccionados
                </div>
              )}
            </div>

            {/* Toolbar personalizado */}
            {toolbar}
            
            {/* Control de columnas */}
            {enableColumnVisibility && !hideDefaultControls && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4" />
                    Columnas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const columnDef = column.columnDef as any;
                      const displayName =
                        columnDef.meta?.displayName ||
                        columnDef.header ||
                        column.id;

                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {displayName}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      );
    }
    
    // Layout por defecto
    return (
      <>
        {/* Título si existe */}
        {title && (
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        
        {/* Controles por defecto */}
        {!hideDefaultControls && (enableGlobalFilter || enableColumnVisibility) && (
          <div className="flex items-center gap-2 mb-4">
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

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto">
                    <Settings2 className="h-4 w-4" />
                    Columnas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const columnDef = column.columnDef as any;
                      const displayName =
                        columnDef.meta?.displayName ||
                        columnDef.header ||
                        column.id;

                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {displayName}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Información de búsqueda */}
            {searchValue && (
              <div className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length} resultado(s)
              </div>
            )}
            
            {/* Información de selección */}
            {enableRowSelection && table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} seleccionados
              </div>
            )}
          </div>
        )}
        
        {/* Toolbar personalizado */}
        {toolbar && (
          <div className="mb-4">
            {toolbar}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* Renderizar toolbar */}
      {renderToolbar()}

      <div className={`space-y-4 bg-white ${className}`}>
        {/* Barra de búsqueda */}

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
              {isLoading ? (
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
                        {globalFilter
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

        {/* Controles de paginación */}
        {showPagination && (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="text-sm text-muted-foreground">
              Mostrando{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              a{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              de {table.getFilteredRowModel().rows.length} registros
              {globalFilter &&
                table.getFilteredRowModel().rows.length !== data.length && (
                  <span className="text-muted-foreground">
                    {" "}
                    (filtrado de {data.length} total)
                  </span>
                )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Filas por página</p>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {pageSizeOptions.map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Página {table.getState().pagination.pageIndex + 1} de{" "}
                {table.getPageCount()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden size-8 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir a la primera página</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Ir a la página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Ir a la página siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden size-8 lg:flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
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
