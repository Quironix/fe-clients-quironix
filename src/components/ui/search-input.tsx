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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string; custom?: any }[];
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  onSearchChange?: (searchValue: string) => void;
  isLoading?: boolean;
  resetTrigger?: boolean;
  modal?: boolean;
}

export function SearchInput({
  value,
  onValueChange,
  options,
  placeholder,
  emptyMessage,
  searchPlaceholder,
  className,
  onSearchChange,
  isLoading = false,
  resetTrigger = false,
  modal = false,
}: SearchInputProps) {
  const t = useTranslations("searchInput");
  const resolvedPlaceholder = placeholder ?? t("placeholder");
  const resolvedEmptyMessage = emptyMessage ?? t("emptyMessage");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("searchPlaceholder");
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [justSelected, setJustSelected] = React.useState(false);

  // Limpiar el valor de búsqueda cuando se cierre el popover (solo si no está cargando)
  React.useEffect(() => {
    if (!open && !isLoading) {
      setSearchValue("");
      setJustSelected(false);
    }
  }, [open, isLoading]);

  // Prevenir que se cierre el popover mientras se está cargando
  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen && isLoading) {
        // No cerrar si está cargando
        return;
      }
      setOpen(newOpen);
    },
    [isLoading]
  );

  // Resetear justSelected después de un tiempo para permitir búsquedas posteriores
  React.useEffect(() => {
    if (justSelected) {
      const timeout = setTimeout(() => {
        setJustSelected(false);
      }, 100); // Pequeño delay para evitar reapertura inmediata

      return () => clearTimeout(timeout);
    }
  }, [justSelected]);

  // Abrir automáticamente cuando el usuario empiece a escribir (pero no si acaba de seleccionar)
  React.useEffect(() => {
    if (searchValue && !open && !justSelected) {
      setOpen(true);
    }
  }, [searchValue, open, justSelected]);

  // Efecto para resetear el valor de búsqueda cuando se active resetTrigger
  React.useEffect(() => {
    if (resetTrigger) {
      setSearchValue("");
      setOpen(false);
      setJustSelected(false);
    }
  }, [resetTrigger]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between truncate",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? (() => {
            const selected = options.find((option) => option.value === value);
            return (
              <span className="flex items-center gap-2 truncate">
                {selected?.custom && (
                  <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                    {selected.custom}
                  </span>
                )}
                <span className="truncate">{selected?.label}</span>
              </span>
            );
          })() : (
            <span className="truncate">{resolvedPlaceholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {modal ? (
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] bg-popover text-popover-foreground rounded-md border shadow-md outline-hidden"
        >
          <Command filter={() => 1}>
            <CommandInput
              placeholder={resolvedSearchPlaceholder}
              className="h-9"
              value={searchValue}
              onValueChange={(value) => {
                setSearchValue(value);
                onSearchChange?.(value);
              }}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    {t("searching")}
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{resolvedEmptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onValueChange(currentValue);
                          setJustSelected(true);
                          handleOpenChange(false);
                        }}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {option.custom && (
                            <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                              {option.custom}
                            </span>
                          )}
                          <span className="truncate">{option.label}</span>
                        </span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            option.value === value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverPrimitive.Content>
      ) : (
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 !z-[100]">
          <Command filter={() => 1}>
            <CommandInput
              placeholder={resolvedSearchPlaceholder}
              className="h-9"
              value={searchValue}
              onValueChange={(value) => {
                setSearchValue(value);
                onSearchChange?.(value);
              }}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    {t("searching")}
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{resolvedEmptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onValueChange(currentValue);
                          setJustSelected(true);
                          handleOpenChange(false);
                        }}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {option.custom && (
                            <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                              {option.custom}
                            </span>
                          )}
                          <span className="truncate">{option.label}</span>
                        </span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            option.value === value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
