"use client";

import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

import { CheckSquareIcon, LineChartIcon } from "lucide-react";
import { VariantCard } from "./variant-card";
import { AddVariant } from "./add-variant";

export const Variants = () => {
  let { experimentId } = useParams<{ experimentId: string }>();
  let listVariants = trpc.listVariants.useQuery({ experimentId });

  if (!listVariants.data) {
    return null;
  }

  let variants = listVariants.data;

  return (
    <div className="w-full rounded border">
      <div className="flex px-4 py-2 items-center text-primary bg-muted">
        <div className="flex-0">
          <LineChartIcon className="w-4 h-4 font-light" />
        </div>
        <p className="flex-grow px-3 font-bold">Variants</p>
      </div>
      {variants.map((variant) => (
        <VariantCard key={variant.id} {...variant} />
      ))}
      <AddVariant />
    </div>
  );
};
