export const dynamic = "force-dynamic";

import { Code } from "bright";

import theme from "./theme.json";

Code.theme = theme;

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

const Page = async () => {
  let activeExperiments = await xata.db.experiments
    .select([
      "*",
      {
        name: "<-variants.experiment",
        as: "variants",
        sort: [{ name: "asc" }],
        columns: ["name"],
      },
      {
        name: "<-events.experiment",
        as: "events",
        sort: [{ name: "asc" }],
        columns: ["name"],
      },
    ])
    .filter({
      endedAt: {
        $ge: new Date(),
      },
      variantCount: {
        $ge: 1,
      },
    })
    .sort("startedAt", "asc")
    .getAll();

  let experiments = activeExperiments.map((experiment) => {
    return {
      name: experiment.name,
      variants: experiment.variants?.records.map((variant) => variant.name),
      events: experiment.events?.records.map((event) => event.name) ?? [],
    };
  });

  return (
    <div className="">
      <h1 className="font-bold text-xl">
        Setup your Next.js project with Retest
      </h1>
      <p>Let's say you have a folder like this:</p>
      <Code lang="bash" title="Terminal">
        {`
my-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   ├── lib/
│   │   middleware.ts
├── public/
├── package.json
└── tsconfig.json
`.trim()}
      </Code>
      <div className="space-y-12 my-12">
        <div>
          <h2 className="font-bold">1. Define the experiments</h2>
          <Code lang="ts" title="src/lib/retest/index.ts" lineNumbers>
            {`
export const experiments = ${JSON.stringify(
              experiments,
              undefined,
              2,
            )} as const;
`.trim()}
          </Code>
        </div>
        <div>
          <h2 className="font-bold">2. Setup the middleware</h2>
          <Code lang="ts" title="src/lib/middleware.ts" lineNumbers>
            {`
import { NextResponse } from "next/server";
import { retestMiddleware } from "@retestlabs/nextjs/server";

import { experiments } from "../src/lib/retest";

export const middleware = retestMiddleware(
  () => NextResponse.next(),
  experiments,
);
`.trim()}
          </Code>
        </div>
        <div>
          <h2 className="font-bold">3. Setup the API</h2>
          <Code
            lang="ts"
            title="src/app/api/retest[action]/route.tsx"
            lineNumbers
          >
            {`
export const runtime = "edge";

import { generateRetestAPI } from "@retestlabs/nextjs/server";

export const { GET } = generateRetestAPI();
`.trim()}
          </Code>
        </div>
        <div>
          <h2 className="font-bold">4. Setup the hooks and components</h2>
          <div className="grid grid-cols-2 gap-8">
            <Code lang="ts" title="src/lib/retest/client.ts" lineNumbers>
              {`   
"use client";

import {
  generateUseRetestClient,
  generateRetestBlockClient,
} from "@retestlabs/nextjs/client";

import { experiments } from ".";

export const useRetestClient = generateUseRetestClient(experiments);
export const RetestBlockClient = generateRetestBlockClient(experiments);
          `.trim()}
            </Code>
            <Code lang="ts" title="src/lib/retest/server.ts" lineNumbers>
              {`
import {
  generateUseRetestServer,
  generateRetestBlockServer,
} from "@retestlabs/nextjs/server";

import { experiments } from ".";

export const RetestBlockServer = generateRetestBlockServer(experiments);
export const useRetestServer = generateUseRetestServer(experiments);
`.trim()}
            </Code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
