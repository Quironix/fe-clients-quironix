import React from "react";
import PhoneInput from "react-phone-number-input";
import type { E164Number } from "libphonenumber-js/core";
import { cn } from "@/lib/utils";
import "react-phone-number-input/style.css";

// Estilos personalizados para sobreescribir los estilos por defecto
const customStyles = `
  .PhoneInputInput {
    /* Eliminar bordes y outline solo del input interno */
    border: none !important;
    outline: none !important;
    padding-left: 8px;
    background: none;
    font-size: 14px;
    width: 100%;
  }

  .PhoneInputInput:focus {
    /* Eliminar outline y sombras del input al hacer focus */
    outline: none !important;
    box-shadow: none !important;
  }

  .PhoneInput--focus {
    /* Mantener el borde cuando está en focus */
    border-color: #ccc !important;
  }
`;

export interface CustomPhoneInputProps
  extends Omit<React.ComponentProps<typeof PhoneInput>, "onChange"> {
  onChange?: (value: E164Number | undefined) => void;
  className?: string;
  error?: boolean;
}

const CustomPhoneInput = React.forwardRef<HTMLInputElement, CustomPhoneInputProps>(
  ({ value, onChange, className, error, ...props }, ref) => {
    return (
      <div className="relative">
        <style>{customStyles}</style>
        <PhoneInput
          international
          defaultCountry="CL"
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:border-input disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500" : "",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

CustomPhoneInput.displayName = "CustomPhoneInput";

export { CustomPhoneInput as PhoneInput };
