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
import { useTranslations } from "next-intl";
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
import FintocDateDialog from "./components/fintoc-date-dialog";
import {
  createFintocLinkIntent,
  exchangeDataFintoc,
} from "./services/fintoc.service";
import { BankInformation } from "./services/types";
import { useBankInformationStore } from "./store";

const BanksContent = () => {
  const t = useTranslations("banks");
  const tCommon = useTranslations("common.buttons");
  const tLoading = useTranslations("common.loading");
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
  const [isFintocDateDialogOpen, setIsFintocDateDialogOpen] =
    useState<boolean>(false);
  const [selectedSinceDate, setSelectedSinceDate] = useState<
    string | undefined
  >(undefined);
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

  const handleFintocDateConfirm = (date?: string) => {
    setSelectedSinceDate(date);
    setIsFintocDateDialogOpen(false);
    openFintocModal(date);
  };

  const openFintocModal = async (since?: string) => {
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
            data.exchangeToken,
            since
          );
          if (response.code === "SUCCESSFULLY_CONNECTED") {
            toast.success(t("toast.connectSuccess"));
            getAllBanksInformations(session?.token, profile?.client?.id);
            setIsLoading(false);
          }
          setIsFintocProccessOpen(false);
        },

        onExit: () => {
          setIsFintocProccessOpen(false);
          toast.error(t("toast.connectCancelled"));
        },
      };

      const widget = Fintoc?.create(options);
      if (!widget) {
        toast.error(t("toast.connectError"));
        return;
      }
      widget?.open();
    } catch (error) {
      console.error("Error al abrir el widget de Fintoc:", error);
      toast.error(t("toast.connectError"), {
        description: t("toast.connectErrorDescription"),
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
        label: t("editAccount"),
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
            <span className="whitespace-nowrap">{t("editAccount")}</span>
          </DropdownMenuItem>
        ),
      },
      {
        id: "delete",
        label: tCommon("delete"),
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
            <span className="whitespace-nowrap">{tCommon("delete")}</span>
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
        label: t("linkedAccount"),
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
          title={t("title")}
          description={t("description")}
          icon={<FileText color="white" />}
          subDescription={t("subDescription")}
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
                    <Search placeholder={t("searchPlaceholder")} />
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-orange-500 text-white hover:bg-orange-400"
                        onClick={() => setIsFintocDateDialogOpen(true)}
                        disabled={isFintocProccessOpen}
                      >
                        <div className="flex items-center gap-2">
                          {isFintocProccessOpen ? (
                            <>
                              <Loader2 className="animate-spin" /> {tLoading("connecting")}
                            </>
                          ) : (
                            <>
                              <Link /> {t("connectBank")}
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
                          <TableHead className="text-primary">{t("tableHeaders.banks")}</TableHead>
                          <TableHead className="text-primary">
                            {t("tableHeaders.accountNumber")}
                          </TableHead>
                          <TableHead className="text-primary">
                            {t("tableHeaders.ledgerAccount")}
                          </TableHead>
                          <TableHead className="text-primary text-center">
                            {t("tableHeaders.actions")}
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
                                  {t("emptyMessage")}
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
      <FintocDateDialog
        isOpen={isFintocDateDialogOpen}
        setIsOpen={setIsFintocDateDialogOpen}
        onConfirm={handleFintocDateConfirm}
        isLoading={isFintocProccessOpen}
      />
      <DialogConfirm
        title={t("deleteTitle")}
        description={t("deleteDescription", { bank: selectDeleteBank?.bank ?? "", account: selectDeleteBank?.account_number ?? "" })}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        cancelButtonText={tCommon("cancel")}
        confirmButtonText={tCommon("yesDelete")}
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
    <Suspense fallback={<div></div>}>
      <BanksContent />
    </Suspense>
  );
};

export default BanksPage;
