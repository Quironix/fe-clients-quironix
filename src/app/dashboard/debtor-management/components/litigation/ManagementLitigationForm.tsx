"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { disputes } from "../../../data";
import InvoiceCardLitigation from "./InvoiceCardLitigation";

interface SingleLitigation {
  id: string;
  selectedInvoiceIds: string[];
  invoiceAmounts: { [invoiceId: string]: string }; // Monto por cada factura
  litigationAmount: string; // Total calculado (suma de invoiceAmounts)
  reason: string;
  subreason: string;
}

const singleLitigationSchema = z.object({
  selectedInvoiceIds: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una factura"),
  litigationAmount: z.string().optional(),
  reason: z.string().min(1, "El motivo es requerido"),
  subreason: z.string().min(1, "El submotivo es requerido"),
});

const litigationFormSchema = z.object({
  litigations: z
    .array(singleLitigationSchema)
    .min(1, "Debes crear al menos un litigio"),
});

type ManagementLitigationFormData = z.infer<typeof litigationFormSchema>;

interface ManagementLitigationFormProps {
  value?: any;
  onChange: (data: any) => void;
  selectedInvoices?: Invoice[];
}

const ManagementLitigationForm = ({
  value,
  onChange,
  selectedInvoices = [],
}: ManagementLitigationFormProps) => {
  const [litigations, setLitigations] = useState<SingleLitigation[]>(
    value?.litigations || [
      {
        id: `lit-${Date.now()}`,
        selectedInvoiceIds: [],
        invoiceAmounts: {},
        litigationAmount: "",
        reason: "",
        subreason: "",
      },
    ]
  );

  const [activeLitigation, setActiveLitigation] = useState<string>(
    litigations[0]?.id || ""
  );

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const form = useForm<ManagementLitigationFormData>({
    resolver: zodResolver(litigationFormSchema),
    mode: "onChange",
    defaultValues: value || {
      litigations: litigations,
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

        // Manejar montos por factura
        const newInvoiceAmounts = { ...lit.invoiceAmounts };
        if (isSelected) {
          // Si se deselecciona, eliminar el monto de esa factura
          delete newInvoiceAmounts[invoice.id];
        } else {
          // Si se selecciona, establecer el saldo de la factura como monto por defecto (sin decimales)
          const balanceAmount = Math.round(Number(invoice.balance) || 0);
          newInvoiceAmounts[invoice.id] = balanceAmount.toString();
        }

        // Calcular el nuevo monto total
        const totalAmount = Object.values(newInvoiceAmounts).reduce(
          (sum, amount) => sum + (parseFloat(amount) || 0),
          0
        );

        return {
          ...lit,
          selectedInvoiceIds: newSelectedIds,
          invoiceAmounts: newInvoiceAmounts,
          litigationAmount: totalAmount.toString(),
        };
      })
    );
  };

  const handleInvoiceAmountChange = (
    litigationId: string,
    invoiceId: string,
    amount: string
  ) => {
    setLitigations((prev) =>
      prev.map((lit) => {
        if (lit.id !== litigationId) return lit;

        const newInvoiceAmounts = {
          ...lit.invoiceAmounts,
          [invoiceId]: amount,
        };

        // Calcular el nuevo monto total
        const totalAmount = Object.values(newInvoiceAmounts).reduce(
          (sum, amountVal) => sum + (parseFloat(amountVal) || 0),
          0
        );

        return {
          ...lit,
          invoiceAmounts: newInvoiceAmounts,
          litigationAmount: totalAmount.toString(),
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
      invoiceAmounts: {},
      litigationAmount: "",
      reason: "",
      subreason: "",
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

  const getTotalInvoicesAmount = (litigation: SingleLitigation): number => {
    return selectedInvoices
      .filter((inv) => litigation.selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
  };

  const getLitigationLabels = (litigation: SingleLitigation) => {
    if (!litigation.reason || !litigation.subreason) {
      return null;
    }

    const reason = disputes.find((d) => d.code === litigation.reason);
    const reasonLabel = reason?.label || litigation.reason;
    const subreasonLabel =
      reason?.submotivo.find((s) => s.code === litigation.subreason)?.label ||
      litigation.subreason;

    return { reasonLabel, subreasonLabel };
  };

  useEffect(() => {
    const validateAndNotify = async () => {
      form.setValue("litigations", litigations, { shouldValidate: false });

      // Validar el formulario después de un pequeño delay
      setTimeout(async () => {
        const isValid = await form.trigger();

        onChangeRef.current({
          litigations,
          _isValid: isValid,
        });
      }, 100);
    };

    validateAndNotify();
  }, [litigations, form]);

  return (
    <div className="space-y-4">
      <Form {...form}>
        <div className="space-y-4">
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
              Selecciona las facturas que deseas considerar para el litigio
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
              const totalInvoicesAmount = getTotalInvoicesAmount(litigation);
              const litigationLabels = getLitigationLabels(litigation);

              return (
                <AccordionItem
                  key={litigation.id}
                  value={litigation.id}
                  className="border border-gray-200 rounded-md relative mb-4 px-3 py-2"
                >
                  <div className="flex items-center justify-between px-3 py-2">
                    <AccordionTrigger className="flex items-center w-full py-0 pr-2 hover:no-underline">
                      <div className="flex items-center gap-3 w-full">
                        <span className="font-semibold text-gray-700">
                          Litigio
                        </span>
                        {litigationLabels ? (
                          <span className="text-sm text-gray-600">
                            | {litigationLabels.reasonLabel} -{" "}
                            {litigationLabels.subreasonLabel}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            | Selecciona motivo y submotivo
                          </span>
                        )}
                        <div className="flex items-center gap-1 ml-auto text-gray-600">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">
                            {litigation.selectedInvoiceIds.length}
                          </span>
                        </div>
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
                        className="bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8 ml-2"
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
                              litigationAmount={
                                litigation.invoiceAmounts[invoice.id] || ""
                              }
                              onAmountChange={(amount) =>
                                handleInvoiceAmountChange(
                                  litigation.id,
                                  invoice.id,
                                  amount
                                )
                              }
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
                          $
                          {new Intl.NumberFormat("es-CL").format(
                            totalInvoicesAmount
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Monto total en litigio <Required />
                        </label>
                        <div className="flex items-center h-10 w-full rounded-md border border-input bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                          $
                          {new Intl.NumberFormat("es-CL").format(
                            parseFloat(litigation.litigationAmount) || 0
                          )}
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          Suma automática de los montos ingresados por factura
                        </p>
                      </div>
                    </div>

                    {/* Motivo y Submotivo */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 w-full">
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
                          <SelectTrigger className="w-full">
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
                          <SelectTrigger className="w-full">
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
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <div className="w-full flex justify-end">
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
        </div>
      </Form>
    </div>
  );
};

export default ManagementLitigationForm;
