import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getPeriodLogs = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch period logs: ${error.message}`);
    }

    return data || [];
  });

export const addPeriodLog = protectedProcedure
  .input(z.object({
    date: z.string(),
    flow: z.enum(['light', 'medium', 'heavy', 'spotting']),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('period_logs')
      .insert({
        user_id: ctx.user.id,
        ...input,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add period log: ${error.message}`);
    }

    return data;
  });

export const removePeriodLog = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('period_logs')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to remove period log: ${error.message}`);
    }

    return { success: true };
  });