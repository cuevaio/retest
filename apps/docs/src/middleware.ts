import { NextResponse } from "next/server";
import { retestMiddleware } from "@retestlabs/nextjs";

import { experiments } from "@/lib/retest";

export const middleware = retestMiddleware(
  () => NextResponse.next(),
  experiments,
);
