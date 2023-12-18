"use client";

import {
  generateUseRetestHook,
  generateRetestClientComponent,
} from "@retestlabs/nextjs/client";

export const experiments = [
  {
    name: "mobile-hamburguer-icon-experiment",
    variants: ["variantA", "variantB"],
    events: ["aaaa", "bbbb"],
  },
  {
    name: "signup-button-experiment",
    variants: ["border-90", "border-rounded"],
  },
  {
    name: "toast-animation-experiment",
    variants: ["green-toast", "red-toast"],
  },
] as const;

export const useRetest = generateUseRetestHook(experiments);
export const RetestClient = generateRetestClientComponent(experiments);
