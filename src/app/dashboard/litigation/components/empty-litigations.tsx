const EmptyLitigations = () => {
  return (
    <div className="mt-2 bg-slate-200 rounded-md py-4 px-3 flex flex-col items-start">
      <span className="text-sm font-bold text-black">Litigios ingresados</span>
      <span className="text-md text-black">
        No hay litigios ingresados con anterioridad
      </span>
    </div>
  );
};

export default EmptyLitigations;
