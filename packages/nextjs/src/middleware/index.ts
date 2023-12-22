import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { getClientDataEdge } from "../get-client-data-edge";
import { getRetestAPIUrl } from "../utils/get-retest-api-url";

import { type ExperimentVariant, type Experiment } from "../types/experiment";
import { getVariantsServerEdge } from "../get-variants-server-edge";

/**
 * `retestMiddleware` is a middleware utility that handles the retest cookies management.
 * It first runs the user's custom middleware, then reads the cookies and filters for retest cookies.
 * If the retest cookies are not the same as the experiments passed in the middleware,
 * it will get the experiments and variants assigned to the user from the retest API (https://retest.dev)
 * and set the cookies.
 *
 * @param {NextMiddleware} middleware - Custom middleware.
 * @param {readonly Experiment[]} experiments - The list of experiments.
 * @returns {NextMiddleware} Next.js middleware
 */
export const retestMiddleware =
  (
    middleware: NextMiddleware,
    experiments: readonly Experiment[],
  ): NextMiddleware =>
  async (request: NextRequest, event: NextFetchEvent) => {
    // let the user custom middleware run first
    let response = (await middleware(request, event)) as NextResponse;

    let experimentsOnCookies = getVariantsServerEdge(request);

    // check if the experimentsOnCookies experiments are the same as the experiments passed in the middleware
    // also check if the variants in the cookies are the same as the variants in the experiments passed in the middleware

    let isSame = true;

    if (experimentsOnCookies.length < experiments.length) {
      isSame = false;
    } else {
      experimentsOnCookies.forEach((e) => {
        const found = experiments.find((ex) => {
          return ex.name === e.experiment;
        });
        if (!found) {
          isSame = false;
        }
      });
    }

    // if the experiments are not the same,
    // we need to get the experiments and variants assigned to the user from the retest API (https://retest.dev)
    // and set the cookies

    if (!isSame) {
      // delete the old retest cookies
      request.cookies
        .getAll()
        .filter((cookie) => cookie.name.startsWith("rt-"))
        .forEach((cookie) => {
          request.cookies.delete(cookie.name);
          response.cookies.delete(cookie.name);
        });

      const { os, country, browser, hashedIpAddress, isBot } =
        await getClientDataEdge(request);

      if (isBot) {
        return response;
      }

      if (!hashedIpAddress || !country || !os || !browser) {
        return response;
      }

      const retestAPIUrl = getRetestAPIUrl();

      let res = await fetch(retestAPIUrl + "/api/v0/experiment-variants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experiments: experiments.map((e) => e.name),
          ip: hashedIpAddress,
          country,
          os,
          browser,
        }),
      });

      let data = (await res.json()) as ExperimentVariant[];
      // set the new retest cookies
      data.forEach((d, index) => {
        request.cookies.set("rt-" + index + "-exp", d.experiment);
        d.variant && request.cookies.set("rt-" + index + "-var", d.variant);
        request.cookies.set("rt-" + index + "-sta", d.startedAt);
        request.cookies.set("rt-" + index + "-end", d.endedAt);

        response.cookies.set("rt-" + index + "-exp", d.experiment);
        d.variant && response.cookies.set("rt-" + index + "-var", d.variant);
        response.cookies.set("rt-" + index + "-sta", d.startedAt);
        response.cookies.set("rt-" + index + "-end", d.endedAt);
      });

      if (data.length < experiments.length) {
      }
    }

    return response;
  };
