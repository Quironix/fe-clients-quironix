import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import { useDebtorsStore } from "../../debtors/store";
import { getAllDebtors } from "../services";
import { usePaymentProjectionStore } from "../store";
import CardDebtorPP from "./card-debtor-pp";

const DebtorsList = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { searchDebtorCode, setSearchDebtorCode, setDebtorId } =
    usePaymentProjectionStore();
  const { debtors: allDebtors } = useDebtorsStore();
  const [resetTrigger, setResetTrigger] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["debtors", searchDebtorCode],
    queryFn: () =>
      getAllDebtors(
        session?.token,
        profile?.client_id,
        searchDebtorCode || undefined
      ),
    enabled: !!session?.token && !!profile?.client_id,
  });

  const form = useForm();
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
    watch,
  } = form;

  // Observar cambios en el campo debtorId
  const selectedDebtorId = watch("debtorId");

  // Efecto para actualizar el filtro cuando se selecciona un deudor
  useEffect(() => {
    if (selectedDebtorId) {
      // Buscar el deudor seleccionado para obtener su debtor_code
      const selectedDebtor = allDebtors.find(
        (debtor) => debtor.id === selectedDebtorId
      );
      if (selectedDebtor?.debtor_code) {
        setSearchDebtorCode(selectedDebtor.debtor_code);
      }
    } else {
      // Si no hay deudor seleccionado, limpiar el filtro
      setSearchDebtorCode(null);
    }
  }, [selectedDebtorId, allDebtors, setSearchDebtorCode]);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const clearFilter = () => {
    reset({ debtorId: "" });
    setSearchDebtorCode(null);
    setDebtorId(null); // Limpiar también el debtorId del store
    // Activar el trigger para resetear el DebtorsSelectFormItem
    setResetTrigger(true);
    // Resetear el trigger después de un breve momento
    setTimeout(() => setResetTrigger(false), 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Deudores</h2>
            {/* <Badge
              variant="outline"
              className="bg-red-400 text-white rounded-full"
            >
              2 críticos
            </Badge> */}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="flex gap-2 items-center justify-between">
              <div className="flex-1">
                <FormField
                  control={control}
                  name="debtorId"
                  render={({ field }) => (
                    <DebtorsSelectFormItem
                      field={field}
                      resetTrigger={resetTrigger}
                    />
                  )}
                />
              </div>
              {searchDebtorCode && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={clearFilter}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
        <div className="w-full mt-5 h-[450px]">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-start justify-start gap-5">
                  <Skeleton className="w-full h-[150px] rounded-md" />
                  <Skeleton className="w-full h-[150px] rounded-md" />
                  <Skeleton className="w-full h-[150px] rounded-md" />
                  <Skeleton className="w-full h-[150px] rounded-md" />
                </div>
              ) : (
                data?.data?.data?.map((d) => (
                  <CardDebtorPP key={d.id} debtor={d} />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtorsList;
