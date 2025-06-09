"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const CreateManual = ({
  title,
  description,
  buttonText,
  buttonLink,
}: {
  title: React.ReactNode;
  description: string;
  buttonText: string;
  buttonLink: string;
}) => {
  const router = useRouter();
  return (
    <div className="w-full h-full min-h-full border border-gray-200 rounded-md p-3 space-y-4">
      <h2 className="text-lg font-bold border-b border-gray-300 pb-2">
        {title}
      </h2>
      <div className="flex flex-col items-center justify-center w-full">
        <span className="text-sm text-gray-500">{description}</span>
        <Button
          className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
          onClick={() => router.push(buttonLink)}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default CreateManual;
