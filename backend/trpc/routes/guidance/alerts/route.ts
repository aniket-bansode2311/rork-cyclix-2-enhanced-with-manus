import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const get = protectedProcedure
  .input(z.object({
    type: z.enum(['predictive', 'reminder', 'warning']).optional(),
    severity: z.enum(['info', 'warning', 'critical']).optional(),
    dismissed: z.boolean().optional(),
  }).optional())
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from('health_alerts')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false });

    if (input?.type) {
      query = query.eq('type', input.type);
    }

    if (input?.severity) {
      query = query.eq('severity', input.severity);
    }

    if (input?.dismissed !== undefined) {
      query = query.eq('dismissed', input.dismissed);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch health alerts: ${error.message}`);
    }

    return data || [];
  });

export const add = protectedProcedure
  .input(z.object({
    type: z.enum(['predictive', 'reminder', 'warning']),
    title: z.string(),
    message: z.string(),
    severity: z.enum(['info', 'warning', 'critical']).default('info'),
    predicted_date: z.string().optional(),
    based_on: z.array(z.string()),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('health_alerts')
      .insert({
        user_id: ctx.user.id,
        type: input.type,
        title: input.title,
        message: input.message,
        severity: input.severity,
        predicted_date: input.predicted_date,
        based_on: JSON.stringify(input.based_on),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add health alert: ${error.message}`);
    }

    return data;
  });

export const update = protectedProcedure
  .input(z.object({
    id: z.string(),
    dismissed: z.boolean().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updates } = input;
    
    const { data, error } = await ctx.supabase
      .from('health_alerts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', ctx.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update health alert: ${error.message}`);
    }

    return data;
  });

export const remove = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('health_alerts')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to remove health alert: ${error.message}`);
    }

    return { success: true };
  });

export const generatePredictiveAlerts = protectedProcedure
  .mutation(async ({ ctx }) => {
    // Get user profile and historical data
    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    const { data: recentSymptoms } = await ctx.supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const { data: periodLogs } = await ctx.supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const alerts: Array<{
      type: 'predictive' | 'reminder' | 'warning';
      title: string;
      message: string;
      severity: 'info' | 'warning' | 'critical';
      predicted_date?: string;
      based_on: string[];
    }> = [];

    if (!profile?.is_pregnancy_mode && periodLogs && periodLogs.length > 0) {
      // Predict PMS symptoms based on historical data
      const pmsSymptoms = recentSymptoms?.filter(s => 
        ['mood-irritable', 'mood-sad', 'pain-cramps', 'body-bloating', 'mood-stressed'].includes(s.symptom_id)
      ) || [];

      if (pmsSymptoms.length > 0) {
        // Group symptoms by cycle phase to identify patterns
        const symptomsByPhase = pmsSymptoms.reduce((acc, symptom) => {
          const symptomDate = new Date(symptom.date);
          const lastPeriod = periodLogs.find(p => new Date(p.date) <= symptomDate);
          
          if (lastPeriod) {
            const daysSincePeriod = Math.floor((symptomDate.getTime() - new Date(lastPeriod.date).getTime()) / (1000 * 60 * 60 * 24));
            const cycleLength = profile?.average_cycle_length || 28;
            
            if (daysSincePeriod > cycleLength - 7) {
              acc.premenstrual = acc.premenstrual || [];
              acc.premenstrual.push(symptom);
            }
          }
          
          return acc;
        }, {} as { premenstrual?: any[] });

        if (symptomsByPhase.premenstrual && symptomsByPhase.premenstrual.length >= 2) {
          const nextPeriodDate = new Date();
          nextPeriodDate.setDate(nextPeriodDate.getDate() + (profile?.average_cycle_length || 28));
          
          const pmsStartDate = new Date(nextPeriodDate);
          pmsStartDate.setDate(pmsStartDate.getDate() - 7);

          alerts.push({
            type: 'predictive' as const,
            title: 'PMS Symptoms Likely',
            message: 'Based on your cycle pattern, you may experience PMS symptoms starting around this date. Consider stress management and self-care practices.',
            severity: 'info' as const,
            predicted_date: pmsStartDate.toISOString().split('T')[0],
            based_on: ['Historical PMS symptom patterns'],
          });
        }
      }

      // Predict period start date
      if (periodLogs.length >= 2) {
        const lastPeriod = periodLogs[0];
        const cycleLength = profile?.average_cycle_length || 28;
        const nextPeriodDate = new Date(lastPeriod.date);
        nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

        alerts.push({
          type: 'predictive' as const,
          title: 'Period Expected Soon',
          message: `Your next period is expected around ${nextPeriodDate.toLocaleDateString()}. Consider preparing supplies and tracking any pre-period symptoms.`,
          severity: 'info' as const,
          predicted_date: nextPeriodDate.toISOString().split('T')[0],
          based_on: ['Cycle length patterns'],
        });
      }
    }

    // Save generated alerts to database
    if (alerts.length > 0) {
      const alertsToInsert = alerts.map(alert => ({
        user_id: ctx.user.id,
        ...alert,
        based_on: JSON.stringify(alert.based_on),
      }));

      const { data, error } = await ctx.supabase
        .from('health_alerts')
        .insert(alertsToInsert)
        .select();

      if (error) {
        throw new Error(`Failed to save predictive alerts: ${error.message}`);
      }

      return data;
    }

    return [];
  });