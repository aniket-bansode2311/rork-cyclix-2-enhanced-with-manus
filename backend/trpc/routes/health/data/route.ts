import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const get = protectedProcedure
  .input(z.object({
    dataType: z.enum(['bbt', 'weight', 'sleep', 'steps', 'heart_rate']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional())
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from('health_data')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('date', { ascending: false });

    if (input?.dataType) {
      query = query.eq('data_type', input.dataType);
    }

    if (input?.startDate) {
      query = query.gte('date', input.startDate);
    }

    if (input?.endDate) {
      query = query.lte('date', input.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch health data: ${error.message}`);
    }

    return data || [];
  });

export const add = protectedProcedure
  .input(z.object({
    date: z.string(),
    dataType: z.enum(['bbt', 'weight', 'sleep', 'steps', 'heart_rate']),
    value: z.number(),
    unit: z.string().optional(),
    source: z.enum(['apple_health', 'google_fit', 'manual']).default('manual'),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('health_data')
      .upsert({
        user_id: ctx.user.id,
        date: input.date,
        data_type: input.dataType,
        value: input.value,
        unit: input.unit,
        source: input.source,
      }, {
        onConflict: 'user_id,date,data_type',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add health data: ${error.message}`);
    }

    return data;
  });

export const addBatch = protectedProcedure
  .input(z.array(z.object({
    date: z.string(),
    dataType: z.enum(['bbt', 'weight', 'sleep', 'steps', 'heart_rate']),
    value: z.number(),
    unit: z.string().optional(),
    source: z.enum(['apple_health', 'google_fit', 'manual']).default('manual'),
  })))
  .mutation(async ({ ctx, input }) => {
    const healthDataToInsert = input.map(item => ({
      user_id: ctx.user.id,
      date: item.date,
      data_type: item.dataType,
      value: item.value,
      unit: item.unit,
      source: item.source,
    }));

    const { data, error } = await ctx.supabase
      .from('health_data')
      .upsert(healthDataToInsert, {
        onConflict: 'user_id,date,data_type',
      })
      .select();

    if (error) {
      throw new Error(`Failed to add health data batch: ${error.message}`);
    }

    return data || [];
  });

export const remove = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('health_data')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to remove health data: ${error.message}`);
    }

    return { success: true };
  });

export const getInsights = protectedProcedure
  .query(async ({ ctx }) => {
    // Get recent health data for insights
    const { data: healthData, error } = await ctx.supabase
      .from('health_data')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 90 days
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch health data: ${error.message}`);
    }

    // Group data by type and calculate insights
    const insights = calculateHealthInsights(healthData || []);

    return insights;
  });

// Helper function to calculate health insights
function calculateHealthInsights(healthData: Array<{ data_type: string; value: number; date: string }>) {
  const insights: Record<string, {
    current: number | null;
    average: number | null;
    trend: 'increasing' | 'decreasing' | 'stable';
    dataPoints: number;
  }> = {};

  // Group data by type
  const dataByType = healthData.reduce((acc, item) => {
    if (!acc[item.data_type]) {
      acc[item.data_type] = [];
    }
    acc[item.data_type].push(item);
    return acc;
  }, {} as { [key: string]: Array<{ data_type: string; value: number; date: string }> });

  // Calculate insights for each data type
  Object.entries(dataByType).forEach(([dataType, data]) => {
    const values = data.map((d: { data_type: string; value: number; date: string }) => d.value);
    const recent7Days = data.slice(0, 7);
    const previous7Days = data.slice(7, 14);

    insights[dataType] = {
      current: values[0] || null,
      average: values.length > 0 ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length : null,
      trend: calculateTrend(recent7Days.map((d: { data_type: string; value: number; date: string }) => d.value), previous7Days.map((d: { data_type: string; value: number; date: string }) => d.value)),
      dataPoints: data.length,
    };
  });

  return insights;
}

function calculateTrend(recent: number[], previous: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (recent.length === 0 || previous.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const previousAvg = previous.reduce((sum, val) => sum + val, 0) / previous.length;

  const percentChange = ((recentAvg - previousAvg) / previousAvg) * 100;

  if (percentChange > 5) return 'increasing';
  if (percentChange < -5) return 'decreasing';
  return 'stable';
}