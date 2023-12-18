import { NextRequest } from "next/server";

import { getRetestAPIUrl } from "../utils/get-retest-api-url";
import { getVariantServer } from "../get-variant-server";
import { getVariantsServer } from "../get-variants-server";
import { getClientDataEdge } from "../utils/get-client-data-edge";

function generateRetestAPI() {
  const retestAPIUrl = getRetestAPIUrl();

  const GET = async (
    req: NextRequest,
    { params }: { params: { action: string } },
  ) => {
    try {
      const { action } = params;

      const { hashedIpAddress, country, browser, os } =
        await getClientDataEdge();

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

      if (action === "getVariants") {
        let data = getVariantsServer();
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
        let data = getVariantServer(experiment);
        return Response.json(data);
      }

      return Response.json({
        action,
        hashedIpAddress,
        country,
        browser,
        os,
      });
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
