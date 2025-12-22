import { initTRPC } from '@trpc/server';
import { authRouter } from './routers/auth';
import { hubsRouter } from './routers/hubs';
import { spokesRouter } from './routers/spokes';
import { reviewRouter } from './routers/review';
import { clientsRouter } from './routers/clients';
import { calibrationRouter } from './routers/calibration';
import { analyticsRouter } from './routers/analytics';
import { exportsRouter } from './routers/exports';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  auth: authRouter,
  hubs: hubsRouter,
  spokes: spokesRouter,
  review: reviewRouter,
  clients: clientsRouter,
  calibration: calibrationRouter,
  analytics: analyticsRouter,
  exports: exportsRouter,
});

export type AppRouter = typeof appRouter;
