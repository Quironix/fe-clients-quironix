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
import { useTranslations } from "next-intl";
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

const exclusionOptionIds = [
  "cash_documents",
  "protested_checks",
  "promissory_notes",
  "credit_notes",
] as const;

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
  const t = useTranslations("collectors.segmentation");
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
      toast.success(t("segmentRemoved"));
    } else {
      toast.error(t("segmentMinError"));
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
            title={t("title")}
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
                  <span className="font-semibold">{t("segment")} {index + 1}</span>
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
                          {t("applicableSegment")}{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("completePlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">{t("segmentAll")}</SelectItem>
                            <SelectItem value="SEGMENTATION_LOW">
                              {t("segmentLowBilling")}
                            </SelectItem>
                            <SelectItem value="SEGMENTATION_MEDIUM">
                              {t("segmentMedBilling")}
                            </SelectItem>
                            <SelectItem value="SEGMENTATION_HIGH">
                              {t("segmentHighBilling")}
                            </SelectItem>
                            <SelectItem value="DBT_LOW">{t("segmentLowDBT")}</SelectItem>
                            <SelectItem value="DBT_MEDIUM">
                              {t("segmentMedDBT")}
                            </SelectItem>
                            <SelectItem value="DBT_HIGH">{t("segmentHighDBT")}</SelectItem>
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
                          {t("minDelayDays")}{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("selectPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">{t("days0")}</SelectItem>
                            <SelectItem value="15">{t("days15")}</SelectItem>
                            <SelectItem value="30">{t("days30")}</SelectItem>
                            <SelectItem value="60">{t("days60")}</SelectItem>
                            <SelectItem value="90">{t("days90")}</SelectItem>
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
                        <FormLabel>{t("exclusions")}</FormLabel>
                        <div className="space-y-2">
                          {exclusionOptionIds.map((optionId) => {
                            const labelMap: Record<string, string> = {
                              cash_documents: t("cashDocuments"),
                              protested_checks: t("protestedChecks"),
                              promissory_notes: t("promissoryNotes"),
                              credit_notes: t("creditNotes"),
                            };
                            return (
                            <FormField
                              key={optionId}
                              control={form.control}
                              name={`segmentations.${index}.exclusions`}
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={optionId}
                                    className="flex flex-row items-start space-x-1 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          optionId
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...(field.value || []),
                                                optionId,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value: string) =>
                                                    value !== optionId
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {labelMap[optionId]}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          );})}
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
                          {t("frequency")} <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue(
                              `segmentations.${index}.schedule.preferred_days`,
                              []
                            );
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("selectPlaceholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DAILY">{t("daily")}</SelectItem>
                            <SelectItem value="SEVEN_DAYS">{t("weekly")}</SelectItem>
                            <SelectItem value="BIWEEKLY">{t("biweekly")}</SelectItem>
                            <SelectItem value="MONTHLY">{t("monthly")}</SelectItem>
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
                        label={t("schedule")}
                        placeholder={t("selectPlaceholder")}
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
                  render={() => {
                    const frequency = form.watch(`segmentations.${index}.frequency`);
                    const isDaily = frequency === "DAILY";

                    return (
                      <FormItem>
                        <FormLabel>
                          {t("sendingDays")} <span className="text-red-500">*</span>
                          {!isDaily && (
                            <span className="text-xs text-gray-500 ml-2">
                              {t("singleDayNote")}
                            </span>
                          )}
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

                                          if (isDaily) {
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
                                          } else {
                                            if (isSelected) {
                                              field.onChange([]);
                                            } else {
                                              field.onChange([day.value]);
                                            }
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
                    );
                  }}
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
            <span className="text-black">{t("addSegment")}</span>
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
