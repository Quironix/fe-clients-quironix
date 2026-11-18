import { cn, formatNumber } from "@/lib/utils";
import { TeamMemberRow, UpcomingCommitmentDay } from "../types";
import { cardBody, DashCard, DashCardHeader } from "./dash-card";

interface MyRankingCardProps {
  team?: TeamMemberRow[];
  currentExecutiveId?: string;
  upcomingCommitments?: UpcomingCommitmentDay[];
}

export const MyRankingCard: React.FC<MyRankingCardProps> = ({
  team = [],
  currentExecutiveId,
  upcomingCommitments,
}) => {
  const commitmentsToday = upcomingCommitments?.find((u) =>
    u.when.startsWith("Hoy"),
  );
  const ranked = [...team].sort((a, b) => b.cashGenerated - a.cashGenerated);
  const matchIndex = ranked.findIndex((r) => r.executiveId === currentExecutiveId);
  // Falls back to the 2nd row when the logged-in user isn't one of the
  // fetched executives (e.g. previewing as an admin, or mock-fallback data
  // with placeholder ids) so the card still demonstrates its content.
  const meIndex = matchIndex >= 0 ? matchIndex : ranked.length > 1 ? 1 : 0;
  const me = ranked.length > 0 ? ranked[meIndex] : undefined;
  const leader = ranked[0];
  const gap =
    me && leader && me !== leader
      ? formatNumber(leader.cashGenerated - me.cashGenerated)
      : null;

  return (
    <DashCard>
      <DashCardHeader title="Mi posición en el equipo" sub="Por caja recuperada" />
      <div className={cardBody}>
        {me && (
          <div className="flex items-center gap-3.5 pt-1.5 pb-0.5">
            <span className="flex-none whitespace-nowrap text-[34px] font-black tracking-[-0.02em] text-primary-bright">
              {meIndex + 1}º<small className="text-[15px] text-gray-400"> de {ranked.length}</small>
            </span>
            <span className="text-[12.5px] font-bold text-gray-500">
              {gap ? (
                <>
                  Estás a <strong className="text-gray-900">{gap}</strong> del 1er lugar.
                  {commitmentsToday && (
                    <>
                      {" "}
                      Los {commitmentsToday.count} compromisos de hoy (
                      {formatNumber(commitmentsToday.totalAmount)}) te acercan.
                    </>
                  )}
                </>
              ) : (
                "Vas liderando el ranking del equipo."
              )}
            </span>
          </div>
        )}
        <div className="mt-2.5 flex flex-col gap-0.5">
          {ranked.map((r, i) => {
            const isMe = i === meIndex;
            return (
              <div
                className={cn(
                  "grid grid-cols-[20px_1fr_auto] items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px]",
                  isMe && "bg-primary-soft font-black",
                )}
                key={r.executiveId}
              >
                <span className={cn("font-black", isMe ? "text-primary-bright" : "text-gray-400")}>
                  {i + 1}
                </span>
                <span>{r.executiveName}</span>
                <span className="font-black">{formatNumber(r.cashGenerated)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </DashCard>
  );
};
