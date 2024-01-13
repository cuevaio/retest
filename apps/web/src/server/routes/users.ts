import { protectedProcedure } from "../trpc";

export const usersRoutes = {
  getUser: protectedProcedure.query(async (opts) => {
    const {
      ctx: { user },
    } = opts;

    return user;
  }),
};
