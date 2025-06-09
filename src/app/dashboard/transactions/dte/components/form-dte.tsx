import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDTEStore } from "../store";

interface FormDTEProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const FormDTE = ({ open, onOpenChange, trigger }: FormDTEProps) => {
  const { dte } = useDTEStore();

  const formSchema = z.object({
    type: z.string().min(1, "El tipo es requerido"),
    number: z.string().min(1, "El número es requerido"),
    external_number: z.string().min(1, "El número externo es requerido"),
    amount: z.number().min(0, "El monto debe ser mayor a 0"),
    order_number: z.string().min(1, "El número de orden es requerido"),
    issue_date: z.string().min(1, "La fecha de emisión es requerida"),
    due_date: z.string().min(1, "La fecha de vencimiento es requerida"),
    operation_date: z.string().min(1, "La fecha de operación es requerida"),
    reception_date: z.string().min(1, "La fecha de recepción es requerida"),
    folio: z.boolean(),
    number_of_installments: z
      .string()
      .min(1, "El número de cuotas es requerido"),
    ref_1: z.string().optional(),
    ref_2: z.string().optional(),
    ref_3: z.string().optional(),
    ref_4: z.string().optional(),
    debtor_id: z.string().min(1, "El ID del deudor es requerido"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      number: "",
      external_number: "",
      amount: 0,
      order_number: "",
      issue_date: "",
      due_date: "",
      operation_date: "",
      reception_date: "",
      folio: false,
      number_of_installments: "",
      ref_1: "",
      ref_2: "",
      ref_3: "",
      ref_4: "",
      debtor_id: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Datos del formulario DTE:", values);
    // Cerrar el modal después de enviar
    onOpenChange?.(false);
    // Resetear el formulario
    form.reset();
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange?.(false);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Nuevo DTE
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo DTE</DialogTitle>
          <DialogDescription>
            Complete los campos requeridos para generar un nuevo Documento
            Tributario Electrónico.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1 */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="factura">Factura</SelectItem>
                          <SelectItem value="boleta">Boleta</SelectItem>
                          <SelectItem value="nota_credito">
                            Nota de Crédito
                          </SelectItem>
                          <SelectItem value="nota_debito">
                            Nota de Débito
                          </SelectItem>
                          <SelectItem value="guia_despacho">
                            Guía de Despacho
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="external_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Externo</FormLabel>
                      <FormControl>
                        <Input placeholder="EXT-000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Orden</FormLabel>
                      <FormControl>
                        <Input placeholder="ORD-000001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issue_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Emisión</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Columna 2 */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="operation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Operación</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reception_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Recepción</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="folio"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Folio</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number_of_installments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Cuotas</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="debtor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID del Deudor</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Referencias que ocupan todo el ancho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ref_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Referencia opcional 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ref_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Referencia opcional 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ref_3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia 3</FormLabel>
                    <FormControl>
                      <Input placeholder="Referencia opcional 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ref_4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia 4</FormLabel>
                    <FormControl>
                      <Input placeholder="Referencia opcional 4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="submit">Guardar DTE</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FormDTE;
