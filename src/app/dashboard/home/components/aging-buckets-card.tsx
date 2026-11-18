import { formatNumber } from "@/lib/utils";
import { AgingBucket } from "../types";
import { QuironAiButton } from "./ai/quiron-buttons";
import { cardBody, DashCard, DashCardHeader, subText } from "./dash-card";

interface AgingBucketsCardProps {
  data?: AgingBucket[];
  isLoading?: boolean;
}

const BUCKET_COLORS: Record<string, string> = {
  "0-30": "var(--seg-pago)",
  "31-60": "var(--brand-orange)",
  "61-90": "var(--brand-orange-dark)",
  "90+": "var(--bad)",
};

export const AgingBucketsCard: React.FC<AgingBucketsCardProps> = ({
  data = [],
  isLoading,
}) => {
  const total = data.reduce((a, d) => a + d.amount, 0) || 1;
  const worst = [...data].sort((a, b) => b.amount - a.amount)[0];

  return (
    <DashCard>
      <DashCardHeader
        title="Envejecimiento de cartera"
        sub={`Distribución del saldo · total ${formatNumber(total)}`}
      >
        <QuironAiButton topic="aging-buckets" variant="ghost" size="sm" className="ml-auto" />
      </DashCardHeader>
      <div className={cardBody}>
        {isLoading ? (
          <div className={subText}>Cargando...</div>
        ) : (
          <>
            <div className="flex flex-col gap-[11px]">
              {data.map((bucket) => {
                const pct = (bucket.amount / total) * 100;
                const color = BUCKET_COLORS[bucket.bucket] || "var(--seg-otras)";
                return (
                  <div
                    className="grid grid-cols-[88px_1fr_78px] items-center gap-3"
                    key={bucket.bucket}
                  >
                    <span className="text-xs font-extrabold text-gray-600">{bucket.bucket}</span>
                    <span className="h-4 overflow-hidden rounded-sm bg-gray-100">
                      <span
                        className="flex h-full min-w-0.5 items-center rounded-sm pl-2 text-[10.5px] font-extrabold text-white"
                        style={{ width: `${pct}%`, background: color }}
                      >
                        {pct >= 12 ? `${pct.toFixed(0)}%` : ""}
                      </span>
                    </span>
                    <span className="text-right text-[12.5px] font-black">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
            {worst && (
              <div className="mt-3 text-[11.5px] font-bold text-gray-500">
                El tramo <strong className="text-bad-fg">{worst.bucket}</strong> concentra{" "}
                {formatNumber(worst.amount)} — es el que más pesa en la mora estructural.
              </div>
            )}
          </>
        )}
      </div>
    </DashCard>
  );
};
