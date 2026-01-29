import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import DebtorsSelectInline from "../../components/debtors-select-inline";
import { assignDebtor } from "../services";

const FormAssignDebtor = ({
  selectedMovements,
  handleClose,
}: {
  selectedMovements: any[];
  handleClose: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const router = useRouter();
  const formSchema = z.object({
    debtor_id: z.string().min(1, "El código deudor es requerido"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      debtor_id: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await assignDebtor({
        accessToken: session.token,
        clientId: profile.client_id,
        debtorId: data.debtor_id,
        movementIds: selectedMovements.map((movement) => movement.id),
      });
      if (response.success) {
        toast.success(response.message);
        form.reset();

        const movementIds = selectedMovements.map((movement) => movement.id).join(',');

        if (typeof window !== "undefined") {
          localStorage.removeItem("paymentNettingSelection");
        }

        handleClose();

        router.push(`/dashboard/payment-netting/generate-payment?debtorId=${data.debtor_id}&movements=${movementIds}`);
      } else {
        toast.error(response.message || "Error al asignar el deudor");
      }
    } catch (error) {
      console.error("Error al asignar el deudor:", error);
      toast.error("Error al asignar el deudor");
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = selectedMovements.reduce(
    (sum, movement) => sum + Number(movement.amount || 0),
    0
  );

  const sortedMovements = selectedMovements.sort((a, b) => {
    const statusOrder = {
      "Pago creado": 1,
      Pendiente: 2,
      Procesado: 3,
      Compensado: 4,
      Mantenido: 5,
      Rechazado: 6,
      Eliminado: 7,
      "Rechazado duplicado": 8,
      "Eliminado monto negativo": 9,
      "Eliminado sin tracking": 10,
    };

    const orderA = statusOrder[a.status as keyof typeof statusOrder] || 999;
    const orderB = statusOrder[b.status as keyof typeof statusOrder] || 999;

    return orderA - orderB;
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800">
              Movimientos seleccionados: {selectedMovements.length}
            </p>
            <p className="text-sm text-blue-600">
              Total: $ {new Intl.NumberFormat("es-ES").format(totalAmount)}
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estado</TableHead>
                  <TableHead>Importe</TableHead>
                  <TableHead>Banco</TableHead>
                  <TableHead>Nº de cuenta</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMovements.map((movement, index) => (
                  <TableRow key={movement.id || index}>
                    <TableCell className="font-medium">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          movement.status === "Pago creado"
                            ? "bg-green-100 text-green-800"
                            : movement.status === "Pendiente"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {movement.status}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${" "}
                      {new Intl.NumberFormat("es-ES").format(
                        Number(movement.amount || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {movement.bank_information?.bank || "N/A"}
                    </TableCell>
                    <TableCell>
                      {movement.bank_information?.account_number || "N/A"}
                    </TableCell>
                    <TableCell>
                      {movement.created_at
                        ? format(parseISO(movement.created_at), "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger className="cursor-pointer">
                          <Eye className="h-4 w-4 text-blue-700" />
                        </PopoverTrigger>
                        <PopoverContent className="text-xs max-w-[400px] max-h-[300px] overflow-y-auto">
                          {movement.description || "Sin descripción"}
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="debtor_id"
          render={({ field }) => (
            <DebtorsSelectInline field={field} title="Deudor" required />
          )}
        />
        <div className="flex items-center justify-center border-t border-orange-500 pt-4 w-full">
          <Button
            type="submit"
            className="bg-blue-500 text-white w-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                <span className="text-white">Guardando...</span>
              </>
            ) : (
              <span className="text-white">Guardar</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormAssignDebtor;
