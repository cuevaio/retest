import { NextRequest } from "next/server";

import { getClientDataEdge } from "../get-client-data-edge";
import { getRetestAPIUrl } from "../utils/get-retest-api-url";

import { getVariantServerEdge } from "../get-variant-server-edge";
import { getVariantsServerEdge } from "../get-variants-server-edge";

function generateRetestAPI() {
  const retestAPIUrl = getRetestAPIUrl();

  const GET = async (
    req: NextRequest,
    { params }: { params: { action: string } },
  ) => {
    try {
      const { action } = params;

      const { hashedIpAddress, country, browser, os, deviceType } =
        await getClientDataEdge(req);

      if (!hashedIpAddress || !country || !browser || !os || !deviceType) {
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

      if (action === "getVariants") {
        let data = getVariantsServerEdge(req);
        return Response.json(data);
      } else if (action === "getVariant") {
        const experiment = searchParams.get("experiment") || undefined;

        if (!experiment) {
          return Response.json(
            {
              error: "Missing experiment",
            },
            { status: 400 },
          );
        }
        let data = getVariantServerEdge(req, experiment);
        return Response.json(data);
      } else if (action === "getClientData") {
        return Response.json({
          hashedIpAddress,
          country,
          browser,
          os,
          deviceType,
        });
      } else {
        return Response.json(
          {
            error: "Invalid action",
          },
          {
            status: 400,
          },
        );
      }
    } catch (error) {
      return Response.json(
        {
          error: JSON.stringify(error),
        },
        {
          status: 500,
        },
      );
    }
  };

  return {
    GET,
  };
}

export { generateRetestAPI };
