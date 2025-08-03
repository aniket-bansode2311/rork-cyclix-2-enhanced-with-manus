import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const get = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch notification preferences: ${error.message}`);
    }

    // Return default preferences if none exist
    if (!data) {
      return {
        period_reminders: true,
        fertility_alerts: true,
        symptom_reminders: true,
        health_insights: true,
        community_updates: true,
        expert_qa_notifications: true,
        marketing_notifications: false,
      };
    }

    return data;
  });

export const update = protectedProcedure
  .input(z.object({
    period_reminders: z.boolean().optional(),
    fertility_alerts: z.boolean().optional(),
    symptom_reminders: z.boolean().optional(),
    health_insights: z.boolean().optional(),
    community_updates: z.boolean().optional(),
    expert_qa_notifications: z.boolean().optional(),
    marketing_notifications: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('notification_preferences')
      .upsert({
        user_id: ctx.user.id,
        ...input,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update notification preferences: ${error.message}`);
    }

    return data;
  });

export const registerPushToken = protectedProcedure
  .input(z.object({
    token: z.string(),
    platform: z.enum(['ios', 'android', 'web']),
  }))
  .mutation(async ({ ctx, input }) => {
    // Deactivate old tokens for this user/platform
    await ctx.supabase
      .from('push_notification_tokens')
      .update({ is_active: false })
      .eq('user_id', ctx.user.id)
      .eq('platform', input.platform);

    // Add new token
    const { data, error } = await ctx.supabase
      .from('push_notification_tokens')
      .upsert({
        user_id: ctx.user.id,
        token: input.token,
        platform: input.platform,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register push token: ${error.message}`);
    }

    return data;
  });

export const unregisterPushToken = protectedProcedure
  .input(z.object({
    token: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('push_notification_tokens')
      .update({ is_active: false })
      .eq('user_id', ctx.user.id)
      .eq('token', input.token);

    if (error) {
      throw new Error(`Failed to unregister push token: ${error.message}`);
    }

    return { success: true };
  });

export const sendNotification = protectedProcedure
  .input(z.object({
    user_id: z.string(),
    title: z.string(),
    body: z.string(),
    data: z.record(z.string()).optional(),
    notification_type: z.enum([
      'period_reminder',
      'fertility_alert',
      'symptom_reminder',
      'health_insight',
      'community_update',
      'expert_qa',
      'marketing'
    ]),
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if user has enabled this type of notification
    const { data: preferences } = await ctx.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', input.user_id)
      .single();

    if (!preferences) {
      throw new Error('User notification preferences not found');
    }

    // Map notification types to preference fields
    const preferenceMap = {
      period_reminder: 'period_reminders',
      fertility_alert: 'fertility_alerts',
      symptom_reminder: 'symptom_reminders',
      health_insight: 'health_insights',
      community_update: 'community_updates',
      expert_qa: 'expert_qa_notifications',
      marketing: 'marketing_notifications',
    };

    const preferenceField = preferenceMap[input.notification_type];
    if (!preferences[preferenceField]) {
      return { success: false, reason: 'User has disabled this notification type' };
    }

    // Get user's active push tokens
    const { data: tokens } = await ctx.supabase
      .from('push_notification_tokens')
      .select('token, platform')
      .eq('user_id', input.user_id)
      .eq('is_active', true);

    if (!tokens || tokens.length === 0) {
      return { success: false, reason: 'No active push tokens found' };
    }

    // In a real implementation, you would send push notifications here
    // using Firebase Cloud Messaging, Apple Push Notification service, etc.
    console.log(`Sending notification to ${tokens.length} devices:`, {
      title: input.title,
      body: input.body,
      tokens: tokens.map(t => t.token),
    });

    return {
      success: true,
      sent_to_devices: tokens.length,
    };
  });