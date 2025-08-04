import { InfoIcon } from "lucide-react";
import React from "react";

const CommentAlert = ({
  comment,
  cta = null,
}: {
  comment: React.ReactNode;
  cta?: React.ReactNode;
}) => {
  return (
    <div className="border border-blue-300 bg-white rounded-lg p-4 w-full">
      <div className="flex items-center gap-2 mb-2">
        <InfoIcon className="w-4 h-4 text-blue-600" />
        <span className="text-md font-bold text-blue-600">Comentario</span>
      </div>
      <div className="flex items-center justify-between gap-2 w-full">
        <span className="text-xs">{comment}</span>
        {cta && <div className="flex items-center gap-2">{cta}</div>}
      </div>
    </div>
  );
};

export default CommentAlert;
