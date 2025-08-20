"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Control, useFieldArray, UseFormReturn } from "react-hook-form";
import DteSelectFormItem from "../../components/dte-select-form-item";
import { disputes, INVOICE_TYPES } from "../../data";
import { getDTEsByDebtor } from "../../transactions/dte/services";
import { DTE } from "../../transactions/dte/types";

interface AccordionInvoiceDisputeFormProps {
  form: UseFormReturn<any>;
  control: Control<any>;
  debtorId?: string;
  session?: any;
  profile?: any;
}

const AccordionInvoiceDisputeForm = ({
  form,
  control,
  debtorId,
  session,
  profile,
}: AccordionInvoiceDisputeFormProps) => {
  // State management
  const [activeAccordion, setActiveAccordion] = useState<string>("invoice-0");
  const [litigationAmountDisplays, setLitigationAmountDisplays] = useState<{
    [key: number]: string;
  }>({});
  const [litigationAmountLitigioDisplays, setLitigationAmountLitigioDisplays] = useState<{
    [key: number]: string;
  }>({});
  
  // DTE state management
  const [dtesByInvoice, setDtesByInvoice] = useState<{
    [invoiceIndex: number]: DTE[];
  }>({});
  
  // DTE caching by document type
  const [dteCache, setDteCache] = useState<{
    [documentType: string]: DTE[];
  }>({});

  // Field array management
  const { fields, append, remove } = useFieldArray({
    control,
    name: "invoices",
  });

  // Watch all document types for all invoices
  const watchedDocumentTypes = fields.map((_, index) => 
    form.watch(`invoices.${index}.documentType`)
  );

  // Fetch DTEs when document type changes for any invoice
  useEffect(() => {
    if (!debtorId || !session?.token || !profile?.client_id) return;

    fields.forEach((_, index) => {
      const documentType = watchedDocumentTypes[index];
      
      if (documentType) {
        // Check cache first
        if (dteCache[documentType]) {
          setDtesByInvoice(prev => ({
            ...prev,
            [index]: dteCache[documentType]
          }));
        } else {
          // Fetch from API and cache
          getDTEsByDebtor(session.token, profile.client_id, debtorId, {
            type: documentType,
            balance: "1",
          }).then((res) => {
            // Cache the result
            setDteCache(prev => ({
              ...prev,
              [documentType]: res
            }));
            
            // Set for this invoice
            setDtesByInvoice(prev => ({
              ...prev,
              [index]: res
            }));
          });
        }
      } else {
        // Clear DTEs for this invoice if no document type
        setDtesByInvoice(prev => ({
          ...prev,
          [index]: []
        }));
      }
    });
  }, [debtorId, session?.token, profile?.client_id, ...watchedDocumentTypes]);

  // Handlers
  const handleDteSelect = (dte: DTE | null, index: number) => {
    if (dte) {
      const amount = dte.amount;
      // Set both invoice number and amount from DTE
      form.setValue(`invoices.${index}.invoiceNumber`, dte.number);
      form.setValue(`invoices.${index}.invoiceAmount`, amount.toString());
      // Set formatted display value with proper formatting
      const formattedAmount = new Intl.NumberFormat("es-CL", {
        style: "decimal",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(amount);
      setLitigationAmountDisplays((prev) => ({
        ...prev,
        [index]: formattedAmount,
      }));
    } else {
      form.setValue(`invoices.${index}.invoiceNumber`, "");
      form.setValue(`invoices.${index}.invoiceAmount`, "");
      setLitigationAmountDisplays((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const addInvoice = () => {
    const newIndex = fields.length;
    append({
      documentType: "INVOICE",
      invoiceNumber: "",
      invoiceAmount: "",
      litigationAmount: "",
      reason: "",
      subreason: "",
    });
    
    // Initialize DTEs for the new invoice if we have cached data
    if (dteCache["INVOICE"]) {
      setDtesByInvoice(prev => ({
        ...prev,
        [newIndex]: dteCache["INVOICE"]
      }));
    } else if (debtorId && session?.token && profile?.client_id) {
      // Fetch DTEs for the new invoice
      getDTEsByDebtor(session.token, profile.client_id, debtorId, {
        type: "INVOICE",
        balance: "1",
      }).then((res) => {
        // Cache the result
        setDteCache(prev => ({
          ...prev,
          ["INVOICE"]: res
        }));
        
        // Set for the new invoice
        setDtesByInvoice(prev => ({
          ...prev,
          [newIndex]: res
        }));
      });
    }
    
    // Abrir el nuevo accordion
    setActiveAccordion(`invoice-${newIndex}`);
  };

  const removeInvoiceHandler = (index: number) => {
    remove(index);
    
    // Clean up DTE data for removed invoice
    setDtesByInvoice(prev => {
      const newState = { ...prev };
      delete newState[index];
      
      // Reindex remaining invoices
      const reindexed: { [key: number]: DTE[] } = {};
      Object.keys(newState).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newState[oldIndex];
        } else {
          reindexed[oldIndex] = newState[oldIndex];
        }
      });
      
      return reindexed;
    });
    
    // Clean up amount displays
    setLitigationAmountDisplays(prev => {
      const newState = { ...prev };
      delete newState[index];
      
      // Reindex remaining displays
      const reindexed: { [key: number]: string } = {};
      Object.keys(newState).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newState[oldIndex];
        } else {
          reindexed[oldIndex] = newState[oldIndex];
        }
      });
      
      return reindexed;
    });
    
    // Clean up litigation amount displays
    setLitigationAmountLitigioDisplays(prev => {
      const newState = { ...prev };
      delete newState[index];
      
      // Reindex remaining displays
      const reindexed: { [key: number]: string } = {};
      Object.keys(newState).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newState[oldIndex];
        } else {
          reindexed[oldIndex] = newState[oldIndex];
        }
      });
      
      return reindexed;
    });
    
    // Si se elimina el accordion activo, activar el primero
    if (activeAccordion === `invoice-${index}` && fields.length > 1) {
      setActiveAccordion("invoice-0");
    }
  };
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold">Factura</p>
        <Button
          type="button"
          onClick={addInvoice}
          variant="outline"
          size="sm"
          disabled={!debtorId}
          className="flex items-center gap-2 border-2 text-sm border-orange-500 hover:bg-orange-100 bg-white w-40 h-8 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <Plus className="w-4 h-4 text-orange-500" />
          Agregar factura
        </Button>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full space-y-3"
        value={activeAccordion}
        onValueChange={setActiveAccordion}
      >
        {fields.map((field, index) => (
          <AccordionItem
            key={field.id}
            value={`invoice-${index}`}
            className="border border-gray-200 rounded-md px-3 py-2 mb-1 relative"
          >
            <AccordionTrigger className="flex items-center justify-between w-full py-2 pr-12">
              <span>Factura {index + 1}</span>
            </AccordionTrigger>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeInvoiceHandler(index);
                }}
                className="absolute right-2 top-2 bg-red-500 text-white hover:bg-red-600 hover:text-white flex items-center justify-center h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <div className="grid grid-cols-3 gap-2 items-end mb-4">
                <div className="min-w-0">
                  <FormField
                    control={control}
                    name={`invoices.${index}.documentType`}
                    render={({ field }) => (
                      <FormItem className="w-full max-w-full">
                        <FormLabel className="py-1">
                          Tipo de factura <Required />
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="truncate w-full">
                              <SelectValue
                                placeholder="Selecciona"
                                className="truncate"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INVOICE_TYPES.find((t) => t.country === "CL")
                              ?.types.filter((t) => t.value)
                              .map((type) => (
                                <SelectItem
                                  key={type.value}
                                  value={type.value}
                                  className="truncate"
                                >
                                  {type.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`invoices.${index}.invoiceNumber`}
                  render={({ field }) => (
                    <DteSelectFormItem
                      field={field}
                      title="Número de factura"
                      required
                      dtes={dtesByInvoice[index] || []}
                      onDteSelect={(dte: DTE) => handleDteSelect(dte, index)}
                    />
                  )}
                />

                <FormField
                  control={form.control}
                  name={`invoices.${index}.invoiceAmount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto de factura</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Ej: 12345678"
                          value={litigationAmountDisplays[index] || ""}
                          onChange={(e) => {
                            // Remove non-numeric characters
                            const rawValue = e.target.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            const numericValue = parseInt(rawValue) || 0;

                            // Update form value
                            field.onChange(numericValue.toString());

                            // Update display value
                            setLitigationAmountDisplays((prev) => ({
                              ...prev,
                              [index]: e.target.value,
                            }));
                          }}
                          onBlur={() => {
                            // Format value on blur
                            const value = parseInt(field.value) || 0;
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
                              [index]: formattedAmount,
                            }));
                          }}
                          onFocus={() => {
                            // Show raw number on focus for easier editing
                            const value = parseInt(field.value) || 0;
                            setLitigationAmountDisplays((prev) => ({
                              ...prev,
                              [index]: value.toString(),
                            }));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-4">
                <FormField
                  control={form.control}
                  name={`invoices.${index}.litigationAmount`}
                  render={({ field }) => {
                    const invoiceAmount = parseInt(form.watch(`invoices.${index}.invoiceAmount`)) || 0;
                    const litigationAmount = parseInt(field.value) || 0;
                    const isExceeding = invoiceAmount > 0 && litigationAmount > invoiceAmount;
                    
                    return (
                      <FormItem>
                        <FormLabel>
                          Monto de litigio <Required />
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0.00"
                            value={litigationAmountLitigioDisplays[index] || field.value || ""}
                            onChange={(e) => {
                              // Remove non-numeric characters
                              const rawValue = e.target.value.replace(/[^0-9]/g, "");
                              const numericValue = parseInt(rawValue) || 0;

                              // Update form value
                              field.onChange(numericValue.toString());

                              // Update display value
                              setLitigationAmountLitigioDisplays((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }));
                            }}
                            onBlur={() => {
                              // Format value on blur
                              const value = parseInt(field.value) || 0;
                              const formattedAmount = new Intl.NumberFormat("es-CL", {
                                style: "decimal",
                                maximumFractionDigits: 0,
                                minimumFractionDigits: 0,
                              }).format(value);
                              setLitigationAmountLitigioDisplays((prev) => ({
                                ...prev,
                                [index]: formattedAmount,
                              }));
                            }}
                            onFocus={() => {
                              // Show raw number on focus for easier editing
                              const value = parseInt(field.value) || 0;
                              setLitigationAmountLitigioDisplays((prev) => ({
                                ...prev,
                                [index]: value.toString(),
                              }));
                            }}
                            className={isExceeding ? "border-red-500 focus:border-red-500" : ""}
                          />
                        </FormControl>
                        <FormMessage />
                        {isExceeding && (
                          <p className="text-sm text-red-500 mt-1">
                            El monto de litigio no puede ser mayor al monto de factura ({new Intl.NumberFormat("es-CL").format(invoiceAmount)})
                          </p>
                        )}
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField
                  control={control}
                  name={`invoices.${index}.reason`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Motivo litigio <Required />
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Resetear el submotivo cuando cambie el motivo
                          form.setValue(`invoices.${index}.subreason`, "");
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
                  name={`invoices.${index}.subreason`}
                  render={({ field }) => {
                    const selectedReason = form.watch(
                      `invoices.${index}.reason`
                    );
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
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500 mb-4">
            {!debtorId 
              ? "Selecciona un deudor para agregar facturas" 
              : "No hay facturas agregadas"
            }
          </p>
          <Button
            type="button"
            onClick={addInvoice}
            variant="outline"
            size="sm"
            disabled={!debtorId}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar primera factura
          </Button>
        </div>
      )}
    </>
  );
};

export default AccordionInvoiceDisputeForm;