"use client";

import * as React from "react";
import { getQueryKey } from "@trpc/react-query";

import { Input } from "@retestlabs/ui/input";
import { Label } from "@retestlabs/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retestlabs/ui/popover";
import { CheckSquareIcon, HashIcon, PlusIcon, TimerIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@retestlabs/ui/select";
import { Button } from "@retestlabs/ui/button";
import { trpc } from "@/lib/trpc";
import { useToast } from "@retestlabs/ui/use-toast";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const metricTypes = [
  {
    name: "conversion",
    icon: HashIcon,
  },
  {
    name: "duration",
    icon: TimerIcon,
  },
  {
    name: "call",
    icon: CheckSquareIcon,
  },
] as const;

// use ts types to extract all the names
type options = (typeof metricTypes)[number]["name"];

export const AddMetric = () => {
  let { experimentId } = useParams<{ experimentId: string }>();
  const { toast } = useToast();

  let [selectedMetricType, setSelectedMetricType] = React.useState<
    options | undefined
  >(undefined);

  let [openTypeModal, setOpenTypeModal] = React.useState(false);
  let [openFormModal, setOpenFormModal] = React.useState(false);

  let queryClient = useQueryClient();
  let listMetrics = getQueryKey(trpc.listMetrics, { experimentId }, "query");
  let createMetric = trpc.createMetric.useMutation({
    onSuccess: (data) => {
      setOpenFormModal(false);
      toast({
        title: "Metric created",
        description: "ID: " + data.id,
      });
      queryClient.invalidateQueries(listMetrics);
    },
  });

  return (
    <>
      <Popover open={openTypeModal} onOpenChange={setOpenTypeModal}>
        <PopoverTrigger className="w-full">
          <div className="w-full flex px-4 py-2 border-t items-center text-primary">
            <div className="flex-0">
              <PlusIcon className="w-4 h-4 font-light" />
            </div>

            <p className="flex-grow px-3 text-sm text-left">Add a metric</p>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-0" side="right">
          <div className="">
            {metricTypes.map((metricType) => (
              <button
                onClick={() => {
                  setSelectedMetricType(metricType.name);
                  setOpenTypeModal(false);
                  setOpenFormModal(true);
                }}
                key={metricType.name}
                className="w-full flex px-4 py-2 items-center text-muted-foreground hover:bg-muted"
              >
                <div className="flex-0">
                  <metricType.icon className="w-4 h-4 font-light" />
                </div>
                <p className="flex-grow px-3 text-sm text-left">
                  {metricType.name}
                </p>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={openFormModal} onOpenChange={setOpenFormModal}>
        <PopoverTrigger className="w-full h-0 p-0 m-0 flex invisible"></PopoverTrigger>
        <PopoverContent className="w-64 p-2" side="right">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              let formData = new FormData(event.currentTarget);
              let name = formData.get("name") as string;

              if (!selectedMetricType) {
                return;
              }
              createMetric.mutate({
                name,
                type: selectedMetricType,
                experimentId,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={selectedMetricType}
                onValueChange={(value: options) => setSelectedMetricType(value)}
              >
                <SelectTrigger className="w-full" name="type" id="type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent id="type">
                  {metricTypes.map((metricType) => (
                    <SelectItem key={metricType.name} value={metricType.name}>
                      {metricType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={createMetric.isLoading}
                onClick={() => {
                  setOpenFormModal(false);
                }}
              >
                Back
              </Button>
              <Button type="submit" size="sm">
                Add metric
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </>
  );
};
