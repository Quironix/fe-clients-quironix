// "use client";
// import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
// import { deleteDebtor, getDebtors } from "@/app/dashboard/debtors/services";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   DataTable,
//   TableAction,
//   TableColumn,
// } from "@/components/ui/data-table";
// import { useProfileContext } from "@/context/ProfileContext";
// import { useDataTable } from "@/hooks/useDataTable";
// import {
//   Download,
//   Edit,
//   Eye,
//   Plus,
//   RefreshCw,
//   Trash2,
//   UserPlus,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import React, { useMemo } from "react";
// import { toast } from "sonner";
// import { useDTEStore } from "../dte/store";
// import { Debtors } from "./types";

// interface DebtorsListProps {
//   // Props opcionales para personalizar el comportamiento
//   selectable?: boolean;
//   onSelectionChange?: (selectedItems: Debtors[]) => void;
//   actionMode?: "full" | "view" | "minimal";
//   title?: string;
//   showExport?: boolean;
//   showCreate?: boolean;
// }

// const DebtorsListExample: React.FC<DebtorsListProps> = ({
//   selectable = false,
//   onSelectionChange,
//   actionMode = "full",
//   title = "Lista de Deudores",
//   showExport = true,
//   showCreate = true,
// }) => {
//   const router = useRouter();
//   const { session, profile } = useProfileContext();
//   const { bulkDTE } = useDTEStore();

//   // Usar el hook personalizado para manejo de datos
//   const {
//     data: debtors,
//     loading,
//     error,
//     fetchData,
//     deleteItem,
//     refreshData,
//   } = useDataTable<Debtors>({
//     fetchFn: async (token: string, clientId: string) => {
//       const response = await getDebtors(token, clientId);
//       return response.data || response.debtors || response || [];
//     },
//     deleteFn: deleteDebtor,
//   });

//   // Cargar datos iniciales
//   React.useEffect(() => {
//     if (session?.token && profile?.client?.id) {
//       fetchData(session.token, profile.client.id);
//     }
//   }, [session?.token, profile?.client?.id, fetchData]);

//   // Configuración de columnas con renderizado personalizado
//   const columns: TableColumn<Debtors>[] = useMemo(
//     () => [
//       {
//         key: "dni.dni",
//         header: "DNI",
//         width: "120px",
//         accessor: (debtor) => (
//           <div className="font-mono text-sm">
//             {debtor.dni?.dni || (
//               <Badge variant="outline" className="text-xs">
//                 Sin DNI
//               </Badge>
//             )}
//           </div>
//         ),
//       },
//       {
//         key: "name",
//         header: "Nombre Completo",
//         accessor: (debtor) => (
//           <div>
//             <div className="font-medium">{debtor.name || "Sin nombre"}</div>
//             {debtor.executive && (
//               <div className="text-xs text-muted-foreground">
//                 Ejecutivo: {debtor.executive.first_name}{" "}
//                 {debtor.executive.last_name}
//               </div>
//             )}
//           </div>
//         ),
//       },
//       {
//         key: "email",
//         header: "Contacto",
//         accessor: (debtor) => (
//           <div className="space-y-1">
//             <div className="text-sm">{debtor.email || "Sin email"}</div>
//             {debtor.phone && (
//               <div className="text-xs text-muted-foreground">
//                 {debtor.phone}
//               </div>
//             )}
//           </div>
//         ),
//       },
//       {
//         key: "channel",
//         header: "Canal",
//         width: "100px",
//         accessor: (debtor) => (
//           <Badge
//             variant={debtor.channel === "online" ? "default" : "secondary"}
//             className="text-xs"
//           >
//             {debtor.channel || "N/A"}
//           </Badge>
//         ),
//       },
//       {
//         key: "created_at",
//         header: "Fecha Creación",
//         width: "120px",
//         accessor: (debtor) => (
//           <div className="text-xs text-muted-foreground">
//             {debtor.created_at
//               ? new Date(debtor.created_at).toLocaleDateString("es-ES")
//               : "N/A"}
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   // Configuración de acciones según el modo
//   const actions: TableAction<Debtors>[] = useMemo(() => {
//     const baseActions: TableAction<Debtors>[] = [
//       {
//         key: "view",
//         label: "Ver detalles",
//         icon: <Eye className="h-4 w-4" />,
//         onClick: (debtor) => {
//           router.push(`/dashboard/debtors/${debtor.id}`);
//         },
//         className: "hover:bg-blue-500 hover:text-white text-primary",
//       },
//     ];

