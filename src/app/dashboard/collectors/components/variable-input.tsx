"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

interface Variable {
  key: string;
  label: string;
}

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const availableVariables: Variable[] = [
  { key: "num_factura", label: "N° de factura" },
  { key: "fecha", label: "Fecha" },
  { key: "empresa", label: "Nombre de la empresa" },
  { key: "monto_total", label: "Monto total" },
];

export function VariableInput({
  value = "",
  onChange,
  placeholder = "Escribe aquí...",
  className,
}: VariableInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const parseContent = (text: string) => {
    const regex = /(\{\{[^}]+\}\})/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const varKey = match[1];
        const variable = availableVariables.find((v) => v.key === varKey);
        return (
          <Badge
            key={index}
            variant="secondary"
            className="inline-flex items-center gap-1 mx-0.5 bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            {variable?.label || varKey}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeVariable(part);
              }}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const insertVariable = (varKey: string) => {
    const variable = `{{${varKey}}}`;
    let newValue = value;

    if (isEditing && inputRef.current) {
      const pos = inputRef.current.selectionStart || 0;
      newValue =
        value.substring(0, pos) + variable + " " + value.substring(pos);
    } else {
      newValue = value ? `${value} ${variable} ` : `${variable} `;
    }

    onChange(newValue);
    setPopoverOpen(false);

    setTimeout(() => {
      if (inputRef.current) {
        const newPos = (inputRef.current.selectionStart || 0) + variable.length + 1;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const removeVariable = (variableText: string) => {
    const newValue = value.replace(variableText, "").replace(/\s+/g, " ").trim();
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex-1 min-h-[40px] px-3 py-2 border border-input rounded-md bg-background cursor-text relative",
          className
        )}
        onClick={handleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full outline-none bg-transparent"
          />
        ) : (
          <div className="flex flex-wrap items-center gap-1 min-h-[24px]">
            {value ? (
              parseContent(value)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        )}
      </div>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1" />
            Variable
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Variables disponibles</h4>
            <div className="space-y-2">
              {availableVariables.map((variable) => (
                <button
                  key={variable.key}
                  type="button"
                  onClick={() => insertVariable(variable.key)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {variable.label}
                    </span>
                    <code className="text-xs text-blue-600">
                      {`{{${variable.key}}}`}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
