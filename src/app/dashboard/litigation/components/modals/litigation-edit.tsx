"use client";

import { disputes } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
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
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Building,
  Calendar,
  DollarSign,
  Loader2,
  MessageSquare,
  SquareUserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { updateLitigation } from "../../services";
import { LitigationItem } from "../../types";

const litigationEditSchema = z.object({
  litigation_amount: z.coerce.number(),
  motivo: z.string(),
  submotivo: z.string(),
  contact: z.string(),
});

type LitigationEditForm = z.infer<typeof litigationEditSchema>;

type LitigationEditModalProps = {
  litigation: LitigationItem;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  onRefetch?: () => void;
};

const LitigationEditModal = ({
  litigation,
  onOpenChange,
  open,
  onRefetch,
}: LitigationEditModalProps) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LitigationEditForm>({
    resolver: zodResolver(litigationEditSchema),
    defaultValues: {
      litigation_amount: Number(litigation?.litigation_amount ?? 0),
      motivo: litigation?.motivo ?? "",
      submotivo: litigation?.submotivo ?? "",
      contact: litigation?.contact ?? "",
    },
  });
  useEffect(() => {
    if (litigation) {
      form.reset({
        litigation_amount: Number(litigation.litigation_amount ?? 0),
        motivo: litigation.motivo ?? "",
        submotivo: litigation.submotivo ?? "",
        contact: litigation.contact ?? "",
      });
    }
  }, [litigation, form]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const onSubmit = async (data: LitigationEditForm) => {
    setIsSubmitting(true);
    try {
      const accessToken = session?.token;
      const clientId = profile?.client_id;
      const litigationId = litigation?.id;

      if (!accessToken || !clientId || !litigationId) {
        throw new Error("Faltan datos necesarios para la actualización");
      }

      const response = await updateLitigation(
        accessToken,
        clientId,
        litigationId,
        {
          litigation_amount: data.litigation_amount,
          motivo: data.motivo,
          submotivo: data.submotivo,
          contact: data.contact,
        }
      );

      if (response.success) {
        toast.success(response.message);
        onOpenChange(false);
        reset();
        // Refrescar los datos
        if (onRefetch) {
          onRefetch();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar litigio");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-[#EDF2F7] px-4 py-3 rounded-md">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div className="">
                <span className="text-sm text-gray-600">Monto factura</span>
                <p className="text-[#2F6EFF] font-bold text-2xl">
                  $
                  {new Intl.NumberFormat("es-CL").format(
                    Number(litigation?.invoice.amount) || 0
                  )}
                </p>
              </div>
            </div>
            <FormField
              control={control}
              name="litigation_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto litigio</FormLabel>
                  <Input
                    type="number"
                    className="bg-white border-2"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm text-gray-800 mt-6">
            <div className="flex items-center gap-2">
              <SquareUserRound className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm">RUT</p>
                <p> {litigation?.debtor.dni_id ?? "123123-1"} </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm">Razón social</p>
                <p>{litigation?.debtor.name ?? "Sin Razón Social"}</p>
              </div>
            </div>

            <FormField
              control={control}
              name="motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo litigio</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Resetear el submotivo cuando cambie el motivo
                      form.setValue("submotivo", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="truncate w-full">
                        <SelectValue
                          placeholder="Selecciona motivo"
                          className="truncate"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {disputes.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="submotivo"
              render={({ field }) => {
                const selectedReason = form.watch("motivo");
                const selectedDispute = disputes.find(
                  (item) => item.code === selectedReason
                );

                return (
                  <FormItem>
                    <FormLabel>Submotivo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedReason}
                    >
                      <FormControl>
                        <SelectTrigger className="truncate w-full">
                          <SelectValue
                            placeholder="Selecciona submotivo"
                            className="truncate"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedDispute?.submotivo.map((sub) => (
                          <SelectItem key={sub.code} value={sub.code}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm">Fecha</p>
                <p className="font-semibold">
                  {format(litigation?.created_at, "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>

            <FormField
              control={control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-1 border-2 border-[#EDF2F7] rounded-md p-4 text-sm my-4">
            <MessageSquare className="w-6 h-6 text-gray-500" />
            <div className="flex flex-col gap-1">
              <span className="font-light text-sm">Comentario</span>
              <div className="flex flex-col gap-2">
                {litigation?.comments && litigation.comments.length > 0 ? (
                  litigation.comments.map((comment, idx) => (
                    <div key={idx} className=" text-gray-500">
                      <span className="block text-sm">- {comment.content}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Sin comentarios</span>
                )}
              </div>
            </div>
          </div>

          <div className=" bg-[#FF8113] h-0.5 max-w-full mt-5"></div>

          <div className="mt-2 flex justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default LitigationEditModal;
