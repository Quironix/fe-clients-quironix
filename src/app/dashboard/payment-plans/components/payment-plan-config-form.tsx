"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface PaymentPlanConfigFormProps {
  onConfigChange?: (config: PaymentPlanConfig) => void;
}

export interface PaymentPlanConfig {
  totalAmount: number;
  downPayment: number;
  numberOfInstallments: number;
  annualInterestRate: number;
  paymentMethod: string;
  paymentFrequency: string;
  startDate: Date | null;
  comments: string;
}

export default function PaymentPlanConfigForm({
  onConfigChange,
}: PaymentPlanConfigFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [config, setConfig] = useState<PaymentPlanConfig>({
    totalAmount: 0,
    downPayment: 0,
    numberOfInstallments: 0,
    annualInterestRate: 0,
    paymentMethod: "",
    paymentFrequency: "",
    startDate: null,
    comments: "",
  });

  const updateConfig = (field: keyof PaymentPlanConfig, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const formatCurrency = (value: string) => {
    // Remover caracteres no numéricos excepto puntos y comas
    const numericValue = value.replace(/[^\d,.-]/g, "");
    return numericValue;
  };

  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center">
              <div className="h-2 w-2 bg-blue-600 rounded"></div>
            </div>
            <CardTitle className="text-lg">
              Configuración del plan de pago
            </CardTitle>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Colocación total */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-sm font-medium">
                Colocación total <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalAmount"
                placeholder="Ingresa un monto"
                value={config.totalAmount || ""}
                onChange={(e) => {
                  const value = formatCurrency(e.target.value);
                  updateConfig("totalAmount", parseFloat(value) || 0);
                }}
              />
            </div>

            {/* Pago contado */}
            <div className="space-y-2">
              <Label htmlFor="downPayment" className="text-sm font-medium">
                Pago contado ($)
              </Label>
              <Input
                id="downPayment"
                placeholder="Ingresa un monto"
                value={config.downPayment || ""}
                onChange={(e) => {
                  const value = formatCurrency(e.target.value);
                  updateConfig("downPayment", parseFloat(value) || 0);
                }}
              />
            </div>

            {/* Número de cuotas */}
            <div className="space-y-2">
              <Label htmlFor="installments" className="text-sm font-medium">
                N° de cuotas <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.numberOfInstallments.toString()}
                onValueChange={(value) =>
                  updateConfig("numberOfInstallments", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} cuota{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tasa de interés anual */}
            <div className="space-y-2">
              <Label htmlFor="interestRate" className="text-sm font-medium">
                Tasa de interés anual <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interestRate"
                placeholder="Ingresa una tasa de interés"
                value={config.annualInterestRate || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.,]/g, "");
                  updateConfig("annualInterestRate", parseFloat(value) || 0);
                }}
              />
            </div>

            {/* Forma de pago */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                Forma de pago <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.paymentMethod}
                onValueChange={(value) => updateConfig("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">
                    Transferencia bancaria
                  </SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Frecuencia de pago */}
            <div className="space-y-2">
              <Label htmlFor="paymentFrequency" className="text-sm font-medium">
                Frecuencia de pago <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.paymentFrequency}
                onValueChange={(value) =>
                  updateConfig("paymentFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inicio de pago */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Inicio de pago <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {config.startDate
                    ? format(config.startDate, "dd-MM-yyyy", { locale: es })
                    : "DD-MM-AAAA"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={config.startDate || undefined}
                  onSelect={(date) => updateConfig("startDate", date || null)}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              Comentario
            </Label>
            <Textarea
              id="comments"
              placeholder="Completa"
              value={config.comments}
              onChange={(e) => updateConfig("comments", e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
