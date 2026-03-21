"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import LoaderTable from "../../components/loader-table";
import { ApiKey } from "../services/types";

interface ApiKeyTableProps {
  apiKeys: ApiKey[];
  loading: boolean;
  onEdit: (apiKey: ApiKey) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, newValue: boolean) => void;
}

const ApiKeyTable = ({
  apiKeys,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
}: ApiKeyTableProps) => {
  const t = useTranslations("integrations");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("apiKeys.table.name")}</TableHead>
          <TableHead>{t("apiKeys.table.description")}</TableHead>
          <TableHead>{t("apiKeys.table.expiresAt")}</TableHead>
          <TableHead>{t("apiKeys.table.lastUsed")}</TableHead>
          <TableHead>{t("apiKeys.table.status")}</TableHead>
          <TableHead>{t("apiKeys.table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <LoaderTable cols={7} />
        ) : (
          apiKeys.map((apiKey) => {
            const scopes = Array.isArray(apiKey.scopes)
              ? apiKey.scopes
              : typeof apiKey.scopes === "string"
              ? (apiKey.scopes as string).split(",").filter(Boolean)
              : [];
            return (
            <TableRow key={apiKey.id}>
              <TableCell className="font-medium">{apiKey.name}</TableCell>
              <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                {apiKey.description || "—"}
              </TableCell>
              <TableCell>{formatDate(apiKey.expires_at)}</TableCell>
              <TableCell>
                {apiKey.last_used_at
                  ? formatDate(apiKey.last_used_at)
                  : t("apiKeys.table.never")}
              </TableCell>
              <TableCell>
                <Switch
                  checked={apiKey.is_active}
                  onCheckedChange={(v) => onToggleActive(apiKey.id, v)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(apiKey)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default ApiKeyTable;
