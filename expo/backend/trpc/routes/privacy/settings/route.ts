import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const get = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to fetch privacy settings: ${error.message}`);
    }

    // Return default settings if none exist
    if (!data) {
      return {
        anonymous_mode: false,
        data_sharing_research: true,
        data_sharing_insights: true,
        data_sharing_third_party: false,
        marketing_communications: true,
        community_profile_visible: true,
        allow_friend_requests: true,
      };
    }

    return data;
  });

export const update = protectedProcedure
  .input(z.object({
    anonymous_mode: z.boolean().optional(),
    data_sharing_research: z.boolean().optional(),
    data_sharing_insights: z.boolean().optional(),
    data_sharing_third_party: z.boolean().optional(),
    marketing_communications: z.boolean().optional(),
    community_profile_visible: z.boolean().optional(),
    allow_friend_requests: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('user_privacy_settings')
      .upsert({
        user_id: ctx.user.id,
        ...input,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update privacy settings: ${error.message}`);
    }

    return data;
  });

export const requestDataExport = protectedProcedure
  .input(z.object({
    request_type: z.enum(['full_export', 'cycle_data', 'symptom_data', 'health_data']),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('data_export_requests')
      .insert({
        user_id: ctx.user.id,
        request_type: input.request_type,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create export request: ${error.message}`);
    }

    // In a real implementation, you would trigger a background job here
    // to generate the export file and update the request status

    return data;
  });

export const getExportRequests = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('data_export_requests')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch export requests: ${error.message}`);
    }

    return data || [];
  });

export const requestAccountDeletion = protectedProcedure
  .input(z.object({
    reason: z.string().optional(),
    scheduled_deletion_date: z.string(), // ISO date string
  }))
  .mutation(async ({ ctx, input }) => {
    // Check if there's already a pending deletion request
    const { data: existingRequest } = await ctx.supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('Account deletion request already pending');
    }

    const { data, error } = await ctx.supabase
      .from('account_deletion_requests')
      .insert({
        user_id: ctx.user.id,
        reason: input.reason,
        scheduled_deletion_date: input.scheduled_deletion_date,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create deletion request: ${error.message}`);
    }

    return data;
  });

export const cancelAccountDeletion = protectedProcedure
  .mutation(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('account_deletion_requests')
      .update({ status: 'cancelled' })
      .eq('user_id', ctx.user.id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel deletion request: ${error.message}`);
    }

    return data;
  });

export const getDeletionRequest = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', ctx.user.id)
      .eq('status', 'pending')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch deletion request: ${error.message}`);
    }

    return data;
  });