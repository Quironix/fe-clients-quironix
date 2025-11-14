import { CardCollapsible } from "@/app/dashboard/components/card-collapsible";
import {
  CreditCard,
  FileX2,
  History,
  Scale,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { CollectionProfile } from "../../types";
import CreditRisk from "../credit-risk";
import { DebtorChatbot } from "../debtor-chatbot";
import { KeyReasons } from "../key-reasons";
import LastManagements from "../last-managements";
import LastPaymentReceived from "../last-payment-received";
import LitigationsCard from "../litigations-card";
import PaymentCommitment from "../payment-commitment";
import ProtestedChecks from "../protested-checks";
import { Skeleton } from "@/components/ui/skeleton";

interface KeyReasonsTabProps {
  debtorId: string;
  collectionProfile: CollectionProfile | null;
  isFetchingCollectionProfile: boolean;
}

export const KeyReasonsTab = ({
  debtorId,
  collectionProfile,
  isFetchingCollectionProfile,
}: KeyReasonsTabProps) => {
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
        <span className="text-gray-500">No hay datos disponibles</span>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-full w-full mt-5">
      <div className="h-full w-full">
        <DebtorChatbot
          debtorId={debtorId}
          callBrief={collectionProfile.call_brief}
        />
      </div>
      <div className="h-full w-2xl overflow-y-auto">
        <div className="flex flex-col gap-3">
          <KeyReasons callReasons={collectionProfile.call_reasons} />

          <CardCollapsible
            icon={<ShieldCheck />}
            title="Compromiso de pago"
            defaultOpen={false}
            destacado={true}
          >
            <PaymentCommitment data={collectionProfile.payment_commitment} />
          </CardCollapsible>

          <CardCollapsible
            icon={<TriangleAlert />}
            title="Riesgo crediticio"
            defaultOpen={false}
          >
            <CreditRisk data={collectionProfile.call_reasons} />
          </CardCollapsible>

          <CardCollapsible
            icon={<FileX2 />}
            title="Cheques protestos"
            defaultOpen={false}
          >
            <ProtestedChecks data={collectionProfile.protested_checks || []} />
          </CardCollapsible>

          <CardCollapsible
            icon={<CreditCard />}
            title="Último pago recibido"
            defaultOpen={false}
          >
            <LastPaymentReceived
              data={collectionProfile.last_payment_received || null}
            />
          </CardCollapsible>

          <CardCollapsible
            icon={<Scale />}
            title="Litigios"
            defaultOpen={false}
          >
            <LitigationsCard data={collectionProfile.litigations || null} />
          </CardCollapsible>

          <CardCollapsible
            icon={<History />}
            title="Últimas gestiones"
            defaultOpen={false}
          >
            <LastManagements data={collectionProfile.management || null} debtorId={debtorId} />
          </CardCollapsible>
        </div>
      </div>
    </div>
  );
};
