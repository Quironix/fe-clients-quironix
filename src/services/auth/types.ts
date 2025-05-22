export interface SignUpValues {
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  last_name: string;
  company_name: string;
}

export interface SignInProps {
  email: string;
  password: string;
}
