import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { History, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../../components/badge";
import { getExecutiveCommentLabel } from "../config/management-types";

const LastManagements = ({
  data,
  debtorId,
}: {
  data: any;
  debtorId: string;
}) => {
  const router = useRouter();
  const recentManagement = data?.recent_management || [];
  const previousManagement = data?.previous_management || [];

  console.log(data);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getManagementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      CALL_OUT: "Llamada telefónica",
      email: "Correo electrónico",
      visit: "Visita",
      letter: "Carta",
      whatsapp: "WhatsApp",
    };
    return types[type] || type;
  };

  const IconPerson = ({ management }: { management: any }) => (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-1">
          <User className="text-blue-700" />
          <div className="flex flex-col gap-0">
            <span className="font-bold text-sm">{management.manager}</span>
            <span className="text-xs text-gray-400 -mt-1">
              {getExecutiveCommentLabel(management.description)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs">{formatDate(management.date)}</span>
          <Badge
            variant="info"
            text={getManagementTypeLabel(management.management_type)}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-3">
      {recentManagement.length > 0 ? (
        recentManagement.map((management: any, index: number) => (
          <IconPerson key={index} management={management} />
        ))
      ) : (
        <div className="flex items-center justify-center p-6 border border-gray-200 rounded-sm bg-gray-50">
          <p className="text-sm text-gray-500">
            No hay últimas gestiones registradas
          </p>
        </div>
      )}
      {previousManagement.length > 0 && (
        <Accordion
          type="single"
          collapsible
          className="border border-gray-200 p-1 rounded-sm"
        >
          <AccordionItem value="item-1" className="border-0">
            <AccordionTrigger className="px-2 py-2">
              Todas las gestiones anteriores ({previousManagement.length})
            </AccordionTrigger>
            <AccordionContent className="mt-3">
              <div className="space-y-4 px-3">
                {previousManagement.map((management: any, index: number) => (
                  <IconPerson key={index} management={management} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <div className="flex items-center justify-center">
        <Button
          onClick={() =>
            router.push(
              `/dashboard/debtor-management/${debtorId}/managements-list`
            )
          }
          variant="outline"
          className="mt-3 border-2 border-blue-400 w-1/2"
        >
          <History className="h-4 w-4 text-blue-600" />
          Todas las gestiones
        </Button>
      </div>
    </div>
  );
};

export default LastManagements;
