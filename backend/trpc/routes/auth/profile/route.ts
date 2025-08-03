import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const getProfile = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    if (!data) {
      // Create default profile if it doesn't exist
      const defaultProfile = {
        user_id: ctx.user.id,
        average_cycle_length: 28,
        average_period_length: 5,
        is_pregnancy_mode: false,
      };

      const { data: newProfile, error: createError } = await ctx.supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create profile: ${createError.message}`);
      }

      return newProfile;
    }

    return data;
  });

export const updateProfile = protectedProcedure
  .input(z.object({
    average_cycle_length: z.number().optional(),
    average_period_length: z.number().optional(),
    last_period_start: z.string().nullable().optional(),
    is_pregnancy_mode: z.boolean().optional(),
    birth_control_method: z.string().nullable().optional(),
    pregnancy_due_date: z.string().nullable().optional(),
    pregnancy_start_date: z.string().nullable().optional(),
    current_week: z.number().nullable().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('profiles')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', ctx.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  });