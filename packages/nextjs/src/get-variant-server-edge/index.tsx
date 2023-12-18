import type { NextRequest } from "next/server";

export function getVariantServerEdge(request: NextRequest, experiment: string) {
  const cookieStore = request.cookies;

  const cookieName = cookieStore.getAll().find((cookie) => {
    return cookie.value === experiment;
  })?.name;

  let index = cookieName
    ? parseInt(cookieName.split("-")[1] || "-1")
    : undefined;

  let variant: string | undefined = index
    ? String(cookieStore.get(`rt-${index}-var`)?.value)
    : undefined;
  let startedAt = index
    ? new Date(String(cookieStore.get(`rt-${index}-sta`)?.value))
    : undefined;
  let endedAt = index
    ? new Date(String(cookieStore.get(`rt-${index}-end`)?.value))
    : undefined;

  if (startedAt && endedAt) {
    let now = new Date().toISOString();
    if (now < startedAt.toISOString() || now > endedAt.toISOString()) {
      variant = undefined;
    }
  }

  return { variant, startedAt, endedAt };
}
