import { Separator } from "@/components/ui/separator";
import { CallReasons } from "../types";
import { Badge } from "../../components/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LastPaymentReceived = ({ data }: { data: any }) => {
  // "last_payment_received": {
  //         "amount": 0,
  //         "type": null,
  //         "date": null,
  //         "sender_account": null,
  //         "payment_number": null,
  //         "balance": 0,
  //         "bank_received": null,
  //         "other_pending_payments": []
  //     },
  return (
    <div className="space-y-4 px-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-semibold">${data.amount || 0}</h4>
          <p className="text-sm text-muted-foreground">
            {data.type || "Transferencia"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mt-1">
            {data.date || "dd/mm/yyy"}
          </p>
          <Badge variant="warning" text="Pendiente imputar" />
        </div>
      </div>
      <Accordion
        type="single"
        collapsible
        className="border border-gray-200 p-1 rounded-sm"
      >
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="px-2">
            Otros pagos pendientes
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">$xxxxxxx</h4>
                  <p className="text-sm text-muted-foreground">Transferencia</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mt-1">date</p>
                  <Badge variant="warning" text="Pendiente imputar" />
                </div>
              </div>
            </div>
            <Separator className="mt-2" />
            <div className="space-y-4 px-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">$xxxxxxx</h4>
                  <p className="text-sm text-muted-foreground">Transferencia</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mt-1">date</p>
                  <Badge variant="warning" text="Pendiente imputar" />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LastPaymentReceived;
