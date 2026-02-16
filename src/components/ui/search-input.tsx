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
  resetTrigger?: boolean; // Nueva prop para resetear el campo de búsqueda
  modal?: boolean;
}

export function SearchInput({
  value,
  onValueChange,
  options,
  placeholder = "Selecciona una opción",
  emptyMessage = "No se encontró el elemento",
  searchPlaceholder = "Buscar...",
  className,
  onSearchChange,
  isLoading = false,
  resetTrigger = false,
  modal = false,
}: SearchInputProps) {
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
          <span className="truncate">
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
          </span>
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
              placeholder={searchPlaceholder}
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
                    Buscando...
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={`${option.label}`}
                        onSelect={(currentValue) => {
                          const selectedOption = options.find(
                            (opt) =>
                              opt.label === currentValue ||
                              opt.custom === currentValue
                          );
                          if (selectedOption) {
                            onValueChange(selectedOption.value);
                          }
                          setJustSelected(true);
                          handleOpenChange(false);
                        }}
                      >
                        <span className="truncate">{option.label}</span>
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
              placeholder={searchPlaceholder}
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
                    Buscando...
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={`${option.label}`}
                        onSelect={(currentValue) => {
                          const selectedOption = options.find(
                            (opt) =>
                              opt.label === currentValue ||
                              opt.custom === currentValue
                          );
                          if (selectedOption) {
                            onValueChange(selectedOption.value);
                          }
                          setJustSelected(true);
                          handleOpenChange(false);
                        }}
                      >
                        <span className="truncate">{option.label}</span>
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
