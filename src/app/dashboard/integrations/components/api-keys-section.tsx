"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProfileContext } from "@/context/ProfileContext";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DialogConfirm from "../../components/dialog-confirm";
import DialogForm from "../../components/dialog-form";
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from "../services/types";
import { useApiKeysStore } from "../store";
import ApiKeyEditForm from "./api-key-edit-form";
import ApiKeyForm from "./api-key-form";
import ApiKeyRevealModal from "./api-key-reveal-modal";
import ApiKeyTable from "./api-key-table";

type CreateApiKeyFormValues = {
  name: string;
  description?: string;
  scopes: string[];
};

type UpdateApiKeyFormValues = {
  name: string;
  description?: string;
  scopes: string[];
  is_active: boolean;
};

const ApiKeysSection = () => {
  const t = useTranslations("integrations");
  const { profile, session } = useProfileContext();
  const { apiKeys, loading, fetchApiKeys, createApiKey, updateApiKey, deleteApiKey } =
    useApiKeysStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState<string | null>(null);

  const userScopes: string[] =
    profile?.roles?.flatMap((role: { scopes?: string[] }) => role.scopes || []) || [];

  const hasApiKeyAccess = userScopes.some(
    (s: string) => s.split(":")[0] === "client.settings.api-keys"
  );

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchApiKeys(session.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

  const canCreate = apiKeys.length === 0;

  const handleCreate = async (data: CreateApiKeyFormValues) => {
    try {
      const payload: CreateApiKeyRequest = {
        name: data.name,
        description: data.description || "",
        scopes: data.scopes,
      };
      const plainKey = await createApiKey(payload, session?.token, profile?.client?.id);
      setRevealKey(plainKey);
      setIsCreateDialogOpen(false);
      toast.success(t("apiKeys.createSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("apiKeys.createError"));
    }
  };

  const handleEdit = (apiKey: ApiKey) => {
    setEditingKey(apiKey);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: UpdateApiKeyFormValues) => {
    if (!editingKey) return;
    try {
      const payload: UpdateApiKeyRequest = {
        name: data.name,
        description: data.description,
        scopes: data.scopes,
        is_active: data.is_active,
      };
      await updateApiKey(editingKey.id, payload, session?.token, profile?.client?.id);
      toast.success(t("apiKeys.updateSuccess"));
      setIsEditDialogOpen(false);
      setEditingKey(null);
    } catch (error: any) {
      toast.error(error.message || t("apiKeys.updateError"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingKeyId) return;
    try {
      await deleteApiKey(deletingKeyId, session?.token, profile?.client?.id);
      toast.success(t("apiKeys.deleteSuccess"));
      setIsDeleteDialogOpen(false);
      setDeletingKeyId(null);
    } catch (error: any) {
      toast.error(error.message || t("apiKeys.deleteError"));
    }
  };

  const handleToggleActive = async (id: string, newValue: boolean) => {
    try {
      await updateApiKey(id, { is_active: newValue }, session?.token, profile?.client?.id);
    } catch {
      toast.error(t("apiKeys.updateError"));
    }
  };

  const deletingKeyName =
    apiKeys.find((k) => k.id === deletingKeyId)?.name || "";

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{t("apiKeys.sectionTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("apiKeys.sectionDescription")}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  disabled={!canCreate}
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-orange-500 text-white hover:bg-orange-400"
                >
                  {t("apiKeys.createButton")}
                </Button>
              </span>
            </TooltipTrigger>
            {!canCreate && (
              <TooltipContent>
                <p>{t("apiKeys.maxKeysTooltip")}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      {apiKeys.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground">{t("apiKeys.emptyMessage")}</p>
      ) : (
        <Card className="p-4">
          <ApiKeyTable
            apiKeys={apiKeys}
            loading={loading}
            onEdit={handleEdit}
            onDelete={(id) => {
              setDeletingKeyId(id);
              setIsDeleteDialogOpen(true);
            }}
            onToggleActive={handleToggleActive}
          />
        </Card>
      )}

      <DialogForm
        title={t("apiKeys.createTitle")}
        description={t("apiKeys.createDescription")}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        trigger={<span />}
      >
        <ApiKeyForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateDialogOpen(false)}
        />
      </DialogForm>

      <DialogForm
        title={t("apiKeys.editTitle")}
        description={t("apiKeys.editDescription")}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        trigger={<span />}
      >
        {editingKey && (
          <ApiKeyEditForm
            defaultValues={editingKey}
            onSubmit={handleEditSubmit}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingKey(null);
            }}
          />
        )}
      </DialogForm>

      <DialogConfirm
        type="danger"
        title={t("apiKeys.deleteTitle")}
        description={t("apiKeys.deleteDescription", { name: deletingKeyName })}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setDeletingKeyId(null);
        }}
      />

      {revealKey && (
        <ApiKeyRevealModal
          plainKey={revealKey}
          onClose={() => setRevealKey(null)}
        />
      )}
    </section>
  );
};

export default ApiKeysSection;
