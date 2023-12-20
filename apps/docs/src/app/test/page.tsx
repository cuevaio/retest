"use client";

import { RetestBlockClient } from "@/lib/retest/client";
import * as React from "react";

const ClientPage = () => {
  return (
    <RetestBlockClient
      experiment="mobile-hamburguer-icon-experiment"
      components={{
        variantA: "VariantA",
        variantB: "VariantB",
        isLoading: <span>Loading...</span>,
      }}
    />
  );
};

export default ClientPage;
