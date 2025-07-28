"use client";
import DisputeForm from "../dispute-form";

const DisputeEntry = ({ onClose }: { onClose: () => void }) => {

  return (
    <div className="fixed inset-0 bg-transparent backdrop:bg-transparent flex items-center justify-center z-50">
    <div className="bg-white rounded-md  w-full max-w-3xl relative p-6">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
       X
      </button>
      <DisputeForm />
    </div>
  </div>
  );
};

export default DisputeEntry;
