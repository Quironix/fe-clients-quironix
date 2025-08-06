"use client";

import { NORMALIZATION_REASONS } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Building,
  Calendar,
  DollarSign,
  Loader2,
  SquareUserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { normalization } from "../../services";
import { LitigationItem } from "../../types";

const litigationEditSchema = z.object({
  normalization_reason: z.string(),
  normalization_by_contact: z.string(),
  comment: z.string(),
  is_important_comment: z.boolean(),
});

type LitigationEditForm = z.infer<typeof litigationEditSchema>;

type LitigationEditModalProps = {
  litigation: LitigationItem;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  onRefetch?: () => void;
};

const NormalizationFormId = ({
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
      normalization_reason: "",
      normalization_by_contact: "",
      comment: "",
      is_important_comment: false,
    },
  });

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

      const response = await normalization(
        accessToken,
        clientId,
        litigationId,
        {
          normalization_reason: data.normalization_reason,
          normalization_by_contact: data.normalization_by_contact,
          comment: data.comment,
          is_important_comment: data.is_important_comment,
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
            <div className="flex items-center">
              <div className="">
                <span className="text-sm text-gray-600">Monto litigio</span>
                <p className="text-[#2F6EFF] font-bold text-2xl">
                  $
                  {new Intl.NumberFormat("es-CL").format(
                    Number(litigation?.litigation_amount) || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm text-gray-800 mt-6">
            <div className="flex items-center gap-2">
              <SquareUserRound className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm">RUT</p>
                <p> {litigation?.debtor.dni.dni ?? "123123-1"} </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm">Razón social</p>
                <p>{litigation?.debtor.name ?? "Sin Razón Social"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm">Fecha</p>
                <p className="font-semibold">
                  {format(litigation?.created_at, "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>
            <div className="col-span-2 font-bold -mb-3">Litigios</div>
            <FormField
              control={control}
              name="normalization_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo litigio</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
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
                      {NORMALIZATION_REASONS.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="normalization_by_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="truncate w-full">
                        <SelectValue
                          placeholder="Selecciona contacto"
                          className="truncate"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {litigation.debtor.contacts.map((item) => (
                        <SelectItem key={item.name} value={item.name}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentario</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingresa un comentario"
                    {...field}
                    className="h-24"
                  />
                </FormControl>
              </FormItem>
            )}
          />

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
                "Normalizar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default NormalizationFormId;
