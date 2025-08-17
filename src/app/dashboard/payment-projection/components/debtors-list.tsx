import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import { getAllDebtors } from "../services";
import CardDebtorPP from "./card-debtor-pp";

const DebtorsList = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();

  const { data, isLoading } = useQuery({
    queryKey: ["debtors"],
    queryFn: () => getAllDebtors(session?.token, profile?.client_id),
    enabled: !!session?.token && !!profile?.client_id,
  });
  const form = useForm();
  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
  } = form;
  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Deudores</h2>
            <Badge
              variant="outline"
              className="bg-red-400 text-white rounded-full"
            >
              2 críticos
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <FormField
              control={control}
              name="debtorId"
              render={({ field }) => (
                <DebtorsSelectFormItem field={field} required />
              )}
            />
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
