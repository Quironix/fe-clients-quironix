"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit, Share2, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import DialogConfirm from "../../components/dialog-confirm";
import LoaderTable from "../../components/loader-table";
import { User } from "../services/types";
import { useUserStore } from "../store";
interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onReinvite: (user: User) => void;
}

const UsersTable = ({
  users,
  onEdit,
  onDelete,
  onReinvite,
}: UsersTableProps) => {
  const { loading } = useUserStore();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  // Asegurar que users sea un array antes de filtrar
  const usersArray = Array.isArray(users) ? users : [];

  const filteredUsers = usersArray.filter((user) => {
    if (!searchTerm) return true;
    return (
      user.first_name.toLowerCase().includes(searchTerm) ||
      user.last_name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-primary">Nombre</TableHead>
          <TableHead className="text-primary">Apellido</TableHead>
          <TableHead className="text-primary">Email</TableHead>
          <TableHead className="text-primary">Teléfono</TableHead>
          <TableHead className="text-primary">Creado</TableHead>
          <TableHead className="text-primary">Actualizado</TableHead>
          <TableHead className="text-primary text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <LoaderTable key="loader" cols={7} />
        ) : (
          filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.first_name}</TableCell>
              <TableCell>{user.last_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone_number}</TableCell>
              <TableCell className="text-xs">
                {user.created_at &&
                  format(new Date(user.created_at), "dd-MM-yyyy HH:mm", {
                    locale: es,
                  })}
              </TableCell>
              <TableCell className="text-xs">
                {user.updated_at &&
                  format(new Date(user.updated_at), "dd-MM-yyyy HH:mm", {
                    locale: es,
                  })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(user)}
                    title="Editar"
                    className="hover:bg-amber-500 hover:text-white text-primary"
                  >
                    <Edit />
                  </Button>
                  <DialogConfirm
                    title="¿Está seguro que desea eliminar el usuario?"
                    description="Al eliminar el usuario, perderá toda la información asociada a este usuario."
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
                    onConfirm={() => onDelete(user)}
                  />
                  <DialogConfirm
                    type="warning"
                    confirmButtonText="Reinvitar"
                    title="¿Está seguro que desea reinvitar el usuario?"
                    description="Al reinvitar el usuario, se enviará un nuevo correo de invitación."
                    triggerButton={
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Reinvitar"
                        className="hover:bg-green-500 hover:text-white text-primary"
                      >
                        <Share2 />
                      </Button>
                    }
                    onConfirm={() => onReinvite(user)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
