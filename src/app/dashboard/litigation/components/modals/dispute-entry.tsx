"use client";
import DisputeForm from "../dispute-form";

const DisputeEntry = ({ onClose }: { onClose: () => void }) => {

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-md  w-full max-w-3xl relative p-6">
    
      <DisputeForm  onClose={onClose}/>
    </div>
  </div>
  );
};

export default DisputeEntry;
