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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("paymentPlans.configForm");
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
              {t("title")}
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
            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-sm font-medium">
                {t("totalAmount")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalAmount"
                placeholder={t("totalAmountPlaceholder")}
                value={config.totalAmount || ""}
                onChange={(e) => {
                  const value = formatCurrency(e.target.value);
                  updateConfig("totalAmount", parseFloat(value) || 0);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment" className="text-sm font-medium">
                {t("downPayment")}
              </Label>
              <Input
                id="downPayment"
                placeholder={t("downPaymentPlaceholder")}
                value={config.downPayment || ""}
                onChange={(e) => {
                  const value = formatCurrency(e.target.value);
                  updateConfig("downPayment", parseFloat(value) || 0);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installments" className="text-sm font-medium">
                {t("installments")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.numberOfInstallments.toString()}
                onValueChange={(value) =>
                  updateConfig("numberOfInstallments", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {t("installmentUnit", { count: num })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate" className="text-sm font-medium">
                {t("interestRate")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interestRate"
                placeholder={t("interestRatePlaceholder")}
                value={config.annualInterestRate || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d.,]/g, "");
                  updateConfig("annualInterestRate", parseFloat(value) || 0);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                {t("paymentMethod")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.paymentMethod}
                onValueChange={(value) => updateConfig("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">
                    {t("paymentMethodTransfer")}
                  </SelectItem>
                  <SelectItem value="check">{t("paymentMethodCheck")}</SelectItem>
                  <SelectItem value="cash">{t("paymentMethodCash")}</SelectItem>
                  <SelectItem value="card">{t("paymentMethodCard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentFrequency" className="text-sm font-medium">
                {t("paymentFrequency")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={config.paymentFrequency}
                onValueChange={(value) =>
                  updateConfig("paymentFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("frequencyMonthly")}</SelectItem>
                  <SelectItem value="biweekly">{t("frequencyBiweekly")}</SelectItem>
                  <SelectItem value="weekly">{t("frequencyWeekly")}</SelectItem>
                  <SelectItem value="quarterly">{t("frequencyQuarterly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              {t("startDate")} <span className="text-red-500">*</span>
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
                    : t("datePlaceholder")}
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

          <div className="space-y-2">
            <Label htmlFor="comments" className="text-sm font-medium">
              {t("comment")}
            </Label>
            <Textarea
              id="comments"
              placeholder={t("commentPlaceholder")}
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
