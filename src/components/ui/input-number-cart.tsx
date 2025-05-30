import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";

interface InputNumberCartProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  step?: number;
}

const InputNumberCart = ({
  value,
  onChange,
  placeholder = "Ej: 1",
  min = 0,
  max,
  disabled = false,
  step = 1,
}: InputNumberCartProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val) && (max === undefined || val <= max) && val >= min) {
      onChange(val);
    }
  };

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <button
        type="button"
        className="bg-gray-200 text-gray-500 text-2xl rounded-md w-10 min-w-10 max-w-10 h-10 flex items-center justify-center transition-colors hover:bg-gray-300"
        onClick={handleDecrease}
        aria-label="Restar"
        disabled={disabled || value <= min}
      >
        –
      </button>
      <Input
        type="number"
        className="text-center w-full h-10 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        step={step}
      />
      <button
        type="button"
        className="bg-blue-500 text-white text-2xl rounded-md w-10 min-w-10 max-w-10 h-10 flex items-center justify-center transition-colors hover:bg-blue-600"
        onClick={handleIncrease}
        aria-label="Sumar"
        disabled={disabled || (max !== undefined && value >= max)}
      >
        +
      </button>
    </div>
  );
};

export default InputNumberCart;
