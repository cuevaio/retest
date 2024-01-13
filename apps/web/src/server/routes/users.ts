import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const usersRoutes = {
  getUser: protectedProcedure.query(async (opts) => {
    const {
      ctx: { user },
    } = opts;
    return user;
  }),

  updateName: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const {
        input: { name },
        ctx: { user },
      } = opts;

      let updatedUser = await user.update({ name });

      return updatedUser;
    }),
}
