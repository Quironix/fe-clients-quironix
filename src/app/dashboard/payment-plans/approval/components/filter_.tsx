"use client";

import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { PaymentPlansFilters } from "../../hooks/usePaymentPlans";

export interface FilterInputsRef {
  getCurrentFilters: () => PaymentPlansFilters;
  clearFilters: () => void;
}

interface FilterInputsProps {
  onFilterChange: (filters: PaymentPlansFilters) => void;
  initialFilters?: PaymentPlansFilters;
}

const FilterInputs = forwardRef<FilterInputsRef, FilterInputsProps>(
  ({ onFilterChange, initialFilters = {} }, ref) => {
    const [filters, setFilters] = useState<PaymentPlansFilters>(initialFilters);

    useImperativeHandle(ref, () => ({
      getCurrentFilters: () => filters,
      clearFilters: () => {
        const clearedFilters = {};
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
      },
    }));

    const handleFilterChange = (key: keyof PaymentPlansFilters, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
    };

    const applyFilters = () => {
      onFilterChange(filters);
    };

    const clearFilters = () => {
      const clearedFilters = {};
      setFilters(clearedFilters);
      onFilterChange(clearedFilters);
    };

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filtros</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="mr-2 h-4 w-4" />
            Aplicar filtros
          </Button>
        </div>
      </div>
    );
  }
);

FilterInputs.displayName = "FilterInputs";

export default FilterInputs;
