"use client";
import { MessageSquare, SquareUserRound, Building, Calendar, FileText, FolderTree, User } from "lucide-react";
import Image from 'next/image';

const LitigationDetail = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center gap-2 justify-center z-50 text-start">
    <div className="bg-white rounded-md  w-full max-w-3xl relative py-12 px-6">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
       X
      </button>

      <div className="my-4">
            <h2 className="text-lg font-bold text-gray-800">Detalle del litigio</h2>
            <p className="text-lg font-bold text-gray-800">Factura N° 12345678</p>
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
                  <p className="text-[#2F6EFF] font-bold text-2xl">$ {"..."}</p>
                </div>
              </div>
  
            <div>
                <p className="text-sm text-gray-600">Monto litigio</p>
                <p className="text-[#2F6EFF] font-bold text-2xl">$100.000</p>
            </div>
        </div>

              <div className=" bg-[#CBD5E1] h-0.5 max-w-full my-3"></div>

          <div className="grid grid-cols-2 gap-6 text-sm text-gray-800">
            <div className="flex items-center gap-2">
              <SquareUserRound/>
              <div>
                <p className="text-xs text-gray-500">RUT</p>
                <p>60.123.123-2</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Building/>
              <div>
                <p className="text-xs text-gray-500">Razón social</p>
                <p>Nombre Empresa</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText/>
                <p className="text-xs text-gray-500">Motivo</p>
                <p>
                  <p className="border-2 border-[#038E06] text-[#038E06] px-.5 py-1 rounded-md text-xs font-medium">
                    Fac. Comercial
                  </p>
                </p>
            </div>

            <div className="flex items-center gap-2">
              <FolderTree/>
              <div>
                <p className="text-xs text-gray-500">Submotivo</p>
                <p>No emitida</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar/>
              <div>
                <p className="text-xs text-gray-500">Fecha</p>
                <p>
                  <span className="font-semibold">12/04/2025</span>, 19:30 hr.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User/>
              <div>
                <p className="text-xs text-gray-500">Contacto</p>
                <p>Nombre Apellido</p>
              </div>
            </div>
          </div>

              <div className="flex items-center gap-2 border-2 border-[#EDF2F7] rounded-md p-4 text-sm text-gray-700 my-3">
              <MessageSquare />
                  <div>
                      
            <p className="font-medium text-xs mb-1 text-gray-600">Comentario</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
                  </div>
          </div>
      </div>
    </div>
  );
};

export default LitigationDetail;
