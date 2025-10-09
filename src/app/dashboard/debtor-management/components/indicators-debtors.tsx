import { IconCalendarTime } from "@tabler/icons-react";
import {
  ChartLine,
  DollarSign,
  FileChartLine,
  Target,
  User,
} from "lucide-react";
import { IndicatorCard } from "./indicator-card";
import { formatValue, ProgressBarChart } from "./progress-bar-chart";

const IndicatorsDebtor = () => {
  const FirstCard = () => (
    <div className="bg-white shadow-xl rounded-md p-3 space-y-2">
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">
          <User className="text-blue-600" />
          <span>Estado</span>
        </div>
        <div>
          <div className="bg-[#43C41133] text-green-800 flex font-bold text-xs rounded-full items-center justify-start gap-1 px-3 text-center">
            <span className="w-2 h-2 bg-green-700 rounded-full" /> Activo
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">
          <IconCalendarTime className="text-gray-400" />
          <span>06/09/2025</span>
        </div>
        <div>
          <span>14:10</span>
        </div>
      </div>
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">Tareas realizadas</div>
        <div>
          <span className="text-green-700">16</span>
        </div>
      </div>
      <div className="flex gap-3 justify-between items-center">
        <div className="flex gap-1">Tareas pendientes</div>
        <div>
          <span className="text-red-700">8</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="flex flex-col gap-5 pb-10">
      <FirstCard />

      <IndicatorCard
        icon={<Target className="text-blue-600" />}
        title="Avance del ejecutivo"
      >
        <div className="flex flex-col">
          <span className="text-3xl text-black font-black">68%</span>
          <span className="text-sm text-black -mt-1">16/24 tareas</span>
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<DollarSign className="text-blue-600" />}
        title="Meta del día"
      >
        <div className="flex flex-col">
          <span className="text-3xl text-black font-black">$288M</span>
          <span className="text-sm text-black -mt-1">de $425M</span>
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<ChartLine className="text-blue-600" />}
        title="Reducción de morosidad"
      >
        <div className="flex flex-col w-full">
          <span className="text-3xl text-black font-black">67%</span>
          <ProgressBarChart
            color="#43C41180"
            leftValue={288000000}
            rightValue={137000000}
            separatorColor="#15803d"
          />
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<DollarSign className="text-blue-600" />}
        title="Compromisos de pago"
      >
        <div className="flex flex-col">
          <span className="text-3xl text-black font-black">
            {formatValue(288000000)}
          </span>
          <span className="text-sm text-black -mt-1">
            de 8 compromisos obtenidos
          </span>
        </div>
      </IndicatorCard>

      <IndicatorCard
        icon={<FileChartLine className="text-blue-600" />}
        title="Meta del mes"
      >
        <div className="flex flex-col w-full">
          <span className="text-3xl text-black font-black">30%</span>
          <ProgressBarChart
            color="#FFCC0080"
            leftValue={1200000}
            rightValue={4000000}
            separatorColor="#FFCC00"
          />
        </div>
      </IndicatorCard>
    </section>
  );
};

export default IndicatorsDebtor;
