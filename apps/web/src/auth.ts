import NextAuth from "next-auth";
import { XataAdapter } from "@/lib/xata-nextauth-adapter";
import authConfig from "./auth.config";

export const nextAuth = NextAuth({
  adapter: XataAdapter(),
  session: { strategy: "jwt" },
  ...authConfig,
});

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = nextAuth;

export const auth = () => nextAuth.auth()
