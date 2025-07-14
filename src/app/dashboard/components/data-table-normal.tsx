"use client";

import { Button } from "@/components/ui/button";
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
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

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
}

export default function DataTableNormal<TData, TValue>({
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
}: DataTableProps<TData, TValue>) {
  // Estado para el valor de búsqueda
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchValue, setSearchValue] = useState("");

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customGlobalFilterFn,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setSearchValue("");
    setGlobalFilter("");
    table.setPageIndex(0);
  };

  return (
    <>
      {enableGlobalFilter && (
        <div className="flex items-center gap-2 ">
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
          {searchValue && (
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} resultado(s)
            </div>
          )}
        </div>
      )}

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
