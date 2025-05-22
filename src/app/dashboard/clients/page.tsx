"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../components/header";
import { useDashboard } from "@/stores/dashboard/dashboardStore";
import { Main } from "../components/main";
import { Button } from "@/components/ui/button";
import TitleSection from "../components/title-section";
import { Edit, Plus, Building, Trash2, Users, Dot, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Search from "../admin-users/components/search";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientStore } from "./store";
import { useSession } from "next-auth/react";
import LoaderTable from "../components/loader-table";
import DialogForm from "../components/dialog-form";
import { Client } from "./services/types";
import ClientForm from "./components/form-client";
import DialogConfirm from "../components/dialog-confirm";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { IconUsersPlus } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientUpdate, ClientDTO } from "./services/dto";

const ClientsContent = () => {
  const { data: session }: any = useSession();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const {
    clients,
    isLoading,
    refreshClients,
    createClient,
    updateClient,
    deleteClient,
    setEditClient,
    editClient,
    setSearchTerm,
  } = useClientStore();

  useEffect(() => {
    if (session?.token) {
      refreshClients(session?.token);
    }
  }, [session?.token]);

  // Actualizar el searchTerm en el store cuando cambie el parámetro de búsqueda en la URL
  useEffect(() => {
    setSearchTerm(searchTerm);
  }, [searchTerm, setSearchTerm]);

  // Filtrar clientes basados en el término de búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(
      client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contacts?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const handleEditClient = async (data: unknown): Promise<void> => {
    const clientData = data as ClientUpdate;
    if (clientData && clientData.id) {
      await updateClient(session?.token, clientData.id, clientData);
      setEditingClientId(null);
      setEditClient(null);
    }
  };

  // Renderizar el badge de estado según el valor
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "VALIDATED":
        return (
          <Badge variant="outline" className="bg-white text-green-800 border-green-800 p-1 px-4">
            <Circle className="text-green-800" fill="currentColor" /> Validado
          </Badge>
        );
      case "INVITED":
        return (
          <Badge variant="outline" className="bg-white text-blue-800 border-blue-800 p-1 px-4">
            <Circle className="text-blue-800" fill="currentColor" /> Invitado
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge variant="outline" className="bg-white text-green-800 border-green-800  p-1 px-4">
            <Circle className="text-green-800" fill="currentColor" /> Activo
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge variant="outline" className="bg-white text-red-800 border-red-800 p-1 px-4">
            <Circle className="text-red-800" fill="currentColor" /> Inactivo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-white border-gray-800 text-gray-800 p-1 px-4">
            <Circle className="text-gray-800" fill="currentColor" />
            S/I
          </Badge>
        );
    }
  };

  return (
    <>
      <Header fixed>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            size="icon"
            className="bg-orange-500 text-white rounded-full hover:bg-orange-400 cursor-pointer"
          >
            ES
          </Button>
        </div>
      </Header>
      <Main>
        <TitleSection
          title="Clientes"
          description="Gestiona la información de tus clientes."
          icon={<Building color="white" />}
          subDescription="Configuración de clientes"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <Card className="h-full p-5">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-5">
                  <Search placeholder="Buscar clientes..." />
                  <DialogForm
                    title="Crear cliente"
                    trigger={
                      <Button
                        className="bg-orange-500 text-white hover:bg-orange-400"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <div className="flex items-center gap-2">
                          <IconUsersPlus /> Crear nuevo cliente
                        </div>
                      </Button>
                    }
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                  >
                    {/* <div className="overflow-y-auto max-h-[80vh] p-3"> */}
                    <ScrollArea className="h-[80vh] px-4">
                      <ClientForm
                        onSubmit={data => {
                          return createClient(session?.token, data);
                        }}
                        setOpen={setIsCreateDialogOpen}
                      />
                    </ScrollArea>
                    {/* </div> */}
                  </DialogForm>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-primary font-semibold">Razón social</TableHead>
                        <TableHead className="text-primary font-semibold">Nombre</TableHead>
                        <TableHead className="text-primary font-semibold">Apellido</TableHead>
                        <TableHead className="text-primary font-semibold">País</TableHead>
                        <TableHead className="text-primary font-semibold">Email</TableHead>
                        <TableHead className="text-primary font-semibold">Plan</TableHead>
                        <TableHead className="text-primary font-semibold">Estado</TableHead>
                        <TableHead className="text-primary font-semibold text-right">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <LoaderTable cols={8} />
                      ) : filteredClients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No se encontraron clientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClients.map(client => (
                          <TableRow key={client.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.contacts?.[0]?.first_name || "—"} </TableCell>
                            <TableCell>{client.contacts?.[0]?.last_name || "—"}</TableCell>
                            <TableCell>{client.country?.name || "—"}</TableCell>
                            <TableCell>{client.contacts?.[0]?.email || "—"}</TableCell>
                            <TableCell>{client.subscriptions?.[0]?.plan?.name || "—"}</TableCell>
                            <TableCell>{renderStatusBadge(client.status || "active")}</TableCell>
                            <TableCell className="flex justify-end gap-2">
                              <DialogForm
                                title="Editar cliente"
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditClient(client);
                                      setEditingClientId(client.id || "");
                                    }}
                                  >
                                    <Edit className="text-primary h-4 w-4" />
                                  </Button>
                                }
                                open={editingClientId === client.id}
                                onOpenChange={open => {
                                  if (!open) {
                                    setEditingClientId(null);
                                    setEditClient(null);
                                  }
                                }}
                              >
                                <div className="p-4">
                                  <ClientForm
                                    defaultValues={ClientDTO.toFormData(client)}
                                    onSubmit={handleEditClient}
                                    setOpen={() => setEditingClientId(null)}
                                  />
                                </div>
                              </DialogForm>
                              <DialogConfirm
                                title="¿Estás seguro que deseas eliminar este cliente?"
                                description="Esta acción no se puede deshacer."
                                triggerButton={
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="text-red-500 h-4 w-4" />
                                  </Button>
                                }
                                onConfirm={() => deleteClient(session?.token, client.id || "")}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Main>
    </>
  );
};

const ClientsPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ClientsContent />
    </Suspense>
  );
};

export default ClientsPage;
