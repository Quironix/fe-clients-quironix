"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { DollarSign, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import SelectClient from "../../components/select-client";
import { NORMALIZATION_REASONS } from "../../data";
import { bulkLitigatiions, getLitigationsByDebtor } from "../services";
import { useDisputeStore } from "../store/disputeStore";
import { useLitigationStore } from "../store/litigation-store";
import { LitigationItem } from "../types";
import EmptyLitigations from "./empty-litigations";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const litigationSchema = z.object({
  litigation_ids: z.array(z.string()).optional(),
  normalization_reason: z.string().optional(),
  normalization_by_contact: z.string().optional(),
  comment: z.string().optional(),
  debtorId: z.string().optional(),
  client_id: z.string().optional(),
});

type LitigationForm = z.infer<typeof litigationSchema>;

interface NormalizeFormProps {
  onSuccess?: () => void;
}

const NormalizeForm = ({ onSuccess }: NormalizeFormProps = {}) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { setField } = useDisputeStore();
  const { litigiosIngresados, addLitigio } = useLitigationStore();

  const [currentLitigation, setCurrentLitigation] = useState<LitigationItem[]>(
    []
  );
  const [selectedLitigationIds, setSelectedLitigationIds] = useState<string[]>(
    []
  );

  const form = useForm<LitigationForm>({
    resolver: zodResolver(litigationSchema),
    defaultValues: {
      litigation_ids: [],
      normalization_reason: "",
      normalization_by_contact: "",
      comment: "",
      client_id: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
  } = form;

  const debtor_id = form.watch("debtorId");

  // Función para manejar la selección de todos los checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = currentLitigation.map((litigation) =>
        litigation.id.toString()
      );
      setSelectedLitigationIds(allIds);
    } else {
      setSelectedLitigationIds([]);
    }
  };

  // Función para manejar la selección individual de checkboxes
  const handleSelectLitigation = (litigationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLitigationIds((prev) => [...prev, litigationId]);
    } else {
      setSelectedLitigationIds((prev) =>
        prev.filter((id) => id !== litigationId)
      );
    }
  };

  // Verificar si todos los litigios están seleccionados
  const areAllSelected =
    currentLitigation.length > 0 &&
    selectedLitigationIds.length === currentLitigation.length;

  // Verificar si algunos litigios están seleccionados (para estado indeterminado)
  const areSomeSelected =
    selectedLitigationIds.length > 0 &&
    selectedLitigationIds.length < currentLitigation.length;

  useEffect(() => {
    if (debtor_id) {
      // Limpiar selecciones previas cuando cambia el deudor
      setSelectedLitigationIds([]);

      const findLitigationDebtor = async () => {
        try {
          const response = await getLitigationsByDebtor(
            session?.token,
            profile?.client_id,
            debtor_id
          );

          setCurrentLitigation(response.data);
        } catch (err) {
          console.error("Error al obtener litigios:", err);
          setCurrentLitigation([]);
          toast.error("Error al obtener litigios");
        }
      };
      findLitigationDebtor();
    } else {
      // Limpiar todo cuando no hay deudor seleccionado
      setCurrentLitigation([]);
      setSelectedLitigationIds([]);
    }
  }, [debtor_id]);

  // Efecto para mostrar los cambios en las selecciones
  useEffect(() => {
    if (selectedLitigationIds.length > 0) {
      console.log(
        "Litigios seleccionados actualizados:",
        selectedLitigationIds
      );
    }
  }, [selectedLitigationIds]);

  const onSubmit = async (data: LitigationForm) => {
    try {
      const payload = {
        normalization_reason: data.normalization_reason,
        normalization_by_contact: data.normalization_by_contact,
        comment: data.comment,
        litigation_ids: selectedLitigationIds || [],
      };
      const response = await bulkLitigatiions(
        session?.token,
        profile?.client_id,
        payload
      );
      if (response.success) {
        toast.success(response.message);
        reset();
        setSelectedLitigationIds([]);
        // Cerrar el dialog si es exitoso
        onSuccess?.();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar litigio");
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Cliente y Deudor */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="client_id"
              render={({ field }) => (
                <SelectClient field={field} title="Cliente" singleClient />
              )}
            />

            <FormField
              control={control}
              name="debtorId"
              render={({ field }) => (
                <DebtorsSelectFormItem field={field} title="Deudor" />
              )}
            />
          </div>
          {/* Tabla de litigios */}
          {currentLitigation.length === 0 ? (
            <EmptyLitigations />
          ) : (
            <div className="border bg-gray-50 p-4 rounded mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold">Litigios ingresados</h3>
                {selectedLitigationIds.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {selectedLitigationIds.length} seleccionado
                    {selectedLitigationIds.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <table className="min-w-full border bg-white text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">
                      <input
                        type="checkbox"
                        checked={areAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = areSomeSelected;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th className="p-2 text-left">Número</th>
                    <th className="p-2 text-left">Documento</th>
                    <th className="p-2 text-left">Monto Factura</th>
                    <th className="p-2 text-left">Monto Litigio</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLitigation.map((l, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedLitigationIds.includes(
                            l.id.toString()
                          )}
                          onChange={(e) =>
                            handleSelectLitigation(
                              l.id.toString(),
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td className="p-2">{l?.invoice?.number}</td>
                      <td className="p-2">{l?.motivo}</td>
                      <td className="p-2">
                        $
                        {new Intl.NumberFormat("es-ES").format(
                          Number(l?.invoice?.amount)
                        )}
                      </td>
                      <td className="p-2">
                        $
                        {new Intl.NumberFormat("es-ES").format(
                          Number(l?.litigation_amount)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Motivo, submotivo, contacto */}
          <div className="grid grid-cols-2 gap-4">
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
              disabled={currentLitigation.length === 0}
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
                      {currentLitigation.length > 0 &&
                        currentLitigation[0].debtor.contacts.map((item) => (
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
          {/* Comentario */}
          <div>
            <label className="font-semibold">Comentario</label>
            <Textarea
              placeholder="Comentario"
              {...register("comment")}
              className="min-h-[40px]"
            />
          </div>
          <div className=" bg-[#FF8113] h-0.5 max-w-full"></div>
          {/* Botón */}
          <div className="grid grid-cols-3 gap-4 items-center justify-center">
            <div className="col-span-2 bg-[#F1F5F9] px-5 py-2 rounded w-full">
              <div className="flex items-center">
                <div className="items-center mr-2">
                  <DollarSign className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <span className="text-sm text-gray-500">Monto Factura</span>
                  <p className="text-[#2F6EFF] font-bold text-3xl">
                    $
                    {new Intl.NumberFormat("es-ES").format(
                      selectedLitigationIds.reduce(
                        (acc, curr) =>
                          acc +
                          Number(
                            currentLitigation.find(
                              (l) => l.id.toString() === curr
                            )?.invoice.amount
                          ),
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <Button
                type="submit"
                className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Guardando
                  </>
                ) : (
                  "Normalizar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default NormalizeForm;
