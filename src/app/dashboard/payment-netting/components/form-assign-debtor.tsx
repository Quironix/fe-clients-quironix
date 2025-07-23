import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import { assignDebtor } from "../services";

const FormAssignDebtor = ({
  detailMovement,
  handleClose,
}: {
  detailMovement: any;
  handleClose: (value: boolean) => void;
}) => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const formSchema = z.object({
    debtor_id: z.string().min(1, "El código deudor es requerido"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await assignDebtor({
        accessToken: session.token,
        clientId: profile.client_id,
        debtorId: data.debtor_id,
        movementIds: [detailMovement.id],
      });
      if (response.success) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Error al asignar el deudor");
    } finally {
      handleClose(false);
      form.reset();
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="debtor_id"
          render={({ field }) => (
            <DebtorsSelectFormItem
              field={field}
              title="Código deudor"
              required
            />
          )}
        />
        <div className="flex items-center justify-center border-t border-orange-500 pt-4 w-full">
          <Button type="submit" className="bg-blue-500 text-white w-sm">
            Guardar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormAssignDebtor;
