import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef } from "@tanstack/react-table";

type ClientType = "FACTORING" | "NORMAL" | "ANY";

export type ColumnsByClientType<T> = ColumnDef<T> & {
  clientType?: ClientType;
};

export function useDataTableByClientType<T>(
  columns: ColumnsByClientType<T>[]
): ColumnsByClientType<T>[] {
  const { profile } = useProfileContext();
  const clientType = profile?.client?.type;

  switch (clientType) {
    case "FACTORING":
      return columns.filter(
        (col) => col.clientType === "FACTORING" || col.clientType === "ANY"
      );
    case "NORMAL":
      return columns.filter(
        (col) => col.clientType === "NORMAL" || col.clientType === "ANY"
      );
    default:
      return columns;
  }
}
