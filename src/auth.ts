import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CustomSessionInterface } from "./types";
import { signIn as signInService } from "./app/(auth)/sign-in/services/auth.service";

interface AuthUser {
  token: string;
  email: string;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          const response = await signInService(
            credentials.email as string,
            credentials.password as any
          );

          if (!response?.token) {
            throw new Error("Credenciales inválidas");
          }

          return {
            token: response.token,
            email: credentials.email as string,
          };
        } catch (error: any) {
          console.error("Error en autenticación:", error);
          throw new Error(error?.message || "Error en la autenticación");
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      // return !!auth;

      return !!auth;
    },
    jwt({ token, user }: any) {
      if (user) {
        token.token = user.token;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }: any) {
      session.token = token.token;
      session.iat = token.iat;
      session.exp = token.exp;
      session.jti = token.jti;
      session.user = {
        email: token.email,
      };
      return session;
    },
  },
});
declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  // interface Session {
  //   user: DefaultSession['user'] & CustomSessionInterface;
  //   // user: CustomSessionInterface & DefaultSession['user'];
  // }

  interface Session extends CustomSessionInterface {}
}
