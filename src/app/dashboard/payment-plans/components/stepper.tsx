const StepperPN = ({
  number,
  is_active,
  title,
  description,
}: {
  number: number;
  is_active: boolean;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex justify-start items-center gap-2">
      <span
        className={`p-3 w-8 h-8 flex items-center justify-center  rounded-full text-md font-bold ${
          is_active
            ? "bg-orange-400 text-white"
            : "border border-orange-400 text-gray-400"
        }`}
      >
        {number}
      </span>
      <span className="border-b border-orange-400 w-full max-w-[20px]"></span>
      <div className="flex flex-col gap-0">
        <span className="text-black font-bold">{title}</span>
        <span className="text-gray-500 text-sm -mt-1">{description}</span>
      </div>
    </div>
  );
};

export default StepperPN;
