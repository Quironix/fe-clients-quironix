import { CardCollapsible } from "@/app/dashboard/components/card-collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  CreditCard,
  FileX2,
  History,
  Scale,
  ShieldCheck,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CollectionProfile } from "../../types";
import CreditRisk from "../credit-risk";
import { DebtorChatbot } from "../debtor-chatbot";
import { KeyReasons } from "../key-reasons";
import LastManagements from "../last-managements";
import LastPaymentReceived from "../last-payment-received";
import LitigationsCard from "../litigations-card";
import PaymentCommitment from "../payment-commitment";
import ProtestedChecks from "../protested-checks";

interface KeyReasonsTabProps {
  debtorId: string;
  collectionProfile: CollectionProfile | null;
  isFetchingCollectionProfile: boolean;
  callBrief: string | null;
  isFetchingCallBrief: boolean;
}

export const KeyReasonsTab = ({
  debtorId,
  collectionProfile,
  isFetchingCollectionProfile,
  callBrief,
  isFetchingCallBrief,
}: KeyReasonsTabProps) => {
  const t = useTranslations("debtorManagement.keyReasonsTab");
  const tDetail = useTranslations("debtorManagement.detail");
  const tLastManagements = useTranslations("debtorManagement.lastManagementsCard");
  const router = useRouter();
  if (isFetchingCollectionProfile) {
    return (
      <div className="flex gap-5 h-full w-full mt-5">
        {/* Skeleton del chatbot (columna izquierda) */}
        <div className="h-full w-full">
          <div className="bg-white rounded-lg p-6 h-full">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-32 w-full mt-6" />
            </div>
          </div>
        </div>

        {/* Skeleton de las tarjetas (columna derecha) */}
        <div className="h-full w-2xl overflow-y-auto">
          <div className="flex flex-col gap-3">
            {/* Skeleton para KeyReasons */}
            <div className="bg-white rounded-lg p-4">
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>

            {/* Skeleton para las CardCollapsible */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collectionProfile) {
    return (
      <div className="bg-white p-6 rounded-md h-full flex items-center justify-center">
        <span className="text-gray-500">{tDetail("noData")}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-full w-full mt-5">
      <div className="h-full w-full overflow-y-auto">
        <div className="bg-white rounded-md border overflow-hidden">
          <DebtorChatbot
            debtorId={debtorId}
            callBrief={callBrief}
            isFetchingCallBrief={isFetchingCallBrief}
          />
        </div>
      </div>
      <div className="h-full w-2xl overflow-y-auto">
        <div className="flex flex-col gap-3">
          <KeyReasons callReasons={collectionProfile.call_reasons} />

          <CardCollapsible
            icon={<ShieldCheck />}
            title={t("paymentCommitment")}
            defaultOpen={false}
            destacado={true}
          >
            <PaymentCommitment data={collectionProfile.payment_commitment} />
          </CardCollapsible>

          <CardCollapsible
            icon={<TriangleAlert />}
            title={t("creditRisk")}
            defaultOpen={false}
          >
            <CreditRisk data={collectionProfile.credit_risk_summary} />
          </CardCollapsible>

          <CardCollapsible
            icon={<FileX2 />}
            title={t("protestedChecks")}
            defaultOpen={false}
          >
            <ProtestedChecks data={collectionProfile.protested_checks || []} />
          </CardCollapsible>

          <CardCollapsible
            icon={<CreditCard />}
            title={t("lastPayment")}
            defaultOpen={false}
          >
            <LastPaymentReceived
              data={collectionProfile.last_payment_received || null}
            />
          </CardCollapsible>

          <CardCollapsible
            icon={<Scale />}
            title={t("litigations")}
            defaultOpen={false}
          >
            <LitigationsCard data={collectionProfile || null} />
          </CardCollapsible>

          <CardCollapsible
            icon={<History />}
            title={t("lastManagements")}
            defaultOpen={false}
          >
            <LastManagements
              data={collectionProfile.management || null}
              debtorId={debtorId}
            />
          </CardCollapsible>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/dashboard/transactions/current-account?debtorId=${debtorId}`,
              )
            }
            className="bg-white p-2 rounded-md w-full h-full border border-gray-400 flex justify-between items-center gap-1 text-blue-700 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-start items-center gap-1">
              <Wallet className="shrink-0" size={18} />
              <span className="text-sm font-semibold">
                {tLastManagements("viewCurrentAccount")}
              </span>
            </div>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
