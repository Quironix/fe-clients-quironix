import { formatNumber } from "@/lib/utils";
import { DebtorConcentrationItem } from "../types";

interface DebtorConcentrationCardProps {
  data?: DebtorConcentrationItem[];
  isLoading?: boolean;
}

export const DebtorConcentrationCard: React.FC<
  DebtorConcentrationCardProps
> = ({ data = [], isLoading }) => {
  const total = data.reduce((a, d) => a + d.amount, 0);
  const max = Math.max(1, ...data.map((d) => d.amount));

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Concentración de la mora</h3>
        <span className="qxv2-h-sub">
          {data.length} deudores · {formatNumber(total)}
        </span>
      </div>
      <div className="qxv2-body">
        {isLoading ? (
          <div className="qxv2-h-sub">Cargando...</div>
        ) : (
          data.map((item, index) => (
            <div className="qxv2-conc-row" key={item.debtorId}>
              <span className="qxv2-c-rk">{index + 1}</span>
              <span className="qxv2-c-nm">
                {item.debtorName}
                <small>{(item.share * 100).toFixed(1)}% de la mora</small>
              </span>
              <span className="qxv2-c-mo">{formatNumber(item.amount)}</span>
              <span className="qxv2-conc-bar">
                <span style={{ width: `${(item.amount / max) * 100}%` }} />
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
