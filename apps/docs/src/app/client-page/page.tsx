"use client";

import { RetestClient, useRetest } from "@/lib/retest/client";
import { Button } from "@retestlabs/ui/button";

const ClientPage = () => {
  let { variant, trackEvent, isLoading } = useRetest(
    "mobile-hamburguer-icon-experiment",
  );

  return (
    <main className="mx-auto w-max text-center space-y-4 my-4">
      <h1 className="font-bold text-lg">Variant: {variant}</h1>

      <RetestClient
        experiment="mobile-hamburguer-icon-experiment"
        variant="variantA"
      >
        <Button>variantA</Button>
      </RetestClient>

      <RetestClient
        experiment="mobile-hamburguer-icon-experiment"
        variant="variantB"
      >
        <Button>variantB</Button>
      </RetestClient>
    </main>
  );
};

export default ClientPage;
