import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import DataTableNormal from "../../components/data-table-normal";
import LoaderTable from "../../components/loader-table";
import IconDescription from "../../payment-netting/components/icon-description";
import { PaymentPlanResponse } from "../types";
import { ColumnsDetail } from "./columns-detail";

const CardUser = ({
  detail,
  setDebtorExpanded,
  debtorExpanded,
}: {
  detail: PaymentPlanResponse;
  setDebtorExpanded: (value: boolean) => void;
  debtorExpanded: boolean;
}) => {
  return (
    <Card>
      <CardHeader
        className="cursor-pointer"
        onClick={() => setDebtorExpanded(!debtorExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100/50 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Información del deudor</CardTitle>
          </div>
          {debtorExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </CardHeader>

      {debtorExpanded && (
        <CardContent className="space-y-6">
          <div className="bg-blue-100/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2 text-blue-800">
              Datos del deudor
            </h3>
            {detail?.debtor ? (
              <div className="space-y-5 grid grid-cols-2">
                <IconDescription
                  icon={<IdCard className="w-6 h-6 text-blue-600" />}
                  description="Documento"
                  value={detail.debtor.dni.dni}
                />
                <IconDescription
                  icon={<Building2 className="w-6 h-6 text-blue-600" />}
                  description="Razón social"
                  value={detail.debtor.name}
                />
                <IconDescription
                  icon={<User className="w-6 h-6 text-blue-600" />}
                  description="Contacto"
                  value={detail.debtor.contacts[0].name}
                />
                <IconDescription
                  icon={<Mail className="w-6 h-6 text-blue-600" />}
                  description="Email"
                  value={detail.debtor.email}
                />
                <IconDescription
                  icon={<Phone className="w-6 h-6 text-blue-600" />}
                  description="Teléfono"
                  value={detail.debtor.phone}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No has seleccionado ningún deudor
              </p>
            )}
          </div>
          <div className="border border-gray-200 p-4 rounded-lg">
            <span className="font-bold text-sm">Facturas seleccionadas</span>
            <DataTableNormal
              columns={ColumnsDetail()}
              data={detail.originalInvoices}
              pageSize={5}
              pageSizeOptions={[5, 10, 15, 20, 25, 30, 40, 50]}
              emptyMessage="No se encontraron facturas"
              loadingComponent={<LoaderTable cols={6} />}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default CardUser;
