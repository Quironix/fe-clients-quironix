import React, { ReactNode } from "react";

interface DialogConfirmProps {
  title: ReactNode; 
  description: string;
  onConfirm: () => void;
}

const DialogConfirm: React.FC<DialogConfirmProps> = ({
  title,
  description,
  onConfirm,
}) => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      <div className="bg-white rounded-md p-6 max-w-md w-full shadow-lg text-center">
        <div id="dialog-title" className="mb-4 text-xl font-semibold">
          {title}
        </div>
        <p id="dialog-desc" className="mb-6 text-gray-700">
          {description}
              </p>
              <div className=" bg-[#FF8113] h-0.5 max-w-full"></div>

        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            autoFocus
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogConfirm;
