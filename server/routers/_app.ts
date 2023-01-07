/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from '../trpc';
import { tokenInfoRouter } from './tokenInfo';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),
  token: tokenInfoRouter
});

export type AppRouter = typeof appRouter;
