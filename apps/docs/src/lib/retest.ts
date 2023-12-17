import { generateRetestClient } from "@retestlabs/nextjs";

export const experiments = [
  {
    name: "mobile-hamburguer-icon-experiment",
    variants: ["variantA", "variantB"],
    events: ["eventA"],
  },
  {
    name: "skelteton-color-experiment",
    variants: ["variantX", "variantY"],
    events: ["eventX", "eventY", "eventZ"],
  },
] as const;

export const { useRetest, Experiment, Variant } =
  generateRetestClient(experiments);
