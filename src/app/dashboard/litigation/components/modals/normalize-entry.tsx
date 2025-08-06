"use client";
import NormalizeForm from "../normalize-form";

const NormalizeEntry = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md w-full max-w-3xl relative py-6 px-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          X
        </button>
        <NormalizeForm />
      </div>
    </div>
  );
};

export default NormalizeEntry;