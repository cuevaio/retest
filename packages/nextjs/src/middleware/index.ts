import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { getClientDataEdge } from "../get-client-data-edge";
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

    const retestCookies = request.cookies.getAll().filter((cookie) => {
      return cookie.name.startsWith("rt-");
    });

    let retestExperiments = new Map<
      number,
      {
        experiment: string;
        variant: string;
        startedAt: string;
        endedAt: string;
      }
    >();

    retestCookies.forEach((cookie) => {
      const [_, idx, type] = cookie.name.split("-");
      const value = cookie.value;
      const index = Number(idx);
      if (!retestExperiments.has(Number(index))) {
        retestExperiments.set(Number(index), {
          experiment: "",
          variant: "",
          startedAt: "",
          endedAt: "",
        });
      }

      if (type === "exp") {
        retestExperiments.get(index)!.experiment = value;
      } else if (type === "var") {
        retestExperiments.get(index)!.variant = value;
      } else if (type === "sta") {
        retestExperiments.get(index)!.startedAt = value;
      } else if (type === "end") {
        retestExperiments.get(index)!.endedAt = value;
      }
    });

    if (true) {
      const { os, country, browser, hashedIpAddress } =
        await getClientDataEdge(request);
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

      let data = (await res.json()) as {
        experiment: string;
        variant: string;
        startedAt: string;
        endedAt: string;
      }[];

      retestCookies.forEach((cookie) => {
        request.cookies.delete(cookie.name);
        response.cookies.delete(cookie.name);
      });

      data.forEach((d, index) => {
        request.cookies.set("rt-" + index + "-exp", d.experiment);
        request.cookies.set("rt-" + index + "-var", d.variant);
        request.cookies.set("rt-" + index + "-sta", d.startedAt);
        request.cookies.set("rt-" + index + "-end", d.endedAt);

        response.cookies.set("rt-" + index + "-exp", d.experiment);
        response.cookies.set("rt-" + index + "-var", d.variant);
        response.cookies.set("rt-" + index + "-sta", d.startedAt);
        response.cookies.set("rt-" + index + "-end", d.endedAt);
      });
    }
    return response;
  };
