export interface CustomSessionInterface {
  user: User;
  expires: Date;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface User {
  id: string;
  name: string;
  last_name: string;
  email: string;
  phone_number: string;
  type: string;
  roles: any[];
  created_at: string;
  updated_at: string;
}
