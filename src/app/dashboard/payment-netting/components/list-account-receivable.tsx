import { Clock2 } from "lucide-react";
import ItemListPayment from "./item-list-payment";

const ListAccountReceivable = () => {
  // Datos dummy
  const dummyData = [
    {
      id: 1,
      numero: "123456778",
      empresa: "Empresa ABC S.A.",
      fase: 1,
      vencimiento: "15/03/2024",
      monto: "250.000",
      tipo: "Factura" as const,
    },
    {
      id: 2,
      numero: "987654321",
      empresa: "Comercial XYZ Ltda.",
      fase: 2,
      vencimiento: "22/03/2024",
      monto: "180.500",
      tipo: "Fac. exenta" as const,
    },
    {
      id: 3,
      numero: "456789123",
      empresa: "Servicios DEF SpA",
      fase: "Factura sin información",
      vencimiento: "28/03/2024",
      monto: "320.750",
      tipo: "Fac. de exportación" as const,
    },
    {
      id: 4,
      numero: "789123456",
      empresa: "Importadora GHI Ltda.",
      fase: 3,
      vencimiento: "05/04/2024",
      monto: "450.200",
      tipo: "N. de débito" as const,
    },
    {
      id: 5,
      numero: "321654987",
      empresa: "Exportaciones JKL S.A.",
      fase: 1,
      vencimiento: "12/04/2024",
      monto: "680.300",
      tipo: "N. de débito de exp." as const,
    },
    {
      id: 6,
      numero: "654321789",
      empresa: "Financiera MNO SpA",
      fase: 2,
      vencimiento: "18/04/2024",
      monto: "125.800",
      tipo: "Pagaré" as const,
    },
    {
      id: 7,
      numero: "159753468",
      empresa: "Comercial PQR Ltda.",
      fase: "Protestado",
      vencimiento: "25/04/2024",
      monto: "95.500",
      tipo: "Cheque protestado" as const,
    },
  ];

  // Funciones dummy
  const handleOpenInfo = (row: any) => {
    console.log("Mostrando información de:", row);
  };

  const handleCloseInfo = () => {
    console.log("Cerrando información");
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold flex items-center gap-2 ">
          <Clock2 className="w-4 h-4 text-orange-400" /> Cuenta por cobrar
        </span>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 rounded-full p-3 w-3 h-3 flex items-center justify-center">
          {dummyData.length}
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {dummyData.map((row) => (
          <ItemListPayment
            key={row.id}
            row={row}
            type="account-receivable"
            handleOpenInfo={handleOpenInfo}
            handleCloseInfo={handleCloseInfo}
          />
        ))}
      </div>
    </div>
  );
};

export default ListAccountReceivable;
