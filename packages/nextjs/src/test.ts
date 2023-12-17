import { generateUseRetest } from "./useRetest";

const experiments = [
  {
    name: "experiment1",
    variants: ["variantA", "variantB", "variantC"],
    events: ["eventA", "eventB", "eventC"],
  },
  {
    name: "experiment2",
    variants: ["variantX", "variantY", "variantZ"],
    events: ["eventX", "eventY", "eventZ"],
  },
] as const;

const useRetest = generateUseRetest<typeof experiments>();

const { trackEvent: trackEventExp1, variant } = useRetest("experiment1"); // OK
trackEventExp1("eventA"); // OK
