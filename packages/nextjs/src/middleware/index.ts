import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

import { getClientDataEdge } from "../get-client-data-edge";
import { getRetestAPIUrl } from "../utils/get-retest-api-url";

import { type Experiment } from "../types/experiment";

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

    // read the cookies and find the retest cookies
    const retestCookies = request.cookies.getAll().filter((cookie) => {
      return cookie.name.startsWith("rt-");
    });

    let experimentsOnCookiesMap = new Map<
      number,
      {
        experiment: string;
        variant: string;
        startedAt: string;
        endedAt: string;
      }
    >();

    // example of retest cookies
    // rt-0-exp: experiment0
    // rt-0-var: variant0
    // rt-0-sta: 2021-01-01T00:00:00.000Z
    // rt-0-end: 2021-01-16T00:00:00.000Z

    retestCookies.forEach((cookie) => {
      const [_, idx, type] = cookie.name.split("-");
      const value = cookie.value;
      const index = Number(idx);
      if (!experimentsOnCookiesMap.has(Number(index))) {
        experimentsOnCookiesMap.set(Number(index), {
          experiment: "",
          variant: "",
          startedAt: "",
          endedAt: "",
        });
      }

      if (type === "exp") {
        experimentsOnCookiesMap.get(index)!.experiment = value;
      } else if (type === "var") {
        experimentsOnCookiesMap.get(index)!.variant = value;
      } else if (type === "sta") {
        experimentsOnCookiesMap.get(index)!.startedAt = value;
      } else if (type === "end") {
        experimentsOnCookiesMap.get(index)!.endedAt = value;
      }
    });

    let experimentsOnCookies = Array.from(experimentsOnCookiesMap.values());

    // filter out experiments that are incomplete
    // e.g. doens't have startedAt or endedAt
    experimentsOnCookies = experimentsOnCookies.filter((e) => {
      return (
        e.experiment !== "" &&
        e.variant !== "" &&
        e.startedAt !== "" &&
        e.endedAt !== ""
      );
    });

    // check if the experimentsOnCookies experiments are the same as the experiments passed in the middleware
    // also check if the variants in the cookies are the same as the variants in the experiments passed in the middleware

    let isSame = true;

    if (experimentsOnCookies.length !== experiments.length) {
      isSame = false;
    } else {
      experimentsOnCookies.forEach((e) => {
        const found = experiments.find((ex) => {
          return (
            ex.name === e.experiment &&
            ex.variants.find((v) => v === e.variant) !== undefined
          );
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
      const { os, country, browser, hashedIpAddress, isBot } =
        await getClientDataEdge(request);

      if (isBot) {
        return response;
      }

      if (!hashedIpAddress || !country || !os || !browser) {
        return response;
      }

      const retestAPIUrl = getRetestAPIUrl();

      let searchParams = new URLSearchParams({
        hashedIpAddress,
        country,
        os,
        browser,
      });

      console.log(searchParams);

      let res = await fetch(
        retestAPIUrl + "/api/v0/getVariants?" + searchParams.toString(),
      );

      let data = (await res.json()) as {
        experiment: string;
        variant: string;
        startedAt: string;
        endedAt: string;
      }[];

      console.log(data);

      // delete the old retest cookies
      retestCookies.forEach((cookie) => {
        request.cookies.delete(cookie.name);
        response.cookies.delete(cookie.name);
      });

      // set the new retest cookies
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
