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
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ];

  const IconPerson = () => (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-1">
          <User className="text-blue-700" />
          <div className="flex flex-col gap-0">
            <span className="font-bold text-sm">Ricardo Williams</span>
            <span className="text-xs text-gray-400 -mt-1">Lorem ipsum</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs">00/00/00000</span>
          <Badge variant="info" text="Tipo de gestión" />
        </div>
      </div>
    </>
  );
  return (
    <div className="flex flex-col gap-3">
      <IconPerson />
      <IconPerson />
      <IconPerson />
      <Accordion
        type="single"
        collapsible
        className="border border-gray-200 p-1 rounded-sm"
      >
        <AccordionItem value="item-1" className="border-0">
          <AccordionTrigger className="px-2">
            Todas las gestiones anteriores (5)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead>Tipo de gestión</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead className="text-right">Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                      <TableCell className="font-medium">
                        {invoice.invoice}
                      </TableCell>
                      <TableCell>{invoice.paymentStatus}</TableCell>
                      <TableCell>{invoice.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        {invoice.totalAmount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LastManagements;
