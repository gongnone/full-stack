import { initTRPC } from '@trpc/server';
import { authRouter } from './routers/auth';
import { hubsRouter } from './routers/hubs';
import { spokesRouter } from './routers/spokes';
import { reviewRouter } from './routers/review';
import { clientsRouter } from './routers/clients';
import { calibrationRouter } from './routers/calibration';
import { analyticsRouter } from './routers/analytics';
import { exportsRouter } from './routers/exports';
import { brandDnaRouter } from './routers/brandDna';
import { audienceRouter } from './routers/audience';
import { pillarsRouter } from './routers/pillars';
import { criticRouter } from './routers/critic';
import { agencyRouter } from './routers/agency';
import { testimonialsRouter } from './routers/testimonials';
import { complianceRouter } from './routers/compliance';
import { operationsRouter } from './routers/operations';
import { onboardingRouter } from './routers/onboarding';
import { strategyRouter } from './routers/strategy';
import { researchRouter } from './routers/research';
import { hooksRouter } from './routers/hooks';
import { calendarRouter } from './routers/calendar';
import { testSetupRouter } from './routers/test-setup';
import { admiredProfilesRouter } from './routers/admired-profiles';
import { engagementRouter } from './routers/engagement';
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
  brandDna: brandDnaRouter,
  audience: audienceRouter,
  pillars: pillarsRouter,
  critic: criticRouter,
  agency: agencyRouter,
  testimonials: testimonialsRouter,
  compliance: complianceRouter,
  operations: operationsRouter,
  onboarding: onboardingRouter,
  strategy: strategyRouter,
  research: researchRouter,
  hooks: hooksRouter,
  calendar: calendarRouter,
  testSetup: testSetupRouter,
  admiredProfiles: admiredProfilesRouter,
  engagement: engagementRouter,
});

export type AppRouter = typeof appRouter;
