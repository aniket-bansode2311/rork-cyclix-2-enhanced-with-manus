import { z } from "zod";
import { protectedProcedure } from "../../../create-context";

export const get = protectedProcedure
  .input(z.object({
    type: z.enum(['nutrition', 'exercise', 'stress', 'sleep', 'symptom_management']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dismissed: z.boolean().optional(),
  }).optional())
  .query(async ({ ctx, input }) => {
    let query = ctx.supabase
      .from('personalized_recommendations')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false });

    if (input?.type) {
      query = query.eq('type', input.type);
    }

    if (input?.priority) {
      query = query.eq('priority', input.priority);
    }

    if (input?.dismissed !== undefined) {
      query = query.eq('dismissed', input.dismissed);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    return data || [];
  });

export const add = protectedProcedure
  .input(z.object({
    type: z.enum(['nutrition', 'exercise', 'stress', 'sleep', 'symptom_management']),
    title: z.string(),
    description: z.string(),
    action_items: z.array(z.string()),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    based_on: z.array(z.string()),
    valid_until: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { data, error } = await ctx.supabase
      .from('personalized_recommendations')
      .insert({
        user_id: ctx.user.id,
        type: input.type,
        title: input.title,
        description: input.description,
        action_items: JSON.stringify(input.action_items),
        priority: input.priority,
        based_on: JSON.stringify(input.based_on),
        valid_until: input.valid_until,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add recommendation: ${error.message}`);
    }

    return data;
  });

export const update = protectedProcedure
  .input(z.object({
    id: z.string(),
    dismissed: z.boolean().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { id, ...updates } = input;
    
    const { data, error } = await ctx.supabase
      .from('personalized_recommendations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', ctx.user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recommendation: ${error.message}`);
    }

    return data;
  });

export const remove = protectedProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('personalized_recommendations')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.user.id);

    if (error) {
      throw new Error(`Failed to remove recommendation: ${error.message}`);
    }

    return { success: true };
  });

export const generatePersonalizedRecommendations = protectedProcedure
  .mutation(async ({ ctx }) => {
    // Get user profile and recent data
    const { data: profile } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    const { data: recentSymptoms } = await ctx.supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const { data: healthData } = await ctx.supabase
      .from('health_data')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    const recommendations = [];

    // Analyze symptoms and generate recommendations
    if (recentSymptoms && recentSymptoms.length > 0) {
      const symptomCounts = recentSymptoms.reduce((acc, symptom) => {
        acc[symptom.symptom_id] = (acc[symptom.symptom_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Stress management recommendations
      const stressSymptoms = ['mood-stressed', 'mood-anxious', 'sleep-insomnia'];
      const stressCount = stressSymptoms.reduce((sum, symptom) => sum + (symptomCounts[symptom] || 0), 0);
      
      if (stressCount >= 3) {
        recommendations.push({
          type: 'stress' as const,
          title: 'Stress Management Techniques',
          description: 'Based on your recent mood and sleep patterns, incorporating stress management techniques could help improve your overall well-being.',
          action_items: [
            'Try 10 minutes of daily meditation',
            'Practice deep breathing exercises',
            'Consider gentle yoga or stretching',
            'Maintain a regular sleep schedule'
          ],
          priority: 'high' as const,
          based_on: ['Recent stress and anxiety symptoms', 'Sleep disturbances'],
        });
      }

      // Sleep recommendations
      const sleepSymptoms = ['sleep-insomnia', 'sleep-restless', 'energy-low'];
      const sleepCount = sleepSymptoms.reduce((sum, symptom) => sum + (symptomCounts[symptom] || 0), 0);
      
      if (sleepCount >= 2) {
        recommendations.push({
          type: 'sleep' as const,
          title: 'Sleep Quality Improvement',
          description: 'Your recent logs suggest sleep quality issues. These strategies can help improve your rest.',
          action_items: [
            'Create a consistent bedtime routine',
            'Limit screen time 1 hour before bed',
            'Keep bedroom cool and dark',
            'Avoid caffeine after 2 PM'
          ],
          priority: 'medium' as const,
          based_on: ['Sleep quality symptoms', 'Low energy levels'],
        });
      }

      // Pain management for cramps
      if (symptomCounts['pain-cramps'] >= 2) {
        recommendations.push({
          type: 'symptom_management' as const,
          title: 'Menstrual Cramp Relief',
          description: 'Natural ways to manage menstrual cramps and reduce discomfort.',
          action_items: [
            'Apply heat therapy (heating pad or warm bath)',
            'Try gentle exercise like walking',
            'Stay hydrated',
            'Consider magnesium supplements (consult healthcare provider)'
          ],
          priority: 'medium' as const,
          based_on: ['Frequent menstrual cramps'],
        });
      }
    }

    // Pregnancy-specific recommendations
    if (profile?.is_pregnancy_mode) {
      const currentWeek = profile.current_week || 1;
      
      if (currentWeek <= 12) {
        recommendations.push({
          type: 'nutrition' as const,
          title: 'First Trimester Nutrition',
          description: 'Essential nutrition guidelines for your first trimester to support healthy development.',
          action_items: [
            'Take prenatal vitamins with folic acid',
            'Eat small, frequent meals to manage nausea',
            'Stay hydrated with water and herbal teas',
            'Include protein-rich foods in every meal'
          ],
          priority: 'high' as const,
          based_on: ['First trimester pregnancy'],
        });
      } else if (currentWeek <= 28) {
        recommendations.push({
          type: 'exercise' as const,
          title: 'Second Trimester Exercise',
          description: 'Safe and beneficial exercises for your second trimester.',
          action_items: [
            'Continue or start prenatal yoga',
            'Take daily walks for 20-30 minutes',
            'Try swimming for low-impact cardio',
            'Practice pelvic floor exercises'
          ],
          priority: 'medium' as const,
          based_on: ['Second trimester pregnancy'],
        });
      } else {
        recommendations.push({
          type: 'stress' as const,
          title: 'Third Trimester Preparation',
          description: 'Managing anxiety and preparing for birth in your final trimester.',
          action_items: [
            'Practice relaxation techniques for labor',
            'Prepare your birth plan',
            'Pack your hospital bag',
            'Consider prenatal classes'
          ],
          priority: 'high' as const,
          based_on: ['Third trimester pregnancy'],
        });
      }
    }

    // General wellness recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'nutrition' as const,
        title: 'Cycle-Supporting Nutrition',
        description: 'Nutritional support for hormonal balance and overall reproductive health.',
        action_items: [
          'Include iron-rich foods during menstruation',
          'Eat omega-3 fatty acids for hormone balance',
          'Consume calcium and magnesium for PMS relief',
          'Stay hydrated throughout your cycle'
        ],
        priority: 'low' as const,
        based_on: ['General cycle health'],
      });
    }

    // Insert recommendations into database
    const recommendationsToInsert = recommendations.map(rec => ({
      user_id: ctx.user.id,
      ...rec,
      action_items: JSON.stringify(rec.action_items),
      based_on: JSON.stringify(rec.based_on),
    }));

    const { data, error } = await ctx.supabase
      .from('personalized_recommendations')
      .insert(recommendationsToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }

    return data || [];
  });