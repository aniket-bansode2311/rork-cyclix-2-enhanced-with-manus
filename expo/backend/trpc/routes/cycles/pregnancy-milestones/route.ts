import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const get = protectedProcedure
  .input(z.object({
    week: z.number().optional(),
    category: z.enum(['appointment', 'test', 'development', 'preparation']).optional(),
  }).optional())
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from('pregnancy_milestones')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('week', { ascending: true });

    if (input?.week) {
      query = query.eq('week', input.week);
    }

    if (input?.category) {
      query = query.eq('category', input.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch pregnancy milestones: ${error.message}`);
    }

    return data || [];
  });

export const add = protectedProcedure
  .input(z.object({
    week: z.number(),
    title: z.string(),
    description: z.string(),
    category: z.enum(['appointment', 'test', 'development', 'preparation']),
    due_date: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('pregnancy_milestones')
      .insert({
        user_id: ctx.user.id,
        week: input.week,
        title: input.title,
        description: input.description,
        category: input.category,
        due_date: input.due_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add pregnancy milestone: ${error.message}`);
    }

    return data;
  });

export const update = protectedProcedure
  .input(z.object({
    id: z.string(),
    completed: z.boolean().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    due_date: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updates } = input;
    
    const { data, error } = await ctx.supabase
      .from('pregnancy_milestones')
      .update(updates)
      .eq('id', id)
      .eq('user_id', ctx.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pregnancy milestone: ${error.message}`);
    }

    return data;
  });

export const remove = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('pregnancy_milestones')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to remove pregnancy milestone: ${error.message}`);
    }

    return { success: true };
  });

export const generateDefaultMilestones = protectedProcedure
  .mutation(async ({ ctx }) => {
    const defaultMilestones = [
      {
        week: 8,
        title: "First Prenatal Appointment",
        description: "Schedule your first prenatal visit with your healthcare provider",
        category: "appointment" as const,
      },
      {
        week: 12,
        title: "First Trimester Screening",
        description: "Optional screening tests for chromosomal abnormalities",
        category: "test" as const,
      },
      {
        week: 16,
        title: "Anatomy Scan Preparation",
        description: "Prepare for detailed ultrasound to check baby's development",
        category: "preparation" as const,
      },
      {
        week: 20,
        title: "Anatomy Scan",
        description: "Detailed ultrasound to check baby's organs and development",
        category: "test" as const,
      },
      {
        week: 24,
        title: "Glucose Screening",
        description: "Test for gestational diabetes",
        category: "test" as const,
      },
      {
        week: 28,
        title: "Third Trimester Begins",
        description: "Start preparing for baby's arrival - nursery, hospital bag",
        category: "preparation" as const,
      },
      {
        week: 32,
        title: "Baby Shower Planning",
        description: "Plan or attend baby shower celebrations",
        category: "preparation" as const,
      },
      {
        week: 36,
        title: "Final Preparations",
        description: "Hospital bag ready, birth plan finalized",
        category: "preparation" as const,
      },
    ];

    const milestonesToInsert = defaultMilestones.map(milestone => ({
      user_id: ctx.user.id,
      ...milestone,
    }));

    const { data, error } = await ctx.supabase
      .from('pregnancy_milestones')
      .insert(milestonesToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to generate default milestones: ${error.message}`);
    }

    return data || [];
  });