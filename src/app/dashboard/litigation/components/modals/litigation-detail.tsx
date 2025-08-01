import { SquareUserRound, Building, FileText, FolderTree, Calendar, User, MessageSquare, X } from "lucide-react";
import Image from 'next/image';
import { Litigation } from "../../types";

interface LitigationDetailProps {
    open: boolean;
    litigation: Litigation | null;
    onOpenChange: (open: boolean) => void;
  }
  
  
  const LitigationDetail = ({ open, litigation, onOpenChange }: LitigationDetailProps) => {
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center gap-4 justify-center z-50 text-start">
        <div className="bg-white rounded-md  w-full max-w-3xl relative py-12 px-6">
        <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 hover:text-black"
          >
            <X />
          </button>
  
          <div className="my-4">
            <h2 className="text-lg font-bold text-gray-800">Detalle del litigio</h2>
            <p className="text-lg font-bold text-gray-800">
              Factura N° {litigation?.invoice.number || "Desconocido"}
            </p>
          </div>
  
          <div className="grid grid-cols-2 gap-4 bg-[#EDF2F7] px-4 py-3 my-2 rounded-md">
            <div className="flex items-center">
              <div className="items-center mr-2">
                <Image
                  src="/img/dollar-sign.svg"
                  alt="Signo pesos"
                  width={6}
                  height={6}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <p>Monto Factura</p>
                <p className="text-[#2F6EFF] font-bold text-2xl">
                  $ {litigation?.invoice.amount ?? "..."}
                </p>
              </div>
            </div>
  
            <div>
              <p className="text-sm text-gray-600">Monto litigio</p>
              <p className="text-[#2F6EFF] font-bold text-2xl">
                ${litigation?.litigation_amount ?? "..."}
              </p>
            </div>
          </div>
  
          <div className=" bg-[#CBD5E1] h-0.5 max-w-full my-4"></div>
  
          <div className="grid grid-cols-2 gap-6 text-sm text-gray-800">
            <div className="flex items-center gap-2">
              <SquareUserRound />
              <div>
                <p className="text-sm ">RUT</p>
                <p className="text-lg">{litigation?.debtor.dni_id ?? "Desconocido"}</p>
              </div>
            </div>
  
            <div className="flex items-center gap-2">
              <Building />
              <div>
                <p className="text-sm ">Razón social</p>
                <p className="text-lg">{litigation?.debtor.name ?? "Razon social"}</p>
              </div>
            </div>
  
            <div className="flex items-center gap-2">
            
              <FileText />
                <p className="text-sm ">Motivo</p>
                <p className="text-md border-2 border-[#038E06] text-[#038E06] px-2 py-.5 rounded-xl font-medium">
                  {litigation?.motivo ?? "Motivo"}
                </p>
            </div>
  
            <div className="flex items-center gap-2">
              <FolderTree />
              <div>
                <p className="text-sm ">Submotivo</p>
                <p className="text-lg">{litigation?.submotivo ?? "Submotivo"}</p>
              </div>
            </div>
  
            <div className="flex items-center gap-2">
              <Calendar />
              <div>
                <p className="text-sm ">Fecha</p>
                <p className="text-lg">
                  <span className="font-semibold">{litigation?.date ?? "Fecha"}</span>
                </p>
              </div>
            </div>
  
            <div className="flex items-center gap-2">
              <User />
              <div>
                <p className="text-sm ">Contacto</p>
                <p className="text-lg">{litigation?.number ?? "Contacto"}</p>
              </div>
            </div>
          </div>
  
          <div className="flex items-center gap-2 border-2 border-[#EDF2F7] rounded-md p-4 text-sm my-4">
            <MessageSquare />
            <div>
              <p className="font-medium text-sm mb-1">Comentario</p>
              <p className="text-lg">{litigation?.comment ?? "Sin comentario."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default LitigationDetail;
  