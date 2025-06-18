"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { getFintoc } from "@fintoc/fintoc-js";
import { FileText, Link, Loader2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useBankInformationStore } from "./store";

const BanksContent = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
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

        onExit: () =>
          toast.error("Has cancelado la conexión para conectar tu banco"),
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
                          <TableHead className="text-primary text-right">
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
                              banksInformations.map((bank) => (
                                <TableRow key={bank.id}>
                                  <TableCell>{bank.bank}</TableCell>
                                  <TableCell>{bank.account_number}</TableCell>
                                  <TableCell>{bank.ledger_account}</TableCell>
                                  <TableCell className="flex justify-end gap-2">
                                    {bank.bank_provider ? (
                                      <Button
                                        disabled
                                        className="hover:bg-orange-500 hover:text-white text-primary"
                                        variant="ghost"
                                      >
                                        <Link />
                                      </Button>
                                    ) : (
                                      <BankDialog
                                        isBankDialogOpen={isEditDialogOpen}
                                        setIsBankDialogOpen={
                                          setIsEditDialogOpen
                                        }
                                        clientId={profile?.client?.id}
                                        defaultValues={bank}
                                      />
                                    )}

                                    <DialogConfirm
                                      title="¿Estas seguro que deseas eliminar esta cuenta de banco?"
                                      description="Esta acción no se puede deshacer."
                                      triggerButton={
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="hover:bg-red-500 hover:text-white text-primary"
                                        >
                                          <Trash2 />
                                        </Button>
                                      }
                                      onConfirm={() =>
                                        deleteBankInformation(
                                          session?.token,
                                          bank.id || "",
                                          profile?.client?.id
                                        )
                                      }
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
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
