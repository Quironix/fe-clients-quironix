"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import DebtorContactSelectFormItem from "../../../components/debtor-contact-select-form-item";
import { disputes } from "../../../data";
import InvoiceCardLitigation from "./InvoiceCardLitigation";

interface SingleLitigation {
  id: string;
  selectedInvoiceIds: string[];
  litigationAmount: string;
  reason: string;
  subreason: string;
  comment: string;
}

const singleLitigationSchema = z.object({
  selectedInvoiceIds: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una factura"),
  litigationAmount: z.string().optional(),
  reason: z.string().min(1, "El motivo es requerido"),
  subreason: z.string().min(1, "El submotivo es requerido"),
  comment: z.string().optional(),
});

const litigationFormSchema = z.object({
  litigations: z
    .array(singleLitigationSchema)
    .min(1, "Debes crear al menos un litigio"),
  contact: z.string().min(1, "El contacto es requerido"),
});

type ManagementLitigationFormData = z.infer<typeof litigationFormSchema>;

interface ManagementLitigationFormProps {
  value?: any;
  onChange: (data: any) => void;
  debtorId: string;
  dataDebtor: any;
  session?: any;
  profile?: any;
  selectedInvoices?: Invoice[];
}

const ManagementLitigationForm = ({
  value,
  onChange,
  debtorId,
  dataDebtor,
  session,
  profile,
  selectedInvoices = [],
}: ManagementLitigationFormProps) => {
  const [litigations, setLitigations] = useState<SingleLitigation[]>(
    value?.litigations || [
      {
        id: `lit-${Date.now()}`,
        selectedInvoiceIds: [],
        litigationAmount: "",
        reason: "",
        subreason: "",
        comment: "",
      },
    ]
  );

  const [activeLitigation, setActiveLitigation] = useState<string>(
    litigations[0]?.id || ""
  );
  const [litigationAmountDisplays, setLitigationAmountDisplays] = useState<{
    [key: string]: string;
  }>({});

  const form = useForm<ManagementLitigationFormData>({
    resolver: zodResolver(litigationFormSchema),
    mode: "onChange",
    defaultValues: value || {
      litigations: litigations,
      contact: "",
    },
  });

  const getUsedInvoiceIds = (excludeLitigationId?: string): string[] => {
    return litigations
      .filter((lit) => lit.id !== excludeLitigationId)
      .flatMap((lit) => lit.selectedInvoiceIds);
  };

  const handleToggleInvoice = (litigationId: string, invoice: Invoice) => {
    setLitigations((prev) =>
      prev.map((lit) => {
        if (lit.id !== litigationId) return lit;

        const isSelected = lit.selectedInvoiceIds.includes(invoice.id);
        const newSelectedIds = isSelected
          ? lit.selectedInvoiceIds.filter((id) => id !== invoice.id)
          : [...lit.selectedInvoiceIds, invoice.id];

        return {
          ...lit,
          selectedInvoiceIds: newSelectedIds,
        };
      })
    );
  };

  const handleFieldChange = (
    litigationId: string,
    field: keyof Omit<SingleLitigation, "id">,
    value: any
  ) => {
    setLitigations((prev) =>
      prev.map((lit) => {
        if (lit.id !== litigationId) return lit;
        return { ...lit, [field]: value };
      })
    );
  };

  const handleAddLitigation = () => {
    const newLitigation: SingleLitigation = {
      id: `lit-${Date.now()}`,
      selectedInvoiceIds: [],
      litigationAmount: "",
      reason: "",
      subreason: "",
      comment: "",
    };
    setLitigations((prev) => [...prev, newLitigation]);
    setActiveLitigation(newLitigation.id);
  };

  const handleRemoveLitigation = (litigationId: string) => {
    if (litigations.length === 1) return;

    setLitigations((prev) => prev.filter((lit) => lit.id !== litigationId));

    if (activeLitigation === litigationId) {
      setActiveLitigation(litigations[0]?.id || "");
    }
  };

  const getTotalAmount = (litigation: SingleLitigation): number => {
    return selectedInvoices
      .filter((inv) => litigation.selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
  };

  useEffect(() => {
    form.setValue("litigations", litigations);
    onChange({
      litigations,
      contact: form.getValues("contact"),
    });
  }, [litigations]);

  useEffect(() => {
    const subscription = form.watch((formData) => {
      onChange({
        litigations,
        contact: formData.contact,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onChange, litigations]);

  return (
    <div className="space-y-4 border border-gray-200 rounded-md p-4 bg-white">
      <Form {...form}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Litigio</h3>
            <Button
              type="button"
              onClick={handleAddLitigation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white h-8 rounded-sm"
            >
              <Plus className="w-4 h-4 text-orange-500" />
              Agregar litigio
            </Button>
          </div>

          {/* Facturas en gestión - Información general */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Facturas en gestión</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {selectedInvoices.length} disponible
                {selectedInvoices.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Selecciona las facturas que deseas considerar para el plan de pago
            </p>
          </div>

          {/* Accordions de litigios */}
          <Accordion
            type="single"
            collapsible
            value={activeLitigation}
            onValueChange={setActiveLitigation}
            className="space-y-6"
          >
            {litigations.map((litigation, index) => {
              const usedInvoiceIds = getUsedInvoiceIds(litigation.id);
              const totalAmount = getTotalAmount(litigation);

              return (
                <AccordionItem
                  key={litigation.id}
                  value={litigation.id}
                  className="border border-gray-200 rounded-md px-3 py-2 relative mb-4"
                >
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="flex items-center justify-between w-full py-2 pr-12 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          Litigio {index + 1}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          {litigation.selectedInvoiceIds.length} seleccionada
                          {litigation.selectedInvoiceIds.length !== 1
                            ? "s"
                            : ""}
                        </span>
                      </div>
                    </AccordionTrigger>
                    {litigations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveLitigation(litigation.id);
                        }}
                        className="absolute right-2 top-2 bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <AccordionContent className="space-y-4 pt-4">
                    {/* Grid de facturas */}
                    {selectedInvoices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
                        {selectedInvoices.map((invoice) => {
                          const isUsedInOther = usedInvoiceIds.includes(
                            invoice.id
                          );
                          const isSelectedHere =
                            litigation.selectedInvoiceIds.includes(invoice.id);

                          return (
                            <InvoiceCardLitigation
                              key={invoice.id}
                              invoice={invoice}
                              isSelected={isSelectedHere}
                              isDisabled={isUsedInOther}
                              onToggleSelect={() =>
                                !isUsedInOther &&
                                handleToggleInvoice(litigation.id, invoice)
                              }
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-sm text-gray-500">
                          No hay facturas seleccionadas en el Paso 1
                        </p>
                      </div>
                    )}

                    {/* Montos */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Monto de facturas
                        </label>
                        <div className="flex items-center h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm">
                          ${new Intl.NumberFormat("es-CL").format(totalAmount)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Monto en litigio <Required />
                        </label>
                        <Input
                          type="text"
                          placeholder="0"
                          value={
                            litigationAmountDisplays[litigation.id] ||
                            litigation.litigationAmount ||
                            ""
                          }
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            const numericValue = parseInt(rawValue) || 0;

                            handleFieldChange(
                              litigation.id,
                              "litigationAmount",
                              numericValue.toString()
                            );
                            setLitigationAmountDisplays((prev) => ({
                              ...prev,
                              [litigation.id]: e.target.value,
                            }));
                          }}
                          onBlur={() => {
                            const value =
                              parseInt(litigation.litigationAmount || "0") || 0;
                            const formattedAmount = new Intl.NumberFormat(
                              "es-CL",
                              {
                                style: "decimal",
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                              }
                            ).format(value);
                            setLitigationAmountDisplays((prev) => ({
                              ...prev,
                              [litigation.id]: formattedAmount,
                            }));
                          }}
                          onFocus={() => {
                            const value =
                              parseInt(litigation.litigationAmount || "0") || 0;
                            setLitigationAmountDisplays((prev) => ({
                              ...prev,
                              [litigation.id]: value.toString(),
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Motivo y Submotivo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Motivo <Required />
                        </label>
                        <Select
                          value={litigation.reason}
                          onValueChange={(value) => {
                            handleFieldChange(litigation.id, "reason", value);
                            handleFieldChange(litigation.id, "subreason", "");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            {disputes.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Submotivo <Required />
                        </label>
                        <Select
                          value={litigation.subreason}
                          onValueChange={(value) =>
                            handleFieldChange(litigation.id, "subreason", value)
                          }
                          disabled={!litigation.reason}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona submotivo" />
                          </SelectTrigger>
                          <SelectContent>
                            {disputes
                              .find((item) => item.code === litigation.reason)
                              ?.submotivo.map((sub) => (
                                <SelectItem key={sub.code} value={sub.code}>
                                  {sub.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Comentario */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Comentario</label>
                      <Textarea
                        placeholder="Ingresa un comentario"
                        value={litigation.comment}
                        onChange={(e) =>
                          handleFieldChange(
                            litigation.id,
                            "comment",
                            e.target.value
                          )
                        }
                        className="h-24"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* Contacto - Campo global fuera de los accordions */}
          <div className="pt-4 border-t border-gray-200">
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <DebtorContactSelectFormItem
                  field={field}
                  selectedDebtor={dataDebtor}
                  isFetchingDebtor={false}
                />
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ManagementLitigationForm;
