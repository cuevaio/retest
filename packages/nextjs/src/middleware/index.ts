"use server";
import "server-only";

import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { getClientData } from "../utils/get-client-data";
import { getRetestAPIUrl } from "../utils/get-retest-api-url";

import { type Experiment } from "../types/experiment";

export const retestMiddleware =
  (
    middleware: NextMiddleware,
    experiments: readonly Experiment[],
  ): NextMiddleware =>
  async (request: NextRequest, event: NextFetchEvent) => {
    const retestAPIUrl = getRetestAPIUrl();
    let response = (await middleware(request, event)) as NextResponse;

    const allCookies = request.cookies.getAll();
    console.log("allCookies", allCookies);

    console.log(experiments);

    const { os, country, browser, hashedIpAddress } = getClientData();

    if (!os || !country || !browser || !hashedIpAddress) {
      return response;
    }

    let res = await fetch(
      retestAPIUrl +
        "/api/v0/getVariants?" +
        new URLSearchParams({
          hashedIpAddress,
          country,
          browser,
          os,
        }),
    );

    let data = await res.json();

    console.log("data", data);

    if (true) {
      response.cookies.set("retest", "true");
    }

    return response;
  };
