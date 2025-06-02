"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, UserPlus, SearchIcon, Plus } from "lucide-react";

// Datos de ejemplo para la tabla
const debtorsData = [
  {
    id: 1,
    codigo: "DEB001",
    rut: "12.345.678-9",
    razonSocial: "Empresa ABC Ltda.",
  },
  {
    id: 2,
    codigo: "DEB002",
    rut: "98.765.432-1",
    razonSocial: "Comercial XYZ S.A.",
  },
  {
    id: 3,
    codigo: "DEB003",
    rut: "11.222.333-4",
    razonSocial: "Servicios Generales SPA",
  },
  {
    id: 4,
    codigo: "DEB004",
    rut: "22.111.444-5",
    razonSocial: "Distribuidora Norte Ltda.",
  },
  {
    id: 5,
    codigo: "DEB005",
    rut: "33.555.666-7",
    razonSocial: "Tecnología Sur S.A.",
  },
];

const ListDebtors = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAssignUser = (debtor: any) => {
    console.log("Asignar usuario a:", debtor);
    // Aquí iría la lógica para asignar usuario
  };

  const handleEdit = (debtor: any) => {
    console.log("Editar deudor:", debtor);
    // Aquí iría la lógica para editar
  };

  const handleDelete = (debtor: any) => {
    console.log("Eliminar deudor:", debtor);
    // Aquí iría la lógica para eliminar
  };

  // Filtrar deudores basado en el término de búsqueda
  const filteredDebtors = debtorsData.filter((debtor) => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      debtor.codigo.toLowerCase().includes(searchTermLower) ||
      debtor.rut.toLowerCase().includes(searchTermLower) ||
      debtor.razonSocial.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="flex justify-between items-center">
        <h3 className="text-md font-bold">Lista de deudores</h3>
        <div className="w-80 max-w-md relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-white"
            placeholder="Buscar por código, RUT o razón social..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-primary">Código</TableHead>
            <TableHead className="text-primary">RUT</TableHead>
            <TableHead className="text-primary">Razón Social</TableHead>
            <TableHead className="text-primary text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDebtors.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                {searchTerm
                  ? "No se encontraron deudores que coincidan con la búsqueda"
                  : "No hay deudores disponibles"}
              </TableCell>
            </TableRow>
          ) : (
            filteredDebtors.map((debtor) => (
              <TableRow key={debtor.id}>
                <TableCell>{debtor.codigo}</TableCell>
                <TableCell>{debtor.rut}</TableCell>
                <TableCell>{debtor.razonSocial}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(debtor)}
                      title="Eliminar"
                      className="hover:bg-red-500 hover:text-white text-primary"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ListDebtors;
