"use client";

import * as React from "react";
import { Label } from "@retestlabs/ui/label";
import { InputHint } from "@/components/input-hint";

import { DateTimePicker } from "@retestlabs/ui/date-time-picker";

export const DurationInput = () => {
  let [startedAt, setStartedAt] = React.useState<Date | undefined>(new Date());
  let [endedAt, setEndedAt] = React.useState<Date | undefined>(() => {
    let date = new Date();
    date.setDate(date.getDate() + 14);
    return date;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Duration</Label>
        <InputHint>
          How long do you want to run the experiment? We recommend at least 2
          weeks to account for weekly fluctuations.
        </InputHint>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col space-y-1">
          <Label htmlFor="experiment-started-at" className="text-xs">
            Start date
          </Label>
          <DateTimePicker
            date={startedAt}
            setDate={setStartedAt}
            id="experiment-started-at"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <Label htmlFor="experiment-ended-at" className="text-xs">
            End date
          </Label>
          <DateTimePicker
            date={endedAt}
            setDate={setEndedAt}
            id="experiment-ended-at"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground tabular-nums">
        {endedAt && startedAt
          ? `${Math.round(
              (endedAt.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24),
            )} days`
          : "Choose a start and end date"}
      </p>
      <div className="hidden">
        <input
          type="text"
          value={startedAt?.toISOString() || ""}
          onChange={(e) => {
            setStartedAt(new Date(e.target.value));
          }}
          name="experiment-startedAt"
        />
        <input
          type="text"
          value={endedAt?.toISOString() || ""}
          onChange={(e) => {
            setEndedAt(new Date(e.target.value));
          }}
          name="experiment-endedAt"
        />
      </div>
    </div>
  );
};
