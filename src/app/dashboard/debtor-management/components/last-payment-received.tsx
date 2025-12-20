import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "../../components/badge";

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
          <h4 className="font-bold text-xl">
            {formatNumber(data.amount || 0)}
          </h4>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(data.date) || "N/A"}
          </p>
          <Badge variant="warning" text={data.type} />
        </div>
      </div>
      {data.other_pending_payments &&
        data.other_pending_payments.length > 0 && (
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
                {data.other_pending_payments.map((data) => (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xl">
                          {formatNumber(data.amount || 0)}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(data.date) || "N/A"}
                        </p>
                        <Badge variant="warning" text={data.type} />
                      </div>
                    </div>
                    <Separator className="mt-2" />
                  </>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
    </div>
  );
};

export default LastPaymentReceived;
