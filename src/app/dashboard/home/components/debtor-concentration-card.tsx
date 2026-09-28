import { formatNumber } from "@/lib/utils";
import { DebtorConcentrationItem } from "../types";
import { QuironAiButton } from "./ai/quiron-buttons";
import { CardMessage, loadingOrEmpty } from "./card-message";

const TOP_DEBTORS = 5;

interface DebtorConcentrationCardProps {
  data?: DebtorConcentrationItem[] | null;
  isLoading?: boolean;
}

export const DebtorConcentrationCard: React.FC<
  DebtorConcentrationCardProps
> = ({ data, isLoading }) => {
  const top = [...(data ?? [])]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, TOP_DEBTORS);
  const total = top.reduce((a, d) => a + d.amount, 0);
  const max = Math.max(1, ...top.map((d) => d.amount));

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Concentración de la mora</h3>
        {top.length > 0 && (
          <span className="qxv2-h-sub">
            Top {top.length} · {formatNumber(total)}
          </span>
        )}
        <QuironAiButton
          topic="debtor-concentration"
          variant="ghost"
          size="sm"
          style={{ marginLeft: "auto" }}
        />
      </div>
      <div className="qxv2-body">
        {top.length === 0 ? (
          <CardMessage>{loadingOrEmpty(isLoading)}</CardMessage>
        ) : (
          top.map((item, index) => (
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
