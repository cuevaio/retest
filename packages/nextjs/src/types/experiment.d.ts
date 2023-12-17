export type Experiment = readonly {
  name: readonly string;
  variants: readonly string[];
  events: readonly string[];
};
