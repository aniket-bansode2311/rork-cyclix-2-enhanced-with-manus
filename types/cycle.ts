export interface Symptom {
  id: string;
  name: string;
  icon: string;
  category: "mood" | "pain" | "body" | "discharge" | "energy" | "lifestyle" | "appetite" | "intimacy" | "tests" | "pregnancy";
  intensity?: 1 | 2 | 3 | 4 | 5;
  customValue?: string;
}

export interface SymptomLog {
  id: string;
  date: string;
  symptomId: string;
  intensity?: 1 | 2 | 3 | 4 | 5;
  customValue?: string;
  notes?: string;
}

export interface CycleAnalytics {
  cycleLengthVariation: number[];
  periodLengthVariation: number[];
  symptomPatterns: SymptomFrequency[];
  ovulationAccuracy?: number;
  dataQualityScore: number;
}

export interface PeriodLog {
  id: string;
  date: string;
  flow: "light" | "medium" | "heavy" | "spotting";
  notes?: string;
}

export interface Cycle {
  id: string;
  startDate: string;
  endDate?: string;
  length?: number;
  periodLength?: number;
  predictedOvulationDate?: string;
  predictedFertileWindowStart?: string;
  predictedFertileWindowEnd?: string;
  cycleQualityScore?: number;
}

export interface UserProfile {
  averageCycleLength: number;
  averagePeriodLength: number;
  lastPeriodStart?: string;
  isPregnancyMode: boolean;
  birthControlMethod?: string;
  pregnancyDueDate?: string;
  pregnancyStartDate?: string;
  currentWeek?: number;
}

export interface HealthData {
  id: string;
  date: string;
  dataType: 'bbt' | 'weight' | 'sleep' | 'steps' | 'heart_rate';
  value: number;
  unit?: string;
  source: 'apple_health' | 'google_fit' | 'manual';
}

export interface CyclePrediction {
  id: string;
  predictionDate: string;
  predictedPeriodStart: string;
  predictedPeriodEnd: string;
  predictedOvulationDate?: string;
  predictedFertileWindowStart?: string;
  predictedFertileWindowEnd?: string;
  confidenceScore?: number;
  algorithmVersion: string;
}

export interface CycleInsight {
  type: 'cycle_length' | 'period_length' | 'symptom_frequency' | 'ovulation_pattern';
  title: string;
  description: string;
  value?: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}

export interface SymptomFrequency {
  symptomId: string;
  frequency: number;
  averageIntensity?: number;
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

export interface PregnancyData {
  id: string;
  userId: string;
  dueDate: string;
  startDate: string;
  currentWeek: number;
  milestones: PregnancyMilestone[];
  weeklyUpdates: WeeklyUpdate[];
}

export interface PregnancyMilestone {
  id: string;
  week: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  category: 'appointment' | 'test' | 'development' | 'preparation';
}

export interface WeeklyUpdate {
  week: number;
  babyDevelopment: string;
  motherChanges: string;
  tips: string[];
  commonSymptoms: string[];
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'nutrition' | 'exercise' | 'stress' | 'sleep' | 'symptom_management';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  basedOn: string[];
  validUntil?: string;
}

export interface HealthAlert {
  id: string;
  type: 'predictive' | 'reminder' | 'warning';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  predictedDate?: string;
  basedOn: string[];
  dismissed: boolean;
}