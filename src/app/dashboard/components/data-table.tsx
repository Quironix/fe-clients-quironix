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
}: DataTableProps<TData, TValue>) {
  // Estado para el valor de búsqueda del servidor
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  // Debounce para la búsqueda del servidor
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchValue, debounceMs, onSearchChange]);

  // Configuración de React Table para paginación del servidor
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages || 1,
    state: {
      pagination: {
        pageIndex: (pagination?.page || 1) - 1,
        pageSize: pagination?.limit || pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const currentPagination = {
          pageIndex: (pagination?.page || 1) - 1,
          pageSize: pagination?.limit || pageSize,
        };
        const newPagination = updater(currentPagination);
        onPaginationChange(
          newPagination.pageIndex + 1,
          newPagination.pageSize
        );
      }
    },
  });

  // Función para limpiar la búsqueda del servidor
  const clearSearch = () => {
    setSearchValue("");
    onSearchChange?.("");
    onPaginationChange(1, pagination?.limit || pageSize);
  };

  // Información de paginación del servidor
  const paginationInfo = {
    currentPage: pagination?.page || 1,
    pageSize: pagination?.limit || pageSize,
    total: pagination?.total || 0,
    totalPages: pagination?.totalPages || 1,
    hasNext: pagination?.hasNext || false,
    hasPrevious: pagination?.hasPrevious || false,
    showingFrom: (pagination?.total || 0) > 0 ? ((pagination?.page || 1) - 1) * (pagination?.limit || pageSize) + 1 : 0,
    showingTo: Math.min(
      (pagination?.page || 1) * (pagination?.limit || pageSize),
      pagination?.total || 0
    ),
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
      )}

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
