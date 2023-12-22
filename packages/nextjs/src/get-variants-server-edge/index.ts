import type { NextRequest } from "next/server";
import { getExperimentsFromRetestCookies } from "../get-experiments-from-retest-cookies";

export function getVariantsServerEdge(request: NextRequest) {
  const cookieStore = request.cookies;

  const retestCookies = cookieStore
    .getAll()
    .filter((cookie) => {
      return cookie.name.startsWith("rt-");
    })
    .map((cookie) => [cookie.name, cookie.value] as [string, string]);

  const experiments = getExperimentsFromRetestCookies(retestCookies);

  return experiments;
}
