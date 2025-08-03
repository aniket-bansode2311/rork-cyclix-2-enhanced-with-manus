import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let user = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Validate token format (basic JWT structure check)
    if (token && token.split('.').length === 3) {
      try {
        console.log('Validating auth token...');
        const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
        
        if (error) {
          console.error('Token validation error:', error.message);
        } else if (authUser && authUser.id) {
          console.log('User authenticated:', authUser.email);
          user = authUser;
        } else {
          console.warn('No user found for valid token');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
      }
    } else {
      console.warn('Invalid token format received');
    }
  }

  return {
    req: opts.req,
    user,
    supabase,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.user.id) {
    console.warn('Unauthorized access attempt');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in to access this resource.',
    });
  }
  
  // Additional validation to ensure user is properly authenticated
  if (!ctx.user.email || !ctx.user.email_confirmed_at) {
    console.warn('User email not confirmed:', ctx.user.email);
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Please verify your email address to access this resource.',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});