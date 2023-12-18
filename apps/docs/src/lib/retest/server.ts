import {
  generateUseRetestServer,
  generateRetestBlockServer,
} from "@retestlabs/nextjs/server";

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

export const RetestBlockServer = generateRetestBlockServer(experiments);
export const useRetestServer = generateUseRetestServer(experiments);
