"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import Language from "@/components/ui/language";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { getFintoc } from "@fintoc/fintoc-js";
import { Edit, FileText, Link, Loader2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import BulletMenu, { BulletMenuItem } from "../components/bullet-menu";
import DialogConfirm from "../components/dialog-confirm";
import Header from "../components/header";
import LoaderTable from "../components/loader-table";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import Search from "../users/components/search";
import BankDialog from "./components/bank-dialog";
import {
  createFintocLinkIntent,
  exchangeDataFintoc,
} from "./services/fintoc.service";
import { BankInformation } from "./services/types";
import { useBankInformationStore } from "./store";

const BanksContent = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<BankInformation | null>(
    null
  );
  const [selectDeleteBank, setSelectDeleteBank] =
    useState<BankInformation | null>(null);
  const [isFintocProccessOpen, setIsFintocProccessOpen] =
    useState<boolean>(false);
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const {
    getAllBanksInformations,
    banksInformations,
    isLoading,
    deleteBankInformation,
    setIsLoading,
  } = useBankInformationStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      getAllBanksInformations(session.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

  const openFintocModal = async () => {
    try {
      setIsFintocProccessOpen(true);
      const linkIntent = await createFintocLinkIntent(
        session?.token,
        profile?.client?.id
      );

      const Fintoc = await getFintoc();
      const options = {
        widgetToken: linkIntent.widget_token,
        publicKey: process.env.NEXT_PUBLIC_FINTOC_PUBLIC_KEY,
        onSuccess: async (data: any) => {
          setIsLoading(true);
          const response = await exchangeDataFintoc(
            session?.token,
            profile?.client?.id,
            data.exchangeToken
          );
          if (response.code === "SUCCESSFULLY_CONNECTED") {
            toast.success("Has conectado tu banco correctamente");
            getAllBanksInformations(session?.token, profile?.client?.id);
            setIsLoading(false);
          }
          setIsFintocProccessOpen(false);
        },

        onExit: () => {
          setIsFintocProccessOpen(false);
          toast.error("Has cancelado la conexión para conectar tu banco");
        },
      };

      const widget = Fintoc?.create(options);
      if (!widget) {
        toast.error("❌ Error creando el widget de Fintoc");
        return;
      }
      widget?.open();
    } catch (error) {
      console.error("Error al abrir el widget de Fintoc:", error);
      toast.error("Error al abrir el widget de Fintoc", {
        description: "Por favor, intenta nuevamente.",
      });
      setIsFintocProccessOpen(false);
    }
  };

  const handleOpenEditDialog = (bank: BankInformation) => {
    setSelectedBank(bank);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedBank(null);
  };

  const handleOpenDeleteDialog = (bank: BankInformation) => {
    setSelectDeleteBank(bank);
    setIsDeleteDialogOpen(true);
  };

  const createMenuItems = (bank: BankInformation): BulletMenuItem[] => {
    const items: BulletMenuItem[] = [
      {
        id: "edit",
        label: "Editar cuenta",
        icon: Edit,
        component: (
          <DropdownMenuItem
            key={bank.id}
            onClick={() => {
              handleOpenEditDialog(bank);
            }}
            disabled={false}
            className={cn(
              "flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
              "text-primary focus:text-primary focus:bg-primary/10 dark:focus:bg-primary/20"
            )}
          >
            <Edit className="h-4 w-4 text-primary shrink-0" />
            <span className="whitespace-nowrap">Editar cuenta</span>
          </DropdownMenuItem>
        ),
      },
      {
        id: "delete",
        label: "Eliminar",
        component: (
          <DropdownMenuItem
            key={bank.id}
            onClick={() => {
              handleOpenDeleteDialog(bank);
            }}
            disabled={false}
            className={cn(
              "flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
              "text-primary focus:text-primary focus:bg-primary/10 dark:focus:bg-primary/20"
            )}
          >
            <Trash2 className="h-4 w-4 text-primary shrink-0" />
            <span className="whitespace-nowrap">Eliminar</span>
          </DropdownMenuItem>
          // <DialogConfirm
          //   title="¿Eliminar cuenta bancaria?"
          //   description={`¿Estás seguro que deseas eliminar la cuenta bancaria "${bank.bank} - ${bank.account_number}"? Esta acción no se puede deshacer.`}
          //   triggerButton={
          //     <DropdownMenuItem className="flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm text-destructive focus:text-destructive focus:bg-destructive/10">
          //       <Trash2 className="h-4 w-4 text-primary shrink-0" />
          //       <span className="whitespace-nowrap">Eliminar</span>
          //     </DropdownMenuItem>
          //   }
          //   cancelButtonText="Cancelar"
          //   confirmButtonText="Sí, eliminar"
          //   onConfirm={() => {
          //     if (session?.token && profile?.client?.id) {
          //       deleteBankInformation(
          //         session.token,
          //         bank.id || "",
          //         profile.client.id
          //       );
          //     }
          //   }}
          //   type="danger"
          // />
        ),
      },
    ];

    if (bank.bank_provider) {
      items.unshift({
        id: "linked",
        label: "Cuenta conectada",
        icon: Link,
        disabled: true,
        onClick: () => {},
      });
    }

    return items;
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Bancos y cuentas"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileText color="white" />}
          subDescription="Integraciones"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <Card className="h-full p-5">
              <div className="flex justify-between items-start gap-5">
                <div className="w-1/3">
                  <Image
                    src="/img/bank-image.svg"
                    alt="Roles"
                    width={100}
                    height={100}
                    className="w-full h-full"
                  />
                </div>
                <div className="w-3/3">
                  <div className="flex justify-between items-center">
                    <Search placeholder="Buscar" />
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-orange-500 text-white hover:bg-orange-400"
                        onClick={openFintocModal}
                        disabled={isFintocProccessOpen}
                      >
                        <div className="flex items-center gap-2">
                          {isFintocProccessOpen ? (
                            <>
                              <Loader2 className="animate-spin" /> Conectando...
                            </>
                          ) : (
                            <>
                              <Link /> Conecta tu banco
                            </>
                          )}
                        </div>
                      </Button>
                      <BankDialog
                        isBankDialogOpen={isCreateDialogOpen}
                        setIsBankDialogOpen={setIsCreateDialogOpen}
                        clientId={profile?.client?.id}
                        showButton={true}
                      />
                    </div>
                  </div>
                  <div className="mt-5 p-3 border border-gray-200 rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-primary">Bancos</TableHead>
                          <TableHead className="text-primary">
                            N° de cuenta
                          </TableHead>
                          <TableHead className="text-primary">
                            Cuenta contable
                          </TableHead>
                          <TableHead className="text-primary text-center">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <>
                            <LoaderTable cols={4} />
                          </>
                        ) : (
                          <>
                            {banksInformations.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                  No se encontraron cuentas bancarias
                                </TableCell>
                              </TableRow>
                            ) : (
                              banksInformations.map((bank) => {
                                return (
                                  <TableRow key={bank.id}>
                                    <TableCell>{bank.bank}</TableCell>
                                    <TableCell>{bank.account_number}</TableCell>
                                    <TableCell>{bank.ledger_account}</TableCell>
                                    <TableCell className="text-center">
                                      <BulletMenu
                                        items={createMenuItems(bank)}
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Main>
      <BankDialog
        isBankDialogOpen={isEditDialogOpen}
        setIsBankDialogOpen={setIsEditDialogOpen}
        clientId={profile?.client?.id || ""}
        defaultValues={selectedBank || undefined}
        showButton={false}
      />
      <DialogConfirm
        title="¿Eliminar cuenta bancaria?"
        description={`¿Estás seguro que deseas eliminar la cuenta bancaria "${selectDeleteBank?.bank} - ${selectDeleteBank?.account_number}"? Esta acción no se puede deshacer.`}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        cancelButtonText="Cancelar"
        confirmButtonText="Sí, eliminar"
        onConfirm={() => {
          if (session?.token && profile?.client?.id) {
            deleteBankInformation(
              session.token,
              selectDeleteBank?.id || "",
              profile.client.id
            );
          }
        }}
        type="danger"
      />
    </>
  );
};

const BanksPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <BanksContent />
    </Suspense>
  );
};

export default BanksPage;
