import { NextResponse } from "next/server";
import { retestMiddleware } from "@retestlabs/nextjs/server";

import { experiments } from "@/lib/retest/client";

export const middleware = retestMiddleware(
  () => NextResponse.next(),
  experiments,
);
