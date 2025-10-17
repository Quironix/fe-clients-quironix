import { History, Scale, CreditCard, FileX2, TriangleAlert, ShieldCheck } from "lucide-react";
import { CardCollapsible } from "@/app/dashboard/components/card-collapsible";
import { DebtorChatbot } from "../debtor-chatbot";
import { KeyReasons } from "../key-reasons";
import PaymentCommitment from "../payment-commitment";
import CreditRisk from "../credit-risk";
import ProtestedChecks from "../protested-checks";
import LastPaymentReceived from "../last-payment-received";
import LitigationsCard from "../litigations-card";
import LastManagements from "../last-managements";
import { CollectionProfile } from "../../types";

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
      <div className="bg-white p-6 rounded-md h-full flex items-center justify-center">
        <span className="text-gray-500">Cargando razones clave...</span>
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
    <div className="flex gap-5 h-full w-full">
      <div className="h-full w-full">
        <DebtorChatbot debtorId={debtorId} />
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
            <CreditRisk data={collectionProfile.payment_commitment} />
          </CardCollapsible>

          <CardCollapsible
            icon={<FileX2 />}
            title="Cheques protestos"
            defaultOpen={false}
          >
            <ProtestedChecks data={collectionProfile.protested_checks} />
          </CardCollapsible>

          <CardCollapsible
            icon={<CreditCard />}
            title="Último pago recibido"
            defaultOpen={false}
          >
            <LastPaymentReceived data={collectionProfile.last_payment_received} />
          </CardCollapsible>

          <CardCollapsible
            icon={<Scale />}
            title="Litigios"
            defaultOpen={false}
          >
            <LitigationsCard data={collectionProfile.litigations} />
          </CardCollapsible>

          <CardCollapsible
            icon={<History />}
            title="Últimas gestiones"
            defaultOpen={false}
          >
            <LastManagements data={collectionProfile.management} />
          </CardCollapsible>
        </div>
      </div>
    </div>
  );
};
