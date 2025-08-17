import { Card } from "@/components/ui/card";
import React from "react";

const CardDashboard = ({
  icon,
  value,
  title,
  description,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  title: string;
  description?: React.ReactNode;
}) => {
  return (
    <Card className="p-3 h-full">
      <div className="flex flex-col items-start justify-start p-2 gap-1">
        <div className="flex flex-row items-center justify-start gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex flex-col items-start justify-start gap-1">
          <div className="text-2xl font-bold">{value}</div>
          {description && description}
        </div>
      </div>
    </Card>
  );
};

export default CardDashboard;
