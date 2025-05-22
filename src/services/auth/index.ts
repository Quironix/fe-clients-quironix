import { SignInProps, SignUpValues } from "./types";

export const signUp = async (signUpData: SignUpValues) => {
  // CHANGE TO AXIOS

  // if (error) {
  //   const errorResponse = await error.context.json();
  //   throw new Error(errorResponse.message);
  // }

  return {};
};

export const signIn = async (signInData: SignInProps) => {
  const { email, password } = signInData;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error de autenticación");
  }

  return data;
};
