import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getSymptomLogs = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch symptom logs: ${error.message}`);
    }

    return data || [];
  });

export const addSymptomLog = protectedProcedure
  .input(z.object({
    date: z.string(),
    symptom_id: z.string(),
    intensity: z.number().min(1).max(5).optional(),
    custom_value: z.string().optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('symptom_logs')
      .insert({
        user_id: ctx.user.id,
        ...input,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add symptom log: ${error.message}`);
    }

    return data;
  });

export const removeSymptomLog = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('symptom_logs')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to remove symptom log: ${error.message}`);
    }

    return { success: true };
  });