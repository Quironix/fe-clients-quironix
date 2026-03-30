import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { History, User } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("debtorManagement.lastManagementsCard");
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
      CALL_OUT: t("callOut"),
      email: t("email"),
      visit: t("visit"),
      letter: t("letter"),
      whatsapp: t("whatsapp"),
      AUTOMATED_COLLECTOR: "Automatizado por collector",
    };
    return types[type] || type;
  };

  const getManagerName = (management: any) => {
    if (management.management_type === "AUTOMATED_COLLECTOR") {
      return "Motor de collector";
    }
    const name = management.manager?.trim();
    return name && name !== "null null" ? name : "Motor collector";
  };

  const getDescriptionLabel = (management: any) => {
    if (management.description === "AUTOMATED_COMMUNICATION") {
      return "Ejecución automática";
    }
    return getExecutiveCommentLabel(management.description);
  };

  const IconPerson = ({ management }: { management: any }) => (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-1">
          <User className="text-blue-700" />
          <div className="flex flex-col gap-0">
            <span className="font-bold text-sm">
              {getManagerName(management)}
            </span>
            <span className="text-xs text-gray-400 -mt-1">
              {getDescriptionLabel(management)}
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
          <p className="text-sm text-gray-500">{t("noManagements")}</p>
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
              {t("allPrevious", { count: previousManagement.length })}
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
              `/dashboard/debtor-management/${debtorId}/managements-list`,
            )
          }
          variant="outline"
          className="mt-3 border-2 border-blue-400 w-1/2"
        >
          <History className="h-4 w-4 text-blue-600" />
          {t("allManagements")}
        </Button>
      </div>
    </div>
  );
};

export default LastManagements;
