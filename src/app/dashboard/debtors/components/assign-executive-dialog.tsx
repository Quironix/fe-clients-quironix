"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useProfileContext } from "@/context/ProfileContext";
import { Executive } from "../types";
import { assignDebtorToExecutive, getExecutives } from "../services";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignExecutiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debtorId: string;
  debtorName: string;
  currentExecutiveId?: string | null;
  onSuccess?: () => void;
}

export const AssignExecutiveDialog = ({
  isOpen,
  onClose,
  debtorId,
  debtorName,
  currentExecutiveId,
  onSuccess,
}: AssignExecutiveDialogProps) => {
  const { session, profile } = useProfileContext();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>("");
  const [loadingExecutives, setLoadingExecutives] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isOpen && session?.token && profile?.client?.id) {
      fetchExecutives();
      if (currentExecutiveId) {
        setSelectedExecutiveId(currentExecutiveId);
      }
    }
  }, [isOpen, session?.token, profile?.client?.id, currentExecutiveId]);

  const fetchExecutives = async () => {
    if (!session?.token || !profile?.client?.id) return;

    setLoadingExecutives(true);
    try {
      const data = await getExecutives(session.token, profile.client.id);
      setExecutives(data);
    } catch (error) {
      console.error("Error al cargar ejecutivos:", error);
      toast.error("Error al cargar la lista de ejecutivos");
    } finally {
      setLoadingExecutives(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedExecutiveId) {
      toast.error("Por favor selecciona un ejecutivo");
      return;
    }

    if (!session?.token || !profile?.client?.id) {
      toast.error("Sesión no válida");
      return;
    }

    setAssigning(true);
    try {
      await assignDebtorToExecutive(
        session.token,
        profile.client.id,
        debtorId,
        selectedExecutiveId
      );
      toast.success("Ejecutivo asignado correctamente");
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Error al asignar ejecutivo:", error);
      toast.error(error.message || "Error al asignar ejecutivo");
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedExecutiveId("");
    setOpen(false);
    onClose();
  };

  const selectedExecutive = executives.find(
    (exec) => exec.id === selectedExecutiveId
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignar Ejecutivo</DialogTitle>
          <DialogDescription>
            Selecciona un ejecutivo para asignar al deudor{" "}
            <span className="font-semibold text-gray-900">{debtorName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Seleccionar Ejecutivo
          </label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                disabled={loadingExecutives}
              >
                {loadingExecutives ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando ejecutivos...
                  </span>
                ) : selectedExecutive ? (
                  <span>
                    {selectedExecutive.first_name} {selectedExecutive.last_name}
                  </span>
                ) : (
                  "Seleccionar ejecutivo..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0">
              <Command>
                <CommandInput placeholder="Buscar ejecutivo..." />
                <CommandList>
                  <CommandEmpty>No se encontraron ejecutivos.</CommandEmpty>
                  <CommandGroup>
                    {executives.map((executive) => (
                      <CommandItem
                        key={executive.id}
                        value={`${executive.first_name} ${executive.last_name} ${executive.email}`}
                        onSelect={() => {
                          setSelectedExecutiveId(executive.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedExecutiveId === executive.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {executive.first_name} {executive.last_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {executive.email}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={assigning}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedExecutiveId || assigning}
          >
            {assigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
