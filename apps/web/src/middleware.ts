import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextMiddleware } from "next/server";

// @ts-ignore
export const { auth }: { auth: NextMiddleware } = NextAuth(authConfig);

export const middleware = auth;
