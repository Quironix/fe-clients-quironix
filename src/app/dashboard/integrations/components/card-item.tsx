"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CardItemProps {
  image: string;
  buttonText: string;
  onButtonClick: () => void;
  title: string;
  description: string;
}

const CardItem: React.FC<CardItemProps> = ({
  image,
  buttonText,
  onButtonClick,
  title,
  description,
}) => {
  return (
    <div className="w-full bg-white border border-gray-300 rounded-lg flex items-center px-4 py-4 gap-8 shadow-sm">
      <div
        className="flex-shrink-0 flex items-center justify-center"
        style={{ minWidth: 300 }}
      >
        <Image src={image} alt={title} width={300} height={300} />
      </div>
      <div className="flex flex-col flex-1 justify-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <p className="text-base text-gray-600">{description}</p>
        </div>
        <Button
          className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded transition-colors duration-200 max-w-96"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default CardItem;
