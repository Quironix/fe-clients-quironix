import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderTree, Plus, Trash2 } from "lucide-react";
import { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { TimePopover } from "../../components/time-popover";
import TitleStep from "../../settings/components/title-step";

const daysOfWeek = [
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "X", label: "X" },
  { value: "J", label: "J" },
  { value: "V", label: "V" },
  { value: "S", label: "S" },
  { value: "D", label: "D" },
];

const exclusionOptions = [
  { id: "cash_documents", label: "Documentos al contado" },
  { id: "protested_checks", label: "Cheques protestados" },
  { id: "promissory_notes", label: "Pagarés" },
  { id: "credit_notes", label: "Notas de crédito" },
];

interface SegmentationSectionProps {
  form: UseFormReturn<any>;
  fieldArray: UseFieldArrayReturn<any, "segmentations", "id">;
  activeSegment: string;
  setActiveSegment: (value: string) => void;
}

export function SegmentationSection({
  form,
  fieldArray,
  activeSegment,
  setActiveSegment,
}: SegmentationSectionProps) {
  const { fields, append, remove } = fieldArray;

  const addSegment = () => {
    const newIndex = fields.length;
    append({
      applicableSegment: "",
      minimumDaysOverdue: "",
      exclusions: [],
      frequency: "",
      schedule: "",
      sendingDays: [],
    });
    setActiveSegment(`segment-${newIndex}`);
  };

  const removeSegment = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      toast.success("Segmento eliminado");
    } else {
      toast.error("Debe haber al menos un segmento");
    }
  };

  return (
    <AccordionItem
      key="segmentation-logic"
      value="segmentation-logic"
      className="border border-gray-200 rounded-md px-4 py-2 mb-5"
    >
      <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
        <AccordionTrigger className="flex items-center justify-between h-full">
          <TitleStep
            title="Segmentación y lógica de envíos"
            icon={<FolderTree className="w-5 h-5" />}
          />
        </AccordionTrigger>
      </div>
      <AccordionContent className="space-y-4 px-1 py-4">
        {fields.map((field, index) => (
          <Accordion
            key={field.id}
            type="single"
            collapsible
            value={activeSegment}
            onValueChange={setActiveSegment}
            className="border border-gray-200 rounded-md"
          >
            <AccordionItem value={`segment-${index}`} className="border-none">
              <div className="flex items-center gap-2 px-4">
                <AccordionTrigger className="flex-1 py-4 hover:no-underline">
                  <span className="font-semibold">Segmento {index + 1}</span>
                </AccordionTrigger>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeSegment(index);
                    }}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                )}
              </div>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-5 w-full mb-5">
                  <FormField
                    control={form.control}
                    name={`segmentations.${index}.applicable_segment`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Segmento aplicable{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Completa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="SEGMENTATION_LOW">
                              Facturación baja
                            </SelectItem>
                            <SelectItem value="SEGMENTATION_MEDIUM">
                              Facturación media
                            </SelectItem>
                            <SelectItem value="SEGMENTATION_HIGH">
                              Facturación alta
                            </SelectItem>
                            <SelectItem value="DBT_LOW">DBT bajo</SelectItem>
                            <SelectItem value="DBT_MEDIUM">
                              DBT medio
                            </SelectItem>
                            <SelectItem value="DBT_HIGH">DBT alto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segmentations.${index}.min_delay_days`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Días de atraso mínimo{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">0 días</SelectItem>
                            <SelectItem value="15">15 días</SelectItem>
                            <SelectItem value="30">30 días</SelectItem>
                            <SelectItem value="60">60 días</SelectItem>
                            <SelectItem value="90">90 días</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segmentations.${index}.exclusions`}
                    render={() => (
                      <FormItem>
                        <FormLabel>Exclusiones</FormLabel>
                        <div className="space-y-2">
                          {exclusionOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name={`segmentations.${index}.exclusions`}
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-1 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          option.id
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                option.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value: string) =>
                                                    value !== option.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segmentations.${index}.frequency`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Frecuencia <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DAILY">Diaria</SelectItem>
                            <SelectItem value="SEVEN_DAYS">Semanal</SelectItem>
                            <SelectItem value="BIWEEKLY">Quincenal</SelectItem>
                            <SelectItem value="MONTHLY">Mensual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`segmentations.${index}.schedule.preferred_time`}
                    render={({ field }) => (
                      <TimePopover
                        field={field}
                        label="Horario"
                        placeholder="Selecciona"
                        required={true}
                        startHour={8}
                        endHour={22}
                        interval={30}
                      />
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`segmentations.${index}.schedule.preferred_days`}
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Días de envío <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        {daysOfWeek.map((day) => (
                          <FormField
                            key={day.value}
                            control={form.control}
                            name={`segmentations.${index}.schedule.preferred_days`}
                            render={({ field }) => {
                              return (
                                <FormItem key={day.value}>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant={
                                        field.value?.includes(day.value)
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      className="w-10 h-10 p-0"
                                      onClick={() => {
                                        const isSelected =
                                          field.value?.includes(day.value);
                                        if (isSelected) {
                                          field.onChange(
                                            field.value.filter(
                                              (v: string) => v !== day.value
                                            )
                                          );
                                        } else {
                                          field.onChange([
                                            ...(field.value || []),
                                            day.value,
                                          ]);
                                        }
                                      }}
                                    >
                                      {day.label}
                                    </Button>
                                  </FormControl>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
        <div className="w-full flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={addSegment}
            className="bg-white border-3 border-orange-300 hover:bg-orange-50 text-orange-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-black">Agregar segmento</span>
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
