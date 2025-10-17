import { User } from "lucide-react";
import { Badge } from "../../components/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LastManagements = ({ data }: { data: any }) => {
  const recentManagement = data?.management?.recent_management || [];
  const previousManagement = data?.management?.previous_management || [];

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
      phone_call: "Llamada telefónica",
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
              {management.description}
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
            <AccordionTrigger className="px-2">
              Todas las gestiones anteriores ({previousManagement.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Fecha</TableHead>
                      <TableHead>Tipo de gestión</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead className="text-right">
                        Observaciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previousManagement.map(
                      (management: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {formatDate(management.date)}
                          </TableCell>
                          <TableCell>
                            {getManagementTypeLabel(management.management_type)}
                          </TableCell>
                          <TableCell>{management.manager}</TableCell>
                          <TableCell className="text-right">
                            {management.description}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};

export default LastManagements;
