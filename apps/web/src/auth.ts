import NextAuth from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

import { XataAdapter } from "@/lib/xata-nextauth-adapter";

export const nextAuth = NextAuth({
  adapter: XataAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
});

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = nextAuth;

export const auth = () => nextAuth.auth();
