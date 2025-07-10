import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertCircle, Trash2, X } from "lucide-react";
import React from "react";

interface DialogConfirmProps {
  title: string;
  description: string;
  triggerButton?: React.ReactNode;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  type?: "danger" | "warning";
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

const DialogConfirm: React.FC<DialogConfirmProps> = ({
  title,
  description,
  triggerButton,
  cancelButtonText = "Volver",
  confirmButtonText = "Eliminar",
  onConfirm,
  onCancel,
  type = "warning",
  isOpen = false,
  setIsOpen,
}) => {
  return (
    <AlertDialog
      {...(isOpen && setIsOpen && { open: isOpen, onOpenChange: setIsOpen })}
    >
      {triggerButton && (
        <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
      )}
      <AlertDialogContent className="max-w-[90%] min-w-1/2 gap-0">
        <div className="absolute right-4 top-4">
          <AlertDialogCancel className="p-0 m-0 h-auto w-auto border-none hover:bg-transparent">
            <X className="h-6 w-6 text-gray-500" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-10">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            {type === "danger" ? (
              <Trash2 className="h-10 w-10 text-[#FC5C5C]" />
            ) : (
              <AlertCircle className="h-10 w-10 text-amber-500" />
            )}
          </div>

          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-2xl font-extrabold text-center mb-0">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#0F172A] text-center mt-0">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="flex flex-row gap-3 mt-6 border-t border-orange-500 pt-4">
          <AlertDialogCancel
            onClick={onCancel}
            className="flex-1 bg-white border-[1.5px] border-gray-200 hover:bg-gray-50"
          >
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogConfirm;
