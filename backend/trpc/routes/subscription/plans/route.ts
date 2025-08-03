import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../../../create-context";

export const getAll = publicProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch subscription plans: ${error.message}`);
    }

    return data || [];
  });

export const getUserSubscription = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (
          name,
          description,
          features
        )
      `)
      .eq('user_id', ctx.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user subscription: ${error.message}`);
    }

    return data;
  });

export const createSubscription = protectedProcedure
  .input(z.object({
    plan_id: z.string(),
    platform: z.enum(['ios', 'android', 'web']),
    platform_subscription_id: z.string(),
    current_period_start: z.string(),
    current_period_end: z.string(),
    trial_end: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if user already has an active subscription
    const { data: existingSubscription } = await ctx.supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    const { data, error } = await ctx.supabase
      .from('user_subscriptions')
      .upsert({
        user_id: ctx.user.id,
        plan_id: input.plan_id,
        platform: input.platform,
        platform_subscription_id: input.platform_subscription_id,
        status: 'active',
        current_period_start: input.current_period_start,
        current_period_end: input.current_period_end,
        trial_end: input.trial_end,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return data;
  });

export const updateSubscription = protectedProcedure
  .input(z.object({
    status: z.enum(['active', 'cancelled', 'expired', 'pending']).optional(),
    current_period_start: z.string().optional(),
    current_period_end: z.string().optional(),
    cancel_at_period_end: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('user_subscriptions')
      .update(input)
      .eq('user_id', ctx.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data;
  });

export const cancelSubscription = protectedProcedure
  .input(z.object({
    cancel_immediately: z.boolean().default(false),
  }))
  .mutation(async ({ ctx, input }) => {
    const updates = input.cancel_immediately
      ? { status: 'cancelled' as const }
      : { cancel_at_period_end: true };

    const { data, error } = await ctx.supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('user_id', ctx.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }

    return data;
  });

export const validateReceipt = protectedProcedure
  .input(z.object({
    platform: z.enum(['ios', 'android']),
    receipt_data: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    // This is a simplified version. In production, you would:
    // 1. Validate the receipt with Apple/Google servers
    // 2. Extract subscription information
    // 3. Update the user's subscription status
    
    // For now, we'll just return a success response
    // In a real implementation, you would integrate with:
    // - Apple's App Store Server API for iOS
    // - Google Play Developer API for Android
    
    console.log(`Validating ${input.platform} receipt for user ${ctx.user.id}`);
    
    return {
      valid: true,
      subscription_id: input.receipt_data,
      expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });

export const getFeatureAccess = protectedProcedure
  .input(z.object({
    feature: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    // Get user's subscription
    const { data: subscription } = await ctx.supabase
      .from('user_subscriptions')
      .select(`
        status,
        current_period_end,
        subscription_plans (
          features
        )
      `)
      .eq('user_id', ctx.user.id)
      .eq('status', 'active')
      .single();

    // If no active subscription, user has free tier access
    if (!subscription) {
      const freeFeatures = [
        'Basic cycle tracking',
        'Period logging',
        'Basic insights',
        'Educational content'
      ];
      return {
        hasAccess: freeFeatures.includes(input.feature),
        tier: 'free',
      };
    }

    // Check if subscription is still valid
    const isExpired = new Date(subscription.current_period_end) < new Date();
    if (isExpired) {
      return {
        hasAccess: false,
        tier: 'expired',
      };
    }

    // Check if feature is included in the plan
    const planFeatures = subscription.subscription_plans?.features || [];
    const hasAccess = planFeatures.includes(input.feature);

    return {
      hasAccess,
      tier: 'premium',
      expiresAt: subscription.current_period_end,
    };
  });