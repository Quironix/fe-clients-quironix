import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Landmark, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { BankInformation } from "../services/types";
import { useBankInformationStore } from "../store";
import BankForm from "./bank-form";

interface BankDialogProps {
  isBankDialogOpen: boolean;
  setIsBankDialogOpen: (open: boolean) => void;
  clientId: string;
  defaultValues?: BankInformation;
}
const bankFormSchema = z.object({
  bank: z.string().min(1, "Debe seleccionar un banco"),
  account_number: z
    .string()
    .min(1, "Campo requerido")
    .max(50, "Máximo 50 caracteres"),
  ledger_account: z.string().optional(),
});

export type BankFormValues = z.infer<typeof bankFormSchema>;

const BankDialog = ({
  isBankDialogOpen,
  setIsBankDialogOpen,
  clientId,
  defaultValues,
}: BankDialogProps) => {
  const { data: session }: any = useSession();
  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: {
      bank: defaultValues?.bank || "",
      account_number: defaultValues?.account_number || "",
      ledger_account: defaultValues?.ledger_account || "",
    },
  });
  const {
    createBankInformation,
    isCreateDialogLoading,
    updateBankInformation,
  } = useBankInformationStore();

  const handleSubmit = async (data: BankFormValues) => {
    if (data.ledger_account === "") {
      delete data.ledger_account;
    }

    if (defaultValues) {
      await updateBankInformation(
        session?.token,
        defaultValues.id,
        data,
        clientId
      );
    } else {
      await createBankInformation(session?.token, data, clientId);
    }
    setIsBankDialogOpen(false);
  };
  return (
    <AlertDialog
      open={isBankDialogOpen}
      onOpenChange={(open) => {
        form.reset();
        setIsBankDialogOpen(open);
      }}
    >
      <AlertDialogTrigger asChild>
        {defaultValues ? (
          <Button
            className="hover:bg-orange-500 hover:text-white text-primary"
            variant="ghost"
          >
            <Edit />
          </Button>
        ) : (
          <Button className="bg-orange-500 text-white hover:bg-orange-400">
            <div className="flex items-center gap-2">
              <Landmark /> Agregar cuenta bancaria
            </div>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90%] min-w-[50%] gap-0">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="absolute right-4 top-4">
              <AlertDialogCancel className="p-0 m-0 h-auto w-auto border-none hover:bg-transparent">
                <X className="h-6 w-6 text-gray-500" />
              </AlertDialogCancel>
            </div>

            <div className="flex flex-col justify-center  py-10">
              <AlertDialogHeader className="flex">
                <AlertDialogTitle className="font-extrabold">
                  {defaultValues ? "Editar" : "Agregar"} cuenta bancaria
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Completa los campos obligatorios.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>

            <BankForm form={form} isLoading={isCreateDialogLoading} />

            <AlertDialogFooter className="flex gap-3 mt-6 border-t border-orange-500 pt-4">
              <div className="w-full flex justify-center items-center">
                <Button
                  className="bg-[#1249C7] hover:bg-[#1249C7]/90 w-[50%] h-10 rounded-sm"
                  disabled={isCreateDialogLoading}
                >
                  {isCreateDialogLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </div>
            </AlertDialogFooter>
          </form>
        </FormProvider>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BankDialog;
