export interface ApiKey {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  is_active: boolean;
  expires_at: string;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description: string;
  scopes: string[];
}

export interface UpdateApiKeyRequest {
  name?: string;
  description?: string;
  scopes?: string[];
  is_active?: boolean;
}

export interface CreateApiKeyResponse extends ApiKey {
  plain_key: string;
}
