import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface DialogFormProps<T> {
  defaultValues?: Partial<T>;
  title?: string;
  description?: string | ReactNode;
  isEdit?: boolean;
  children: ReactNode;
  trigger?: ReactNode;
  onSubmit?: (data: T) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onInteractOutside?: (event: Event) => void;
}

const DialogForm = <T,>({
  defaultValues,
  title = "Crear",
  description = "Completa los campos obligatorios.",
  isEdit = false,
  children,
  trigger,
  onSubmit,
  open,
  onOpenChange,
  onInteractOutside,
}: DialogFormProps<T>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[50vw] max-h-[90vh] overflow-hidden bg-white flex flex-col"
        onInteractOutside={onInteractOutside}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-extrabold">{title}</DialogTitle>
          <div className="text-sm">
            <span>{description}</span>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
