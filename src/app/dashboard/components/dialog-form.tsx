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
}: DialogFormProps<T>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[50vw] max-h-[calc(100vh-3rem)] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="font-extrabold">{title}</DialogTitle>
          <div className="text-sm">
            <span>{description}</span>
          </div>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
