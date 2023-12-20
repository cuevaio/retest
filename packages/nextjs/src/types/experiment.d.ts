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
  variant: string;
  startedAt: string;
  endedAt: string;
};
