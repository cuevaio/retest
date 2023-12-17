"use server";
import "server-only";

import { NextRequest } from "next/server";

import { getClientData } from "../utils/get-client-data";
import { getRetestAPIUrl } from "../utils/get-retest-api-url";

function generateRetestAPI() {
  const retestAPIUrl = getRetestAPIUrl();

  const GET = async (
    req: NextRequest,
    { params }: { params: { action: string } },
  ) => {
    const { action } = params;

    const { hashedIpAddress, country, browser, os } = getClientData();

    if (!hashedIpAddress || !country || !browser || !os) {
      return Response.json(
        {
          error: "Missing device data",
        },
        {
          status: 400,
        },
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const experiment = searchParams.get("experiment") || undefined;

    if (!experiment) {
      return Response.json(
        {
          error: "Missing experiment",
        },
        { status: 400 },
      );
    }

    if (action === "getVariant") {
      let res = await fetch(
        retestAPIUrl +
          "/api/v0/getVariant?" +
          new URLSearchParams({
            experiment,
            hashedIpAddress,
            country,
            browser,
            os,
          }),
      );

      let data = await res.json();

      return Response.json(data);
    }

    return Response.json({
      action,
      hashedIpAddress,
      country,
      browser,
      os,
    });
  };

  return {
    GET,
  };
}

export { generateRetestAPI };
