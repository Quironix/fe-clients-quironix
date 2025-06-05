"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Edit, Trash2, UserPlus, SearchIcon, Plus } from "lucide-react";
import { useDebtorsStore } from "../store";
import { useProfileContext } from "@/context/ProfileContext";
import Loader from "@/components/Loader";
import { Debtors } from "./types";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { toast } from "sonner";

const ListDebtors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { session, profile } = useProfileContext();
  const { debtors, loading, error, fetchDebtors, deleteDebtor } =
    useDebtorsStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDebtors(session?.token, profile?.client?.id);
    }
  }, [session?.token, profile?.client?.id, fetchDebtors]);

  const handleAssignUser = (debtor: Debtors) => {
    console.log("Asignar usuario a:", debtor);
    // Aquí iría la lógica para asignar usuario
  };

  const handleEdit = (debtor: Debtors) => {
    console.log("Editar deudor:", debtor);
    // Aquí iría la lógica para editar
  };

  const handleDelete = async (debtor: Debtors) => {
    if (session?.token && profile?.client?.id) {
      try {
        await deleteDebtor(session.token, profile.client.id, debtor.id);
        toast.success("Deudor eliminado correctamente");
        fetchDebtors(session.token, profile.client.id);
      } catch (error) {
        toast.error("Error al eliminar deudor");
        console.error("Error al eliminar deudor:", error);
      }
    }
  };

  // Filtrar deudores basado en el término de búsqueda
  const filteredDebtors = useMemo(() => {
    if (!debtors) return [];

    return debtors.filter((debtor: Debtors) => {
      if (!searchTerm) return true;
      const searchTermLower = searchTerm.toLowerCase();
      return (
        debtor.dni?.dni?.toLowerCase().includes(searchTermLower) ||
        debtor.name?.toLowerCase().includes(searchTermLower) ||
        debtor.email?.toLowerCase().includes(searchTermLower)
      );
    });
  }, [debtors, searchTerm]);

  // Cálculos de paginación
  const totalItems = filteredDebtors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDebtors = filteredDebtors.slice(startIndex, endIndex);

  // Resetear página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  // Función para generar números de página visibles
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots.filter(
      (item, index, arr) => arr.indexOf(item) === index
    );
  };

  // Mostrar loader mientras está cargando
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold">Lista de deudores</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader size={40} className="text-primary mb-4" />
            <p className="text-muted-foreground">Cargando deudores...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si ocurre algún problema
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-bold">Lista de deudores</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-medium mb-2">
                Error al cargar los deudores
              </p>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <Button
                onClick={() => {
                  if (session?.token && profile?.client?.id) {
                    fetchDebtors(session?.token, profile?.client?.id);
                  }
                }}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con buscador y controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-md font-bold">Lista de deudores</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Buscador */}
          <div className="w-80 max-w-md relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-white"
              placeholder="Buscar por DNI, nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">DNI</TableHead>
            <TableHead className="text-primary">Nombre</TableHead>
            <TableHead className="text-primary">Email</TableHead>
            <TableHead className="text-primary text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentDebtors.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground py-8"
              >
                {searchTerm
                  ? "No se encontraron deudores que coincidan con la búsqueda"
                  : "No hay deudores disponibles"}
              </TableCell>
            </TableRow>
          ) : (
            currentDebtors?.map((debtor) => (
              <TableRow key={debtor.id}>
                <TableCell>{debtor.dni?.dni || "-"}</TableCell>
                <TableCell>{debtor.name || "-"}</TableCell>
                <TableCell>{debtor.email || "-"}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      disabled={true}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAssignUser(debtor)}
                      title="Asignar usuario"
                      className="hover:bg-blue-500 hover:text-white text-primary"
                    >
                      <UserPlus />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(debtor)}
                      title="Editar"
                      className="hover:bg-amber-500 hover:text-white text-primary"
                    >
                      <Edit />
                    </Button>
                    <DialogConfirm
                      title="¿Eliminar deudor?"
                      description={`¿Estás seguro que deseas eliminar el deudor "${debtor.name}"? Esta acción no se puede deshacer.`}
                      triggerButton={
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          className="hover:bg-red-500 hover:text-white text-primary"
                        >
                          <Trash2 />
                        </Button>
                      }
                      cancelButtonText="Cancelar"
                      confirmButtonText="Sí, eliminar"
                      onConfirm={() => handleDelete(debtor)}
                      type="danger"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter className="w-full">
          <TableRow>
            <TableCell colSpan={4}>
              <div className="flex justify-between items-center w-full">
                <div className="text-sm">
                  Mostrando {currentDebtors.length} de {totalItems}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Registros por página:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 w-full">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={
                    currentPage <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getVisiblePages().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Number(page));
                      }}
                      isActive={currentPage === Number(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ListDebtors;
