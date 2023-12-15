import {
  CheckSquare,
  HashIcon,
  LucideIcon,
  MoreHorizontalIcon,
  PenLineIcon,
  TimerIcon,
  TrashIcon,
} from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retestlabs/ui/popover";
import * as React from "react";
import { Label } from "@retestlabs/ui/label";
import { Input } from "@retestlabs/ui/input";
import { Button } from "@retestlabs/ui/button";
import { useToast } from "@retestlabs/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

export const MetricCard = ({
  name,
  type,
  id,
}: {
  name: string;
  type: string;
  id: string;
}) => {
  let { experimentId } = useParams<{ experimentId: string }>();
  let Icon: LucideIcon | undefined = undefined;
  let [open, setOpen] = React.useState(false);
  let [openRenamePopover, setOpenRenamePopover] = React.useState(false);
  let [openRemovePopover, setOpenRemovePopover] = React.useState(false);
  const { toast } = useToast();

  let queryClient = useQueryClient();
  let listMetrics = getQueryKey(trpc.listMetrics, { experimentId }, "query");

  let renameMetric = trpc.renameMetric.useMutation({
    onSuccess: (data) => {
      if (!data) {
        toast({
          title: "Error renaming metric",
        });
      }

      setOpenRenamePopover(false);
      toast({
        title: "Metric renamed",
      });
      queryClient.invalidateQueries(listMetrics);
    },
  });

  let removeMetric = trpc.deleteMetric.useMutation({
    onSuccess: (data) => {
      if (!data) {
        toast({
          title: "Error removing metric",
        });
      }

      setOpenRemovePopover(false);
      toast({
        title: "Metric removed",
      });
      queryClient.invalidateQueries(listMetrics);
    },
  });

  switch (type) {
    case "conversion":
      Icon = HashIcon;
      break;
    case "duration":
      Icon = TimerIcon;
      break;
    case "call":
      Icon = CheckSquare;
      break;
  }

  if (!Icon) {
    return null;
  }
  return (
    <div className="flex px-4 py-2 items-center border-t">
      <div className="flex-0">
        <Icon className="w-4 h-4" />
      </div>
      <p className="flex-grow px-3 text-sm">{name}</p>
      <div className="flex-0">
        <>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <MoreHorizontalIcon className="w-4 h-4" />
            </PopoverTrigger>
            <PopoverContent side="right" className="w-48 p-0">
              <div>
                <button
                  className="w-full flex px-4 py-2 items-center text-muted-foreground hover:bg-muted"
                  onClick={() => {
                    setOpenRenamePopover(true);
                    setOpen(false);
                  }}
                >
                  <div className="flex-0">
                    <PenLineIcon className="w-4 h-4" />
                  </div>
                  <p className="flex-grow px-3 text-sm text-left">
                    Rename metric
                  </p>
                </button>
                <button
                  className="w-full flex px-4 py-2 items-center text-destructive hover:bg-muted"
                  onClick={() => {
                    setOpenRemovePopover(true);
                    setOpen(false);
                  }}
                >
                  <div className="flex-0">
                    <TrashIcon className="w-4 h-4" />
                  </div>
                  <p className="flex-grow px-3 text-sm text-left">
                    Remove metric
                  </p>
                </button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={openRenamePopover} onOpenChange={setOpenRenamePopover}>
            <PopoverTrigger className="w-full h-0 p-0 m-0 flex invisible"></PopoverTrigger>
            <PopoverContent side="right" className="w-64 p-2">
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  let formData = new FormData(event.currentTarget);
                  let name = formData.get("name") as string;
                  renameMetric.mutate({ name, metricId: id });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required defaultValue={name} />
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setOpenRenamePopover(false);
                    }}
                    disabled={renameMetric.isLoading}
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

          <Popover open={openRemovePopover} onOpenChange={setOpenRemovePopover}>
            <PopoverTrigger className="w-full h-0 p-0 m-0 flex invisible"></PopoverTrigger>
            <PopoverContent side="right" className="w-64 p-2">
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  removeMetric.mutate({ metricId: id });
                }}
              >
                <Label htmlFor="back">
                  Are you sure you want to remove this metric?
                </Label>
                <div className="flex justify-between">
                  <Button
                    id="back"
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setOpenRemovePopover(false);
                    }}
                    disabled={removeMetric.isLoading}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" variant="destructive">
                    Remove metric
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </>
      </div>
    </div>
  );
};
