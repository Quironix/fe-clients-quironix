import { AlertTriangle, CircleCheckBig, FileText, Scale } from "lucide-react";
import { TaskIsland } from "./task-island";
import { TaskItem } from "./task-item";

export const TasksList = () => {
  const riskTasks = [
    {
      code: "123597",
      name: "Deudor 1",
      incidents: 8,
      debt: "$453.119",
      status: "50% sin compromiso de pago",
      highlighted: true,
    },
    {
      code: "123597",
      name: "Lorem ipsum",
      incidents: 7,
      debt: "$45.253.119",
      status: "80% compromiso incumplido",
      highlighted: false,
    },
    {
      code: "123597",
      name: "Lorem ipsum",
      incidents: 8,
      debt: "$453.119",
      status: "50% sin compromiso de pago",
      highlighted: false,
    },
    {
      code: "123597",
      name: "Lorem ipsum",
      incidents: 7,
      debt: "$45.253.119",
      status: "80% compromiso incumplido",
      highlighted: false,
    },
    {
      code: "123597",
      name: "Lorem ipsum",
      incidents: 7,
      debt: "$45.253.119",
      status: "80% compromiso incumplido",
      highlighted: false,
    },
  ];

  const cashGenerationTasks = [
    {
      code: "123597",
      name: "Lorem ipsum",
      incidents: 8,
      debt: "$453.119",
      status: "50% sin compromiso de pago",
      highlighted: false,
    },
    {
      code: "123597",
      name: "Lorem ipsum",
      incidents: 7,
      debt: "$45.253.119",
      status: "80% compromiso incumplido",
      highlighted: false,
    },
  ];

  return (
    <div>
      <TaskIsland
        title="Riesgo / Crédito"
        icon={<AlertTriangle className="w-4 h-4" />}
        bgColor="bg-red-100"
        textColor="text-red-700"
      >
        {riskTasks.map((task, index) => (
          <TaskItem
            key={index}
            code={task.code}
            name={task.name}
            incidents={task.incidents}
            incidentsLabel="Incumplimientos"
            debt={task.debt}
            debtLabel="Deuda vencida"
            status={task.status}
            statusBgColor="bg-red-100"
            statusTextColor="text-red-700"
            highlighted={task.highlighted}
            borderColor="border-red-500"
          />
        ))}
      </TaskIsland>

      <TaskIsland
        title="Generación de caja"
        icon={<FileText className="w-4 h-4" />}
        bgColor="bg-orange-100"
        textColor="text-orange-700"
      >
        {cashGenerationTasks.map((task, index) => (
          <TaskItem
            key={index}
            code={task.code}
            name={task.name}
            incidents={task.incidents}
            incidentsLabel="Incumplimientos"
            debt={task.debt}
            debtLabel="Deuda vencida"
            status={task.status}
            statusBgColor="bg-red-100"
            statusTextColor="text-red-700"
            highlighted={task.highlighted}
            borderColor="border-orange-500"
          />
        ))}
      </TaskIsland>

      <TaskIsland
        title="Workflow de litigios"
        icon={<Scale className="w-4 h-4" />}
        bgColor="bg-yellow-100"
        textColor="text-yellow-700"
      >
        {cashGenerationTasks.map((task, index) => (
          <TaskItem
            key={index}
            code={task.code}
            name={task.name}
            incidents={task.incidents}
            incidentsLabel="Incumplimientos"
            debt={task.debt}
            debtLabel="Deuda vencida"
            status={task.status}
            statusBgColor="bg-red-100"
            statusTextColor="text-red-700"
            highlighted={task.highlighted}
            borderColor="border-orange-500"
          />
        ))}
      </TaskIsland>

      <TaskIsland
        title="Completadas"
        icon={<CircleCheckBig className="w-4 h-4" />}
        bgColor="bg-green-100"
        textColor="text-green-700"
      >
        {cashGenerationTasks.map((task, index) => (
          <TaskItem
            key={index}
            code={task.code}
            name={task.name}
            incidents={task.incidents}
            incidentsLabel="Incumplimientos"
            debt={task.debt}
            debtLabel="Deuda vencida"
            status={task.status}
            statusBgColor="bg-red-100"
            statusTextColor="text-red-700"
            highlighted={task.highlighted}
            borderColor="border-orange-500"
          />
        ))}
      </TaskIsland>
    </div>
  );
};
