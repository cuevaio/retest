import { UAParser } from "ua-parser-js";
import type { NextRequest } from "next/server";

async function hashIpAddress(ipAddress: string) {
  // let encoder = new TextEncoder();
  // let data = encoder.encode(ipAddress);

  // let hash = await crypto.subtle.digest("sha256", data);

  // return Array.from(new Uint8Array(hash))
  //   .map((byte) => byte.toString(16).padStart(2, "0"))
  //   .join("");

  return ipAddress;
}

export async function getClientDataEdge(request: NextRequest) {
  if (process.env.NODE_ENV === "development") {
    return {
      hashedIpAddress: "test_hashedIpAddress",
      country: "test_country",
      browser: "test_browser",
      os: "test_os",
    };
  }

  const headersList = request.headers;
  const ip = headersList.get("x-vercel-forwarded-for") || undefined;
  const hashedIpAddress = ip ? await hashIpAddress(ip) : undefined;
  const country = headersList.get("x-vercel-ip-country") || undefined;
  const userAgent = headersList.get("user-agent") || undefined;

  let browser: string | undefined;
  let os: string | undefined;

  if (userAgent) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    browser = result.browser.name;
    os = result.os.name;
  }

  return {
    hashedIpAddress,
    country,
    browser,
    os,
  };
}
