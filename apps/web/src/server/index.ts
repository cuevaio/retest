import { router } from "./trpc";

import { workspacesRoutes } from "./routes/workspaces";
import { experimentsRoutes } from "./routes/experiments";
import { eventsRoutes } from "./routes/events";
import { variantsRoutes } from "./routes/variants";
import { usersRoutes } from "./routes/users";

export type AppRouter = typeof appRouter;

export const appRouter = router({
  ...experimentsRoutes,
  ...eventsRoutes,
  ...variantsRoutes,
  ...workspacesRoutes,
  ...usersRoutes,
});
