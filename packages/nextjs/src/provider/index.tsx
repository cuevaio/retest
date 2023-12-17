"use server";
import "server-only";

import * as React from "react";

import { ClientProviders } from "./client";

const RetestProvider = ({ children }: { children: React.ReactNode }) => {
  return <ClientProviders>{children}</ClientProviders>;
};

export { RetestProvider };
