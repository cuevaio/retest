"use client";

import * as React from "react";

import { Slider } from "@retestlabs/ui/slider";
import { Label } from "@retestlabs/ui/label";
import { Input } from "@retestlabs/ui/input";
import { InputHint } from "@/components/input-hint";
import { RadioGroup, RadioGroupItem } from "@retestlabs/ui/radio-group";

export const SampleSizeInput = () => {
  let [typeOfSampleSize, setTypeOfSampleSize] = React.useState("relative");
  let [relativeSize, setRelativeSize] = React.useState([5]);
  let [absoluteSize, setAbsoluteSize] = React.useState(1000);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label
          htmlFor={
            typeOfSampleSize === "relative"
              ? "experiment-sampleSizeRelative"
              : "experiment-sampleSizeAbsolute"
          }
        >
          Sample size
        </Label>
        <InputHint>
          How many users do you want to include in the experiment? We recommend
          at least 1000.
        </InputHint>
      </div>
      <RadioGroup value={typeOfSampleSize} onValueChange={setTypeOfSampleSize}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="relative" id="relative" />
          <Label htmlFor="relative" className="text-xs">
            Relative
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="absolute" id="absolute" />
          <Label htmlFor="absolute" className="text-xs">
            Absolute
          </Label>
        </div>
      </RadioGroup>

      {typeOfSampleSize === "relative" ? (
        <div className="flex space-x-4">
          <Slider
            value={relativeSize}
            onValueChange={setRelativeSize}
            min={0}
            max={100}
            step={0.05}
          />
          <Input
            id="experiment-sampleSizeRelative"
            name="experiment-sampleSizeRelative"
            className="w-24 tabular-nums"
            value={relativeSize[0]?.toFixed(2)}
            onChange={(e) => setRelativeSize([Number(e.target.value)])}
            type="number"
            min={0}
            max={100}
            step={0.05}
          ></Input>
        </div>
      ) : (
        <Input
          id="experiment-sampleSizeAbsolute"
          name="experiment-sampleSizeAbsolute"
          className="w-32 tabular-nums"
          value={absoluteSize}
          onChange={(e) => setAbsoluteSize(Number(e.target.value))}
          type="number"
          min={0}
          step={1}
        ></Input>
      )}

      <p className="text-xs text-muted-foreground tabular-nums">
        Sample size{": "}
        {typeOfSampleSize === "relative"
          ? `${relativeSize[0]?.toFixed(2)}% of users`
          : `${absoluteSize} users`}
      </p>
    </div>
  );
};
