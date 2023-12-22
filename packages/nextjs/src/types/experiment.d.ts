export type Experiment = {
  name: string;
  variants: readonly string[];
  events?: readonly string[] | undefined;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type ExperimentVariant = {
  experiment: string;
  startedAt: string;
  endedAt: string;
} & (
  | {
      variant: string;
      status: "running" | "completed";
    }
  | {
      variant: undefined;
      status: "scheduled";
    }
);
