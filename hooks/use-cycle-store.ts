import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInDays, format, parseISO, subDays } from "date-fns";

import { Cycle, PeriodLog, SymptomLog, UserProfile } from "@/types/cycle";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

const DEFAULT_PROFILE: UserProfile = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  isPregnancyMode: false,
};

export const [CycleContext, useCycleStore] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Queries
  const profileQuery = trpc.auth.profile.get.useQuery(undefined, {
    enabled: isAuthenticated && !!user,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const cyclesQuery = trpc.cycles.cycles.get.useQuery(undefined, {
    enabled: isAuthenticated && !!user,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const periodLogsQuery = trpc.cycles.periodLogs.get.useQuery(undefined, {
    enabled: isAuthenticated && !!user,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const symptomLogsQuery = trpc.cycles.symptomLogs.get.useQuery(undefined, {
    enabled: isAuthenticated && !!user,
    retry: 3,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mutations
  const updateProfileMutation = trpc.auth.profile.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['auth', 'profile', 'get']] });
    },
  });

  const updateCyclesMutation = trpc.cycles.cycles.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'get']] });
      queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'getAnalytics']] });
    },
  });

  const generatePredictionsMutation = trpc.cycles.cycles.generatePredictions.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'get']] });
      console.log('Predictions generated and cache invalidated');
    },
  });

  const addPeriodLogMutation = trpc.cycles.periodLogs.add.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['cycles', 'periodLogs', 'get']] });
      queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'getAnalytics']] });
    },
  });

  const removePeriodLogMutation = trpc.cycles.periodLogs.remove.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['cycles', 'periodLogs', 'get']] });
    },
  });

  const addSymptomLogMutation = trpc.cycles.symptomLogs.add.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['cycles', 'symptomLogs', 'get']] });
      queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'getAnalytics']] });
    },
  });

  const removeSymptomLogMutation = trpc.cycles.symptomLogs.remove.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['cycles', 'symptomLogs', 'get']] });
    },
  });

  // Update local state from queries
  useEffect(() => {
    if (profileQuery.data) {
      console.log('Profile data loaded:', profileQuery.data);
      setUserProfile({
        averageCycleLength: profileQuery.data.average_cycle_length,
        averagePeriodLength: profileQuery.data.average_period_length,
        lastPeriodStart: profileQuery.data.last_period_start,
        isPregnancyMode: profileQuery.data.is_pregnancy_mode,
        birthControlMethod: profileQuery.data.birth_control_method,
        pregnancyDueDate: profileQuery.data.pregnancy_due_date,
        pregnancyStartDate: profileQuery.data.pregnancy_start_date,
        currentWeek: profileQuery.data.current_week,
      });
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (cyclesQuery.data) {
      console.log('Cycles data loaded:', cyclesQuery.data.length, 'cycles');
      setCycles(cyclesQuery.data.map(cycle => ({
        id: cycle.id,
        startDate: cycle.start_date,
        endDate: cycle.end_date,
        length: cycle.length,
        periodLength: cycle.period_length,
      })));
    }
  }, [cyclesQuery.data]);

  useEffect(() => {
    if (periodLogsQuery.data) {
      console.log('Period logs data loaded:', periodLogsQuery.data.length, 'logs');
      setPeriodLogs(periodLogsQuery.data.map(log => ({
        id: log.id,
        date: log.date,
        flow: log.flow,
        notes: log.notes,
      })));
    }
  }, [periodLogsQuery.data]);

  useEffect(() => {
    if (symptomLogsQuery.data) {
      console.log('Symptom logs data loaded:', symptomLogsQuery.data.length, 'logs');
      setSymptomLogs(symptomLogsQuery.data.map(log => ({
        id: log.id,
        date: log.date,
        symptomId: log.symptom_id,
        intensity: log.intensity || undefined,
        customValue: log.custom_value || undefined,
        notes: log.notes || undefined,
      })));
    }
  }, [symptomLogsQuery.data]);

  // Helper functions
  const addPeriodLog = (log: Omit<PeriodLog, "id">) => {
    if (!isAuthenticated) return;

    addPeriodLogMutation.mutate({
      date: log.date,
      flow: log.flow,
      notes: log.notes,
    });

    // Update cycles and profile after adding period log
    const updatedLogs = [...periodLogs, { ...log, id: Date.now().toString() }];
    updateCyclesFromPeriodLogs(updatedLogs);
    
    // Update profile with last period start
    if (!userProfile.lastPeriodStart || parseISO(log.date) > parseISO(userProfile.lastPeriodStart)) {
      updateUserProfile({
        lastPeriodStart: log.date,
      });
    }
  };

  const updateCyclesFromPeriodLogs = (logs: PeriodLog[]) => {
    if (!isAuthenticated) return;

    // Sort logs by date
    const sortedLogs = [...logs].sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    // Group logs by continuous days to identify periods
    const periods: { startDate: string; endDate: string }[] = [];
    let currentPeriod: { startDate: string; endDate: string } | null = null;
    
    sortedLogs.forEach((log) => {
      const logDate = parseISO(log.date);
      
      if (!currentPeriod) {
        currentPeriod = { startDate: log.date, endDate: log.date };
      } else {
        const currentEndDate = parseISO(currentPeriod.endDate);
        const dayDiff = differenceInDays(logDate, currentEndDate);
        
        if (dayDiff <= 1) {
          // Continuous period
          currentPeriod.endDate = log.date;
        } else {
          // New period
          periods.push(currentPeriod);
          currentPeriod = { startDate: log.date, endDate: log.date };
        }
      }
    });
    
    if (currentPeriod) {
      periods.push(currentPeriod);
    }
    
    // Create cycles from periods
    const newCycles = periods.map((period, index) => {
      const nextPeriod = periods[index + 1];
      const cycleLength = nextPeriod 
        ? differenceInDays(parseISO(nextPeriod.startDate), parseISO(period.startDate))
        : undefined;
      const periodLength = differenceInDays(parseISO(period.endDate), parseISO(period.startDate)) + 1;
      
      return {
        start_date: period.startDate,
        end_date: nextPeriod?.startDate || null,
        length: cycleLength || null,
        period_length: periodLength,
      };
    });
    
    updateCyclesMutation.mutate(newCycles);
    
    // Update average cycle and period length in profile
    if (newCycles.length > 0) {
      const validCycleLengths = newCycles
        .filter(cycle => cycle.length !== null)
        .map(cycle => cycle.length as number);
      
      const validPeriodLengths = newCycles
        .filter(cycle => cycle.period_length !== null)
        .map(cycle => cycle.period_length as number);
      
      if (validCycleLengths.length > 0 || validPeriodLengths.length > 0) {
        const updates: Partial<UserProfile> = {};
        
        if (validCycleLengths.length > 0) {
          const avgCycleLength = validCycleLengths.reduce((sum, len) => sum + len, 0) / validCycleLengths.length;
          updates.averageCycleLength = Math.round(avgCycleLength);
        }
        
        if (validPeriodLengths.length > 0) {
          const avgPeriodLength = validPeriodLengths.reduce((sum, len) => sum + len, 0) / validPeriodLengths.length;
          updates.averagePeriodLength = Math.round(avgPeriodLength);
        }
        
        updateUserProfile(updates);
      }
    }
  };

  const removePeriodLog = (id: string) => {
    if (!isAuthenticated) return;
    removePeriodLogMutation.mutate({ id });
  };

  const addSymptomLog = (log: Omit<SymptomLog, "id">) => {
    if (!isAuthenticated) return;
    addSymptomLogMutation.mutate({
      date: log.date,
      symptom_id: log.symptomId,
      intensity: log.intensity,
      custom_value: log.customValue,
      notes: log.notes,
    });
  };

  const removeSymptomLog = (id: string) => {
    if (!isAuthenticated) return;
    removeSymptomLogMutation.mutate({ id });
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    if (!isAuthenticated) return;
    
    const updates: any = {};
    if (profile.averageCycleLength !== undefined) {
      updates.average_cycle_length = profile.averageCycleLength;
    }
    if (profile.averagePeriodLength !== undefined) {
      updates.average_period_length = profile.averagePeriodLength;
    }
    if (profile.lastPeriodStart !== undefined) {
      updates.last_period_start = profile.lastPeriodStart;
    }
    if (profile.isPregnancyMode !== undefined) {
      updates.is_pregnancy_mode = profile.isPregnancyMode;
    }
    if (profile.birthControlMethod !== undefined) {
      updates.birth_control_method = profile.birthControlMethod;
    }
    if (profile.pregnancyDueDate !== undefined) {
      updates.pregnancy_due_date = profile.pregnancyDueDate;
    }
    if (profile.pregnancyStartDate !== undefined) {
      updates.pregnancy_start_date = profile.pregnancyStartDate;
    }
    if (profile.currentWeek !== undefined) {
      updates.current_week = profile.currentWeek;
    }

    updateProfileMutation.mutate(updates);
  };

  const togglePregnancyMode = () => {
    updateUserProfile({ 
      isPregnancyMode: !userProfile.isPregnancyMode 
    });
  };

  const getPredictedPeriods = (count = 3) => {
    if (!userProfile.lastPeriodStart) return [];
    
    const predictions = [];
    let lastStart = parseISO(userProfile.lastPeriodStart);
    
    for (let i = 0; i < count; i++) {
      const nextStart = addDays(lastStart, userProfile.averageCycleLength);
      const nextEnd = addDays(nextStart, userProfile.averagePeriodLength - 1);
      
      predictions.push({
        startDate: format(nextStart, 'yyyy-MM-dd'),
        endDate: format(nextEnd, 'yyyy-MM-dd'),
      });
      
      lastStart = nextStart;
    }
    
    return predictions;
  };

  const getFertileWindow = () => {
    if (!userProfile.lastPeriodStart) return null;
    
    const lastStart = parseISO(userProfile.lastPeriodStart);
    const ovulationDay = addDays(lastStart, userProfile.averageCycleLength - 14);
    const fertileStart = subDays(ovulationDay, 5);
    const fertileEnd = addDays(ovulationDay, 1);
    
    return {
      startDate: format(fertileStart, 'yyyy-MM-dd'),
      endDate: format(fertileEnd, 'yyyy-MM-dd'),
      ovulationDate: format(ovulationDay, 'yyyy-MM-dd'),
    };
  };

  const getLogsForDate = (date: string) => {
    return {
      periodLogs: periodLogs.filter(log => log.date === date),
      symptomLogs: symptomLogs.filter(log => log.date === date),
    };
  };

  const manualSync = () => {
    if (!isAuthenticated) return;
    
    queryClient.invalidateQueries({ queryKey: [['auth', 'profile', 'get']] });
    queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'get']] });
    queryClient.invalidateQueries({ queryKey: [['cycles', 'cycles', 'getAnalytics']] });
    queryClient.invalidateQueries({ queryKey: [['cycles', 'periodLogs', 'get']] });
    queryClient.invalidateQueries({ queryKey: [['cycles', 'symptomLogs', 'get']] });
  };

  const isLoading = 
    profileQuery.isLoading || 
    cyclesQuery.isLoading || 
    periodLogsQuery.isLoading || 
    symptomLogsQuery.isLoading;

  const isSyncing = 
    updateProfileMutation.isPending ||
    updateCyclesMutation.isPending ||
    addPeriodLogMutation.isPending ||
    addSymptomLogMutation.isPending;

  return {
    cycles,
    periodLogs,
    symptomLogs,
    userProfile,
    isLoading,
    isSyncing,
    lastSyncTime: new Date(),
    addPeriodLog,
    removePeriodLog,
    addSymptomLog,
    removeSymptomLog,
    updateUserProfile,
    togglePregnancyMode,
    getPredictedPeriods,
    getFertileWindow,
    getLogsForDate,
    manualSync,
    generatePredictions: generatePredictionsMutation.mutateAsync,
    isGeneratingPredictions: generatePredictionsMutation.isPending,
  };
});