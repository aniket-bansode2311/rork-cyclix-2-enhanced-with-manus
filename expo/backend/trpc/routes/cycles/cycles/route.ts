import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { addDays, differenceInDays, parseISO, format, subDays } from "date-fns";

export const get = protectedProcedure
  .query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('cycles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('start_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch cycles: ${error.message}`);
    }

    return data || [];
  });

export const getAnalytics = protectedProcedure
  .query(async ({ ctx }) => {
    // Get cycles data
    const { data: cycles, error: cyclesError } = await ctx.supabase
      .from('cycles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('start_date', { ascending: false })
      .limit(12); // Last 12 cycles for analysis

    if (cyclesError) {
      throw new Error(`Failed to fetch cycles: ${cyclesError.message}`);
    }

    // Get symptom logs for pattern analysis
    const { data: symptomLogs, error: symptomsError } = await ctx.supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .gte('date', format(subDays(new Date(), 365), 'yyyy-MM-dd')); // Last year

    if (symptomsError) {
      throw new Error(`Failed to fetch symptom logs: ${symptomsError.message}`);
    }

    // Calculate analytics
    const cycleLengthVariation = cycles
      ?.filter(c => c.length)
      .map(c => c.length) || [];
    
    const periodLengthVariation = cycles
      ?.filter(c => c.period_length)
      .map(c => c.period_length) || [];

    // Calculate symptom patterns
    const symptomPatterns = calculateSymptomPatterns(symptomLogs || [], cycles || []);
    
    // Calculate data quality score
    const dataQualityScore = calculateDataQualityScore(cycles || [], symptomLogs || []);

    return {
      cycleLengthVariation,
      periodLengthVariation,
      symptomPatterns,
      dataQualityScore,
    };
  });

export const generatePredictions = protectedProcedure
  .mutation(async ({ ctx }) => {
    // Get user profile
    const { data: profile, error: profileError } = await ctx.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    // Get recent cycles for better prediction
    const { data: cycles, error: cyclesError } = await ctx.supabase
      .from('cycles')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('start_date', { ascending: false })
      .limit(6);

    if (cyclesError) {
      throw new Error(`Failed to fetch cycles: ${cyclesError.message}`);
    }

    // Get period logs for more accurate predictions
    const { data: periodLogs, error: periodError } = await ctx.supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('date', { ascending: false })
      .limit(50);

    if (periodError) {
      throw new Error(`Failed to fetch period logs: ${periodError.message}`);
    }

    // Generate predictions using advanced algorithm
    const predictions = generateAdvancedPredictions(profile, cycles || [], periodLogs || []);
    
    // Store predictions in database
    const { data, error } = await ctx.supabase
      .from('cycle_predictions')
      .upsert(predictions.map(pred => ({
        user_id: ctx.user.id,
        prediction_date: format(new Date(), 'yyyy-MM-dd'),
        predicted_period_start: pred.predictedPeriodStart,
        predicted_period_end: pred.predictedPeriodEnd,
        predicted_ovulation_date: pred.predictedOvulationDate,
        predicted_fertile_window_start: pred.predictedFertileWindowStart,
        predicted_fertile_window_end: pred.predictedFertileWindowEnd,
        confidence_score: pred.confidenceScore,
        algorithm_version: pred.algorithmVersion,
      })), {
        onConflict: 'user_id,prediction_date',
      })
      .select();

    if (error) {
      throw new Error(`Failed to store predictions: ${error.message}`);
    }

    return predictions;
  });

export const update = protectedProcedure
  .input(z.array(z.object({
    id: z.string().optional(),
    start_date: z.string(),
    end_date: z.string().nullable().optional(),
    length: z.number().nullable().optional(),
    period_length: z.number().nullable().optional(),
    predicted_ovulation_date: z.string().nullable().optional(),
    predicted_fertile_window_start: z.string().nullable().optional(),
    predicted_fertile_window_end: z.string().nullable().optional(),
    cycle_quality_score: z.number().nullable().optional(),
  })))
  .mutation(async ({ ctx, input }) => {
    // Delete existing cycles for this user
    await ctx.supabase
      .from('cycles')
      .delete()
      .eq('user_id', ctx.user.id);

    if (input.length === 0) {
      return [];
    }

    // Insert new cycles with enhanced predictions
    const cyclesToInsert = input.map(cycle => ({
      user_id: ctx.user.id,
      start_date: cycle.start_date,
      end_date: cycle.end_date,
      length: cycle.length,
      period_length: cycle.period_length,
      predicted_ovulation_date: cycle.predicted_ovulation_date,
      predicted_fertile_window_start: cycle.predicted_fertile_window_start,
      predicted_fertile_window_end: cycle.predicted_fertile_window_end,
      cycle_quality_score: cycle.cycle_quality_score,
    }));

    const { data, error } = await ctx.supabase
      .from('cycles')
      .insert(cyclesToInsert)
      .select();

    if (error) {
      throw new Error(`Failed to update cycles: ${error.message}`);
    }

    return data || [];
  });

// Helper functions
function calculateSymptomPatterns(symptomLogs: any[], cycles: any[]) {
  const symptomFrequency: { [key: string]: { count: number; totalIntensity: number; phases: string[] } } = {};
  
  symptomLogs.forEach(log => {
    const symptomId = log.symptom_id;
    const logDate = parseISO(log.date);
    
    // Find which cycle this symptom belongs to
    const cycle = cycles.find(c => {
      const cycleStart = parseISO(c.start_date);
      const cycleEnd = c.end_date ? parseISO(c.end_date) : addDays(cycleStart, 28);
      return logDate >= cycleStart && logDate <= cycleEnd;
    });
    
    if (cycle) {
      const cycleStart = parseISO(cycle.start_date);
      const dayInCycle = differenceInDays(logDate, cycleStart) + 1;
      
      // Determine cycle phase
      let phase = 'follicular';
      if (dayInCycle <= (cycle.period_length || 5)) {
        phase = 'menstrual';
      } else if (dayInCycle >= 12 && dayInCycle <= 16) {
        phase = 'ovulation';
      } else if (dayInCycle > 16) {
        phase = 'luteal';
      }
      
      if (!symptomFrequency[symptomId]) {
        symptomFrequency[symptomId] = { count: 0, totalIntensity: 0, phases: [] };
      }
      
      symptomFrequency[symptomId].count++;
      symptomFrequency[symptomId].totalIntensity += log.intensity || 0;
      symptomFrequency[symptomId].phases.push(phase);
    }
  });
  
  return Object.entries(symptomFrequency).map(([symptomId, data]) => ({
    symptomId,
    frequency: data.count,
    averageIntensity: data.totalIntensity / data.count,
    cyclePhase: getMostCommonPhase(data.phases),
  }));
}

function getMostCommonPhase(phases: string[]): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
  const counts = phases.reduce((acc, phase) => {
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const mostCommon = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0];
  return mostCommon as 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

function calculateDataQualityScore(cycles: any[], symptomLogs: any[]): number {
  let score = 0;
  
  // Base score for having cycles
  if (cycles.length > 0) score += 0.3;
  if (cycles.length >= 3) score += 0.2;
  if (cycles.length >= 6) score += 0.1;
  
  // Score for symptom logging consistency
  if (symptomLogs.length > 0) score += 0.2;
  if (symptomLogs.length >= 30) score += 0.1;
  
  // Score for recent data
  const recentLogs = symptomLogs.filter(log => 
    differenceInDays(new Date(), parseISO(log.date)) <= 30
  );
  if (recentLogs.length >= 10) score += 0.1;
  
  return Math.min(score, 1.0);
}

function generateAdvancedPredictions(profile: any, cycles: any[], periodLogs: any[]) {
  const predictions = [];
  
  // Calculate weighted averages based on recent cycles
  const recentCycles = cycles.slice(0, 3);
  const weights = [0.5, 0.3, 0.2]; // More weight to recent cycles
  
  let weightedCycleLength = profile.average_cycle_length;
  let weightedPeriodLength = profile.average_period_length;
  
  if (recentCycles.length > 0) {
    const validCycleLengths = recentCycles.filter(c => c.length).map(c => c.length);
    const validPeriodLengths = recentCycles.filter(c => c.period_length).map(c => c.period_length);
    
    if (validCycleLengths.length > 0) {
      weightedCycleLength = validCycleLengths.reduce((sum, length, index) => 
        sum + length * (weights[index] || 0.1), 0
      ) / validCycleLengths.reduce((sum, _, index) => sum + (weights[index] || 0.1), 0);
    }
    
    if (validPeriodLengths.length > 0) {
      weightedPeriodLength = validPeriodLengths.reduce((sum, length, index) => 
        sum + length * (weights[index] || 0.1), 0
      ) / validPeriodLengths.reduce((sum, _, index) => sum + (weights[index] || 0.1), 0);
    }
  }
  
  // Calculate confidence based on data consistency
  const cycleVariation = calculateVariation(recentCycles.filter(c => c.length).map(c => c.length));
  const baseConfidence = Math.max(0.5, 1 - (cycleVariation / weightedCycleLength));
  
  // Generate 3 predictions
  let lastPeriodStart = profile.last_period_start ? parseISO(profile.last_period_start) : new Date();
  
  for (let i = 0; i < 3; i++) {
    const nextPeriodStart = addDays(lastPeriodStart, Math.round(weightedCycleLength));
    const nextPeriodEnd = addDays(nextPeriodStart, Math.round(weightedPeriodLength) - 1);
    
    // Calculate ovulation and fertile window
    const ovulationDate = subDays(nextPeriodStart, 14);
    const fertileStart = subDays(ovulationDate, 5);
    const fertileEnd = addDays(ovulationDate, 1);
    
    // Adjust confidence based on prediction distance
    const adjustedConfidence = Math.max(0.3, baseConfidence - (i * 0.1));
    
    predictions.push({
      predictedPeriodStart: format(nextPeriodStart, 'yyyy-MM-dd'),
      predictedPeriodEnd: format(nextPeriodEnd, 'yyyy-MM-dd'),
      predictedOvulationDate: format(ovulationDate, 'yyyy-MM-dd'),
      predictedFertileWindowStart: format(fertileStart, 'yyyy-MM-dd'),
      predictedFertileWindowEnd: format(fertileEnd, 'yyyy-MM-dd'),
      confidenceScore: Math.round(adjustedConfidence * 100) / 100,
      algorithmVersion: '2.0',
    });
    
    lastPeriodStart = nextPeriodStart;
  }
  
  return predictions;
}

function calculateVariation(values: number[]): number {
  if (values.length < 2) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}