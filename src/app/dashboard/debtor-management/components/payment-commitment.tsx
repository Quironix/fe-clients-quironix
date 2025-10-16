import { ShieldCheck } from "lucide-react";
import { PaymentCommitment as PaymentCommitmentType } from "../types";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface PaymentCommitmentProps {
  data: PaymentCommitmentType;
}

const PaymentCommitment = ({ data }: PaymentCommitmentProps) => {
  const total = data.fulfilled + data.unfulfilled;
  const percentage =
    total > 0 ? Math.round((data.unfulfilled / total) * 100) : 30;

  const chartData = [
    { name: "Incumplidas", value: data.unfulfilled || 30 },
    { name: "Cumplidas", value: data.fulfilled || 70 },
  ];

  const COLORS = {
    unfulfilled: "#EF4444", // red-500
    fulfilled: "#E5E7EB", // gray-200
  };

  return (
    <div className="flex flex-col justify-center items-center gap-1 flex-1">
      <span className="text-xs font-medium">Credibilidad</span>
      <div className="flex justify-center items-center text-[11px] gap-1">
        <span className="text-gray-600">{data.fulfilled} cumplidas</span>
        <span className="text-gray-400">-</span>
        <span className="text-gray-600">{data.unfulfilled} incumplidas</span>
      </div>

      {/* Gráfico circular */}
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill={COLORS.unfulfilled} />
              <Cell fill={COLORS.fulfilled} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-red-500">{percentage}%</span>
        </div>
      </div>
      <Select>
        <SelectTrigger>Últimos 3 compromisos</SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Últimos 3 compromisos</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentCommitment;
