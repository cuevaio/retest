import { cn } from "@retestlabs/utils/cn";
import { type ExperimentsRecord } from "@/lib/xata";
import { cva, type VariantProps } from "class-variance-authority";
import { formatDistance } from "date-fns";
import Link from "next/link";
import { Badge } from "@retestlabs/ui/badge";

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
    VariantProps<typeof experimentCardVariants> {
  workspaceHandle: string;
  workspace?: any;
  creator?: any;
}

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
  variantCount,
  workspaceHandle,
}: ExperimentCardProps) => {
  return (
    <div
      className={cn(experimentCardVariants({ variant }), {
        "bg-red-600/20 border-red-600 relative": variantCount === 0,
      })}
    >
      <Link
        href={
          `/app/${workspaceHandle}/experiments/` + id.replace("rec_", "exp_")
        }
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
      {variantCount === 0 && (
        <Badge variant="destructive" className="absolute top-4 right-4">
          0 Variants
        </Badge>
      )}
    </div>
  );
};

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
