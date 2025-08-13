"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { PaymentPlansFilters } from "../hooks/usePaymentPlans";

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
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">{/*  */}</div>
    );
  }
);

FilterInputs.displayName = "FilterInputs";

export default FilterInputs;
