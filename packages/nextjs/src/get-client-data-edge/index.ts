import { NextRequest, userAgent } from "next/server";

import { geolocation } from "@vercel/edge";
import { ipAddress } from "@vercel/edge";

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
      hashedIpAddress: "test_" + process.env.RT_DEV_IP_ADDRESS ?? "0.0.0.0",
      country: "test_country",
      browser: "test_browser",
      os: "test_os",
      deviceType: "test_deviceType",
      isBot: false,
    };
  }

  const { country } = geolocation(request);

  const ip = ipAddress(request);

  const hashedIpAddress = ip ? await hashIpAddress(ip) : undefined;

  const { browser, os, device, isBot } = userAgent(request);
  return {
    isBot,
    hashedIpAddress,
    country,
    browser: browser.name,
    os: os.name,
    deviceType: device.type,
  };
}
