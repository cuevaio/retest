export type Experiment = {
  name: string;
  variants: readonly string[];
  events?: readonly string[] | undefined;
};

export type ExperimentToVariantMap<Experiments extends readonly Experiment[]> =
  {
    [K in Experiments[number]["name"]]: Extract<
      Experiments[number],
      { name: K }
    >["variants"][number];
  };

export type ExperimentToEventMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  > extends { events: infer E }
    ? E extends readonly string[]
      ? E[number]
      : never
    : never;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