//     if (actionMode === "full") {
//       baseActions.push(
//         {
//           key: "assign",
//           label: "Asignar usuario",
//           icon: <UserPlus className="h-4 w-4" />,
//           onClick: (debtor) => {
//             toast.info(`Funcionalidad de asignar usuario para ${debtor.name}`);
//           },
//           className: "hover:bg-green-500 hover:text-white text-primary",
//         },
//         {
//           key: "edit",
//           label: "Editar",
//           icon: <Edit className="h-4 w-4" />,
//           onClick: (debtor) => {
//             router.push(`/dashboard/debtors/create?id=${debtor.id}`);
//           },
//           className: "hover:bg-amber-500 hover:text-white text-primary",
//         }
//       );
//     }

//     if (actionMode !== "minimal") {
//       baseActions.push({
//         key: "delete",
//         label: "Eliminar",
//         icon: <Trash2 className="h-4 w-4" />,
//         onClick: () => {}, // Manejado por el componente personalizado
//         component: (debtor) => (
//           <DialogConfirm
//             title="¿Eliminar deudor?"
//             description={
//               <div className="space-y-2">
//                 <p>¿Estás seguro que deseas eliminar el siguiente deudor?</p>
//                 <div className="bg-gray-50 p-3 rounded border">
//                   <p>
//                     <strong>Nombre:</strong> {debtor.name}
//                   </p>
//                   <p>
//                     <strong>DNI:</strong> {debtor.dni?.dni || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Email:</strong> {debtor.email}
//                   </p>
//                 </div>
//                 <p className="text-red-600 font-medium">
//                   Esta acción no se puede deshacer.
//                 </p>
//               </div>
//             }
//             triggerButton={
//               <button
//                 title="Eliminar"
//                 className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-500 hover:text-white text-primary hover:bg-accent hover:text-accent-foreground h-10 w-10"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </button>
//             }
//             cancelButtonText="Cancelar"
//             confirmButtonText="Sí, eliminar"
//             onConfirm={() => handleDelete(debtor)}
//             type="danger"
//           />
//         ),
//       });
//     }

//     return baseActions;
//   }, [actionMode, router]);

//   // Manejadores de eventos
//   const handleDelete = async (debtor: Debtors) => {
//     if (!session?.token || !profile?.client?.id) {
//       toast.error("Error de autenticación");
//       return;
//     }

//     try {
//       await deleteItem(session.token, profile.client.id, debtor.id);
//       toast.success(`Deudor "${debtor.name}" eliminado correctamente`);
//     } catch (error) {
//       toast.error("Error al eliminar el deudor");
//       console.error("Error al eliminar deudor:", error);
//     }
//   };

//   const handleExport = () => {
//     // Lógica para exportar datos
//     const csvData = debtors.map((debtor) => ({
//       DNI: debtor.dni?.dni || "",
//       Nombre: debtor.name || "",
//       Email: debtor.email || "",
//       Teléfono: debtor.phone || "",
//       Canal: debtor.channel || "",
//       FechaCreación: debtor.created_at || "",
//     }));

//     const csvContent = [
//       Object.keys(csvData[0] || {}).join(","),
//       ...csvData.map((row) => Object.values(row).join(",")),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `deudores_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     toast.success("Datos exportados correctamente");
//   };

//   const handleCreate = () => {
//     router.push("/dashboard/debtors/create");
//   };

//   // Acciones del header personalizadas
//   const headerActions = (
//     <div className="flex items-center gap-2">
//       <Button
//         variant="outline"
//         size="sm"
//         onClick={refreshData}
//         disabled={loading}
//         className="flex items-center gap-2"
//       >
//         <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//         Actualizar
//       </Button>

//       {showExport && (
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={handleExport}
//           disabled={debtors.length === 0}
//           className="flex items-center gap-2"
//         >
//           <Download className="h-4 w-4" />
//           Exportar
//         </Button>
//       )}

//       {showCreate && (
//         <Button
//           size="sm"
//           onClick={handleCreate}
//           className="flex items-center gap-2"
//         >
//           <Plus className="h-4 w-4" />
//           Nuevo Deudor
//         </Button>
//       )}
//     </div>
//   );

//   return (
//     <DataTable<Debtors>
//       data={debtors}
//       loading={loading}
//       error={error}
//       columns={columns}
//       actions={actions}
//       title={title}
//       searchable={true}
//       searchPlaceholder="Buscar por DNI, nombre, email..."
//       searchKeys={["name", "email", "dni.dni", "phone"]}
//       pagination={true}
//       initialItemsPerPage={10}
//       itemsPerPageOptions={[5, 10, 20, 50, 100]}
//       onRefresh={refreshData}
//       headerActions={headerActions}
//       emptyMessage="No hay deudores registrados"
//       noResultsMessage="No se encontraron deudores que coincidan con los criterios de búsqueda"
//       className="bg-white rounded-lg shadow-sm"
//     />
//   );
// };

// export default DebtorsListExample;
