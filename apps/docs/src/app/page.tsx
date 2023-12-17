"use client";

import { Experiment, Variant, useRetest } from "@/lib/retest";
import { Button } from "@retestlabs/ui/button";

function Page(): JSX.Element {
  let { variant, trackEvent } = useRetest("mobile-hamburguer-icon-experiment");

  let message = "Hello";
  switch (variant) {
    case "variantA":
      message = "Hello from variant A";
      break;
    case "variantB":
      message = "Hello from variant B";
      break;
  }

  return (
    <main className="mx-auto w-max text-center space-y-4 my-4">
      <h1 className="font-bold text-lg">Test en docs</h1>
      <Button
        onClick={() => {
          trackEvent("eventA");
        }}
      >
        {message}
      </Button>

      <div className="bg-green p-16">
        <Experiment name="mobile-hamburguer-icon-experiment">
          <Variant name="variantA">
            <div>Variant A</div>
          </Variant>
          <Variant name="variantB">
            <div>Variant B</div>
          </Variant>
        </Experiment>
      </div>
    </main>
  );
}

export default Page;
