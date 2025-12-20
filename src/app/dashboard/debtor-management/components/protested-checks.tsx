import { Separator } from "@/components/ui/separator";
import { Fragment } from "react";

const ProtestedChecks = ({ data }: { data: any[] }) => {
  return (
    <div className="space-y-4 px-3">
      {/* Tu contenido aquí */}
      {data.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-3">
          No hay cheques protestados.
        </p>
      )}

      {data.map((dt, index) => (
        <Fragment key={dt.id || index}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold">N°{dt.number}</h4>
              <p className="text-sm text-muted-foreground">${dt.amount}</p>
            </div>
            <div className="text-right">
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {dt.status}
              </span>
              <p className="text-sm text-muted-foreground mt-1">
                {dt.days} días
              </p>
            </div>
          </div>
          {index < data.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  );
};

export default ProtestedChecks;
