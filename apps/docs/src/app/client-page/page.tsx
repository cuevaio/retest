"use client";

import { RetestBlockClient, useRetestClient } from "@/lib/retest/client";
import { Button } from "@retestlabs/ui/button";

const ClientPage = () => {
  let { data, isLoading, error } = useRetestClient(
    "mobile-hamburguer-icon-experiment",
  );

  return (
    <div>
      <h1>
        {isLoading
          ? "LOADING..."
          : error
            ? "ERROR!"
            : data
              ? data.variant + data.status
              : "empty data"}
      </h1>

      <p>exp ends on: {data?.endedAt.toLocaleString() || "..."}</p>
    </div>
  );
};

export default ClientPage;
