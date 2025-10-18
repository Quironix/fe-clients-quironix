"use client";

interface StepTwoProps {
  dataDebtor: any;
}

export const StepTwo = ({ dataDebtor }: StepTwoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contenido del Paso 2</h3>
      <p className="text-gray-600">
        Aquí va el contenido del segundo paso...
      </p>
      {/* TODO: Agregar componentes del paso 2 */}
    </div>
  );
};
