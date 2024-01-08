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

const eventTypes = [
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
type options = (typeof eventTypes)[number]["name"];

export const AddEvent = () => {
  let { experimentId } = useParams<{ experimentId: string }>();
  const { toast } = useToast();

  let [selectedEventType, setSelectedEventType] = React.useState<
    options | undefined
  >(undefined);

  let [openTypeModal, setOpenTypeModal] = React.useState(false);
  let [openFormModal, setOpenFormModal] = React.useState(false);

  let queryClient = useQueryClient();
  let listEvents = getQueryKey(trpc.listEvents, { experimentId }, "query");
  let createEvent = trpc.createEvent.useMutation({
    onSuccess: (data) => {
      setOpenFormModal(false);
      toast({
        title: "Event created",
        description: "ID: " + data.id,
      });
      queryClient.invalidateQueries(listEvents);
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

            <p className="flex-grow px-3 text-sm text-left">Add a event</p>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-0" side="right">
          <div className="">
            {eventTypes.map((eventType) => (
              <button
                onClick={() => {
                  setSelectedEventType(eventType.name);
                  setOpenTypeModal(false);
                  setOpenFormModal(true);
                }}
                key={eventType.name}
                className="w-full flex px-4 py-2 items-center text-muted-foreground hover:bg-muted"
              >
                <div className="flex-0">
                  <eventType.icon className="w-4 h-4 font-light" />
                </div>
                <p className="flex-grow px-3 text-sm text-left">
                  {eventType.name}
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

              if (!selectedEventType) {
                return;
              }
              createEvent.mutate({
                name,
                type: selectedEventType,
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
                value={selectedEventType}
                onValueChange={(value: options) => setSelectedEventType(value)}
              >
                <SelectTrigger className="w-full" name="type" id="type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent id="type">
                  {eventTypes.map((eventType) => (
                    <SelectItem key={eventType.name} value={eventType.name}>
                      {eventType.name}
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
                disabled={createEvent.isLoading}
                onClick={() => {
                  setOpenFormModal(false);
                }}
              >
                Back
              </Button>
              <Button type="submit" size="sm">
                Add event
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </>
  );
};
