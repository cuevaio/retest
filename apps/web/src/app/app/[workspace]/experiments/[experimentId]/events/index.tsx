"use client";

import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

import { CheckSquareIcon, LineChartIcon } from "lucide-react";

import { AddEvent } from "./add-event";
import { EventCard } from "./event-card";

export const Events = () => {
  let { experimentId } = useParams<{ experimentId: string }>();
  let listEvents = trpc.listEvents.useQuery({ experimentId });

  if (!listEvents.data) {
    return null;
  }

  let events = listEvents.data;

  return (
    <div className="w-full rounded border">
      <div className="flex px-4 py-2 items-center text-primary bg-muted">
        <div className="flex-0">
          <LineChartIcon className="w-4 h-4 font-light" />
        </div>
        <p className="flex-grow px-3 font-bold">Events</p>
      </div>
      <div className="flex px-4 py-2 items-center border-t text-muted-foreground">
        <div className="flex-0">
          <CheckSquareIcon className="w-4 h-4 font-light" />
        </div>
        <p className="flex-grow px-3 text-sm">impressions</p>
      </div>
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
      <AddEvent />
    </div>
  );
};
