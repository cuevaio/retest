import { NextResponse } from "next/server";
import { retestMiddleware } from "@retestlabs/nextjs/server";

import { experiments } from "../src/lib/retest";

export const middleware = retestMiddleware(
  () => NextResponse.next(),
  experiments,
);
