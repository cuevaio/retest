import { cn } from "@retestlabs/utils/cn";
import { type ExperimentsRecord } from "@/lib/xata";
import { cva, type VariantProps } from "class-variance-authority";
import { formatDistance } from "date-fns";
import Link from "next/link";

const experimentCardVariants = cva("p-4 rounded-lg border", {
  variants: {
    variant: {
      active: "border-primary/40 bg-primary/10",
      upcoming: "border-green-800/50 bg-green-800/10",
      past: "border-secondary/90 bg-secondary/20",
    },
  },
  defaultVariants: {
    variant: "active",
  },
});

export interface ExperimentCardProps
  extends ExperimentsRecord,
    VariantProps<typeof experimentCardVariants> {}

const getExperimentStatus = (variant: string): string => {
  if (variant === "active") {
    return "Ends";
  } else if (variant === "upcoming") {
    return "Starts";
  } else {
    return "Ended";
  }
};

export const ExperimentCard = ({
  id,
  name,
  sampleSizeAbsolute,
  endedAt,
  variant,
  startedAt,
}: ExperimentCardProps) => {
  return (
    <div className={cn(experimentCardVariants({ variant }))}>
      <Link
        href={"/app/experiments/" + id.replace("rec_", "exp_")}
        className="font-bold text-lg hover:underline"
      >
        {name}
      </Link>
      <div className="grid grid-cols-3 text-sm py-4">
        <p className="tabular-nums">
          {getRandomInt(sampleSizeAbsolute || 1000)} users
        </p>
        <p className="tabular-nums">{getRandomInt(200)} signups</p>
        <p className="tabular-nums">{getRandomInt(50)} purchases</p>
      </div>
      <p className="text-xs">
        {variant && getExperimentStatus(variant)}{" "}
        {endedAt && startedAt
          ? formatDistance(
              variant === "upcoming" ? startedAt : endedAt,
              new Date(),
              {
                addSuffix: true,
              },
            )
          : "xd"}
      </p>
    </div>
  );
};

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
