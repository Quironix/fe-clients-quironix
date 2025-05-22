import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CustomSessionInterface } from "./types";
import {
  getUserProfile,
  signIn as signInService,
} from "./app/(auth)/sign-in/services/auth.service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const response = await signInService(
            credentials.email as string,
            credentials.password as any
          );

          const userProfile = await getUserProfile(response.token);
          const user = { ...userProfile, token: response.token };

          if (!user) {
            throw new Error("Credenciales inválidas");
          }

          return user;
        } catch (error: any) {
          console.log("ERROR", error);
          throw new Error(error);
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
        token.session = user;
      }

      return token;
    },
    session({ session, token }: any) {
      session.token = token.session.token;
      session.iat = token.iat;
      session.exp = token.exp;
      session.jti = token.jti;
      session.user = {
        id: token.session.id,
        email: token.session.email,
        name: token.session.name,
        last_name: token.session.last_name,
        type: token.session.type,
        role: token.session.role,
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
