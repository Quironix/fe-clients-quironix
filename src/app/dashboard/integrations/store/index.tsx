import { create } from "zustand";
import {
  fetchApiKeys as fetchApiKeysService,
  createApiKey as createApiKeyService,
  updateApiKey as updateApiKeyService,
  deleteApiKey as deleteApiKeyService,
} from "../services";
import { ApiKey, CreateApiKeyRequest, UpdateApiKeyRequest } from "../services/types";

interface ApiKeysStore {
  apiKeys: ApiKey[];
  loading: boolean;
  error: string | null;
  fetchApiKeys: (accessToken: string, clientId: string) => Promise<void>;
  createApiKey: (
    payload: CreateApiKeyRequest,
    accessToken: string,
    clientId: string
  ) => Promise<string>;
  updateApiKey: (
    id: string,
    payload: UpdateApiKeyRequest,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
  deleteApiKey: (
    id: string,
    accessToken: string,
    clientId: string
  ) => Promise<void>;
}

export const useApiKeysStore = create<ApiKeysStore>((set, get) => ({
  apiKeys: [],
  loading: false,
  error: null,

  fetchApiKeys: async (accessToken: string, clientId: string) => {
    set({ loading: true, error: null });
    try {
      const apiKeys = await fetchApiKeysService(accessToken, clientId);
      set({ apiKeys, loading: false });
    } catch (error) {
      set({ error: "Error al obtener API keys", loading: false, apiKeys: [] });
    }
  },

  createApiKey: async (
    payload: CreateApiKeyRequest,
    accessToken: string,
    clientId: string
  ) => {
    set({ loading: true, error: null });
    try {
      const response = await createApiKeyService(payload, accessToken, clientId);
      const { plain_key, ...apiKey } = response;
      set((state) => ({ apiKeys: [...state.apiKeys, apiKey], loading: false }));
      return plain_key;
    } catch (error) {
      set({ error: "Error al crear API key", loading: false });
      throw error;
    }
  },

  updateApiKey: async (
    id: string,
    payload: UpdateApiKeyRequest,
    accessToken: string,
    clientId: string
  ) => {
    set({ loading: true, error: null });
    try {
      await updateApiKeyService(id, payload, accessToken, clientId);
    } catch (error) {
      set({ error: "Error al actualizar API key", loading: false });
      throw error;
    } finally {
      get().fetchApiKeys(accessToken, clientId);
    }
  },

  deleteApiKey: async (
    id: string,
    accessToken: string,
    clientId: string
  ) => {
    set({ loading: true, error: null });
    try {
      await deleteApiKeyService(id, accessToken, clientId);
    } catch (error) {
      set({ error: "Error al eliminar API key", loading: false });
      throw error;
    } finally {
      get().fetchApiKeys(accessToken, clientId);
    }
  },
}));
