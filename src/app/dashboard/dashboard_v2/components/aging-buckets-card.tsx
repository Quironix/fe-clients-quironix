import { formatNumber } from "@/lib/utils";
import { AgingBucket } from "../types";

interface AgingBucketsCardProps {
  data?: AgingBucket[];
  isLoading?: boolean;
}

const BUCKET_COLORS: Record<string, string> = {
  "0-30": "#3B82F6",
  "31-60": "#F27313",
  "61-90": "#DD650C",
  "90+": "#EF4444",
};

export const AgingBucketsCard: React.FC<AgingBucketsCardProps> = ({
  data = [],
  isLoading,
}) => {
  const total = data.reduce((a, d) => a + d.amount, 0) || 1;
  const worst = [...data].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Envejecimiento de cartera</h3>
        <span className="qxv2-h-sub">
          Distribución del saldo · total {formatNumber(total)}
        </span>
      </div>
      <div className="qxv2-body">
        {isLoading ? (
          <div className="qxv2-h-sub">Cargando...</div>
        ) : (
          <>
            <div className="qxv2-aging">
              {data.map((bucket) => {
                const pct = (bucket.amount / total) * 100;
                const color = BUCKET_COLORS[bucket.bucket] || "#94A3B8";
                return (
                  <div className="qxv2-aging-row" key={bucket.bucket}>
                    <span className="qxv2-a-name">{bucket.bucket}</span>
                    <span className="qxv2-a-track">
                      <span
                        className="qxv2-a-fill"
                        style={{ width: `${pct}%`, background: color }}
                      >
                        {pct >= 12 ? `${pct.toFixed(0)}%` : ""}
                      </span>
                    </span>
                    <span className="qxv2-a-val">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
            {worst && (
              <div className="qxv2-aging-foot">
                El tramo{" "}
                <strong style={{ color: "var(--qx-bad-tx)" }}>
                  {worst.bucket}
                </strong>{" "}
                concentra {formatNumber(worst.amount)} — es el que más pesa en
                la mora estructural.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
