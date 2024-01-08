import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

import { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async (opts) => {
  let session = opts.ctx.session;
  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to do that",
    });
  }
  if (!session?.user?.email) {
    throw new TRPCError({
      code: "FORBIDDEN",
    });
  }

  let user = await xata.db.nextauth_users
    .filter({ email: session.user.email })
    .getFirstOrThrow();
  return opts.next({ ...opts, ctx: { ...opts.ctx, user } });
});
