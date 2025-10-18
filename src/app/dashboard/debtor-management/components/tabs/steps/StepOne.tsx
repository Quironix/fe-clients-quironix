"use client";

interface StepOneProps {
  dataDebtor: any;
}

export const StepOne = ({ dataDebtor }: StepOneProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contenido del Paso 1</h3>
      <p className="text-gray-600">
        Aquí va el contenido del primer paso...
      </p>
      {/* TODO: Agregar componentes del paso 1 */}
    </div>
  );
};
