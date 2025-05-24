export interface User {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  type: string;
  roles: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}
