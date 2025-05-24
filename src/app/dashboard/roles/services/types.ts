export interface Role {
  id?: string;
  name: string;
  description: string;
  scopes: Scope[] | string[];
  created_at?: string;
  updated_at?: string;
}

export interface Scope {
  id?: string;
  role_id?: string;
  resource_id?: string;
  can_view?: boolean;
  can_edit?: boolean;
  can_delete?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminResources {
  id: string;
  name: string;
  description: string;
  key: string;
  created_at?: string;
  updated_at?: string;
}
