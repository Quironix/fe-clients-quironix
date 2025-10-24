import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import TitleStep from "../../settings/components/title-step";

const debtPhaseOptions = [
  { value: "1", label: "Fase 1" },
  { value: "2", label: "Fase 2" },
  { value: "3", label: "Fase 3" },
  { value: "4", label: "Fase 4" },
  { value: "5", label: "Fase 5" },
  { value: "6", label: "Fase 6" },
  { value: "7", label: "Fase 7" },
  { value: "8", label: "Fase 8" },
];

interface GeneralInformationSectionProps {
  form: UseFormReturn<any>;
}

export function GeneralInformationSection({
  form,
}: GeneralInformationSectionProps) {
  return (
    <AccordionItem
      key="general-information"
      value="general-information"
      className="border border-gray-200 rounded-md px-4 py-2 mb-5"
    >
      <div className="grid grid-cols-[99%_4%] items-center gap-2 min-h-[50px] py-3">
        <AccordionTrigger className="flex items-center justify-between h-full">
          <TitleStep
            title="Información general"
            icon={<User className="w-5 h-5" />}
          />
        </AccordionTrigger>
      </div>
      <AccordionContent className="text-balance px-1 py-4 items-start">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Nombre del collector <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="debt_phases"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Fases de la deuda <span className="text-red-500">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value?.length && "text-muted-foreground"
                        )}
                      >
                        {field.value?.length > 0
                          ? `${field.value.length} fase${
                              field.value.length > 1 ? "s" : ""
                            } seleccionada${field.value.length > 1 ? "s" : ""}`
                          : "Selecciona fases"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar fase..." />
                      <CommandList>
                        <CommandEmpty>
                          No se encontró ninguna fase.
                        </CommandEmpty>
                        <CommandGroup>
                          {debtPhaseOptions.map((phase) => (
                            <CommandItem
                              key={phase.value}
                              onSelect={() => {
                                const newValue = field.value?.includes(
                                  phase.value
                                )
                                  ? field.value.filter(
                                      (val) => val !== phase.value
                                    )
                                  : [...(field.value || []), phase.value];
                                field.onChange(newValue);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(phase.value)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {phase.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {field.value?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {[...field.value]
                      .sort((a, b) => Number(a) - Number(b))
                      .map((val) => {
                        const phase = debtPhaseOptions.find(
                          (p) => p.value === val
                        );
                        return (
                          <Badge
                            key={val}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {phase?.label}
                            <button
                              type="button"
                              className="ml-1 rounded-full  cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                field.onChange(
                                  field.value.filter((v) => v !== val)
                                );
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Descripción general <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del collector" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
