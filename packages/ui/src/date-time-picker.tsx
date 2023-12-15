"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ClockIcon } from "lucide-react";

import { cn } from "@retestlabs/utils/cn";
import { Button } from "@retestlabs/ui/button";
import { Calendar } from "@retestlabs/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retestlabs/ui/popover";
import { TimePickerInput } from "./time-picker/input";
import { Label } from "@retestlabs/ui/label";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: any;
  id: string | undefined;
}

export function DateTimePicker({ date, setDate, id }: DateTimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);

  let [dt, setDt] = React.useState<Date | undefined>();
  React.useEffect(() => {
    setDt(date);
  }, []);

  React.useEffect(() => {
    setDate(dt);
  }, [dt, setDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal tabular-nums",
            !dt && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dt ? format(dt, "PPP HH:mm:ss") : <span>Pick a dt</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dt}
          onSelect={(selectedDate) => {
            if (selectedDate && dt) {
              selectedDate.setHours(dt.getHours());
              selectedDate.setMinutes(dt.getMinutes());
              selectedDate.setSeconds(dt.getSeconds());
            }
            setDt(selectedDate);
          }}
        />
        <div className="border-t border-border flex justify-between">
          <div className="flex items-end gap-2 p-3">
            <div className="grid gap-1 text-center">
              <Label htmlFor="hours" className="text-xs">
                H
              </Label>
              <TimePickerInput
                picker="hours"
                date={dt}
                setDate={setDt}
                ref={hourRef}
                onRightFocus={() => minuteRef.current?.focus()}
              />
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="minutes" className="text-xs">
                M
              </Label>
              <TimePickerInput
                picker="minutes"
                date={dt}
                setDate={setDt}
                ref={minuteRef}
                onLeftFocus={() => hourRef.current?.focus()}
                onRightFocus={() => secondRef.current?.focus()}
              />
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="seconds" className="text-xs">
                S
              </Label>
              <TimePickerInput
                picker="seconds"
                date={dt}
                setDate={setDt}
                ref={secondRef}
                onLeftFocus={() => minuteRef.current?.focus()}
              />
            </div>
          </div>
          <div className="flex items-end gap-2 p-3">
            <div className="grid gap-1 text-center">
              <Label htmlFor="seconds" className="text-xs">
                T
              </Label>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  let now = new Date();
                  if (dt) {
                    now.setFullYear(dt.getFullYear());
                    now.setMonth(dt.getMonth());
                    now.setDate(dt.getDate());
                  }
                  setDt(now);
                }}
                className="w-8 h-8"
              >
                <ClockIcon className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid gap-1 text-center">
              <Label htmlFor="seconds" className="text-xs">
                D
              </Label>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  let now = new Date();
                  if (dt) {
                    now.setHours(dt.getHours());
                    now.setMinutes(dt.getMinutes());
                    now.setSeconds(dt.getSeconds());
                  }
                  setDt(now);
                }}
                className="w-8 h-8"
              >
                <CalendarIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
