"use client";

import { RetestBlockClient, useRetestClient } from "@/lib/retest/client";
import { Button } from "@retestlabs/ui/button";

const ClientPage = () => {
  let { variant, trackEvent, isLoading } = useRetestClient(
    "mobile-hamburguer-icon-experiment",
  );

  return (
    <main className="mx-auto w-max text-center space-y-4 my-4">
      <h1>Client rendered page</h1>
      <p className="font-bold text-lg">
        Variant: {isLoading ? "loading..." : variant || "no variant assigned"}
      </p>

      <RetestBlockClient
        experiment="mobile-hamburguer-icon-experiment"
        variant="variantA"
      >
        <Button>variantA</Button>
      </RetestBlockClient>

      <RetestBlockClient
        experiment="mobile-hamburguer-icon-experiment"
        variant="variantB"
      >
        <Button>variantB</Button>
      </RetestBlockClient>
    </main>
  );
};

export default ClientPage;
