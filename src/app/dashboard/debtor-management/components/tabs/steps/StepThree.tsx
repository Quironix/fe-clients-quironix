"use client";

interface StepThreeProps {
  dataDebtor: any;
}

export const StepThree = ({ dataDebtor }: StepThreeProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Contenido del Paso 3</h3>
      <p className="text-gray-600">
        Aquí va el contenido del tercer paso...
      </p>
      {/* TODO: Agregar componentes del paso 3 */}
    </div>
  );
};
