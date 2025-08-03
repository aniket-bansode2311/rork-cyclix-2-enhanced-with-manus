import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Calendar, AlertCircle } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useCycleStore } from '@/hooks/use-cycle-store';

type CycleSummaryProps = {
  onViewCalendar?: () => void;
};

export default function CycleSummary({ onViewCalendar }: CycleSummaryProps) {
  const { userProfile, periodLogs, getPredictedPeriods, getFertileWindow, isLoading } = useCycleStore();
  
  console.log('CycleSummary render:', {
    userProfile,
    periodLogsCount: periodLogs.length,
    isLoading
  });
  
  const nextPeriods = getPredictedPeriods(1);
  const fertileWindow = getFertileWindow();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const getDaysUntilNextPeriod = () => {
    if (nextPeriods.length === 0) return null;
    
    const nextPeriod = nextPeriods[0];
    const daysUntil = differenceInDays(parseISO(nextPeriod.startDate), parseISO(today));
    
    if (daysUntil < 0) return 'Today';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `${daysUntil} days`;
  };
  
  const getCyclePhase = () => {
    if (!userProfile.lastPeriodStart) return 'Getting Started';
    if (userProfile.isPregnancyMode) return 'Pregnancy Mode';
    
    const daysUntil = getDaysUntilNextPeriod();
    
    if (daysUntil === 'Today') return 'Period';
    
    if (fertileWindow) {
      const fertileStart = parseISO(fertileWindow.startDate);
      const fertileEnd = parseISO(fertileWindow.endDate);
      const ovulationDate = parseISO(fertileWindow.ovulationDate);
      const currentDate = parseISO(today);
      
      if (currentDate.getTime() === ovulationDate.getTime()) {
        return 'Ovulation Day';
      }
      
      if (currentDate >= fertileStart && currentDate <= fertileEnd) {
        return 'Fertile Window';
      }
    }
    
    if (nextPeriods.length > 0) {
      const nextPeriod = nextPeriods[0];
      const daysUntil = differenceInDays(parseISO(nextPeriod.startDate), parseISO(today));
      
      if (daysUntil <= 7) return 'Luteal Phase';
      if (daysUntil <= 14) return 'Ovulation Phase';
      return 'Follicular Phase';
    }
    
    return 'Getting Started';
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.phaseContainer}>
              <Text style={styles.phaseLabel}>Current Phase</Text>
              <Text style={styles.phaseValue}>Loading...</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  
  // Show setup state if no data
  if (!userProfile.lastPeriodStart && periodLogs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.phaseContainer}>
              <Text style={styles.phaseLabel}>Welcome to Your Cycle Tracker</Text>
              <Text style={styles.phaseValue}>Getting Started</Text>
            </View>
            
            {onViewCalendar && (
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={onViewCalendar}
                testID="view-calendar-button"
              >
                <Calendar size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.setupCard}>
            <AlertCircle size={20} color={Colors.light.primary} style={styles.setupIcon} />
            <Text style={styles.setupText}>Log your first period to start tracking your cycle and get predictions</Text>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.phaseContainer}>
            <Text style={styles.phaseLabel}>Current Phase</Text>
            <Text style={styles.phaseValue}>{getCyclePhase()}</Text>
          </View>
          
          {onViewCalendar && (
            <TouchableOpacity 
              style={styles.calendarButton}
              onPress={onViewCalendar}
              testID="view-calendar-button"
            >
              <Calendar size={20} color={Colors.light.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        {!userProfile.isPregnancyMode && nextPeriods.length > 0 && (
          <View style={styles.periodContainer}>
            <Text style={styles.periodLabel}>Next Period</Text>
            <Text style={styles.periodValue}>{getDaysUntilNextPeriod()}</Text>
            <Text style={styles.periodDate}>
              {format(parseISO(nextPeriods[0].startDate), 'MMM d')}
            </Text>
          </View>
        )}
        
        {userProfile.isPregnancyMode && (
          <View style={styles.pregnancyContainer}>
            <Text style={styles.pregnancyText}>
              Tracking pregnancy-related symptoms
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  phaseContainer: {
    flex: 1,
  },
  phaseLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  phaseValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginRight: 8,
  },
  periodValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  periodDate: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginLeft: 'auto',
  },
  pregnancyContainer: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  pregnancyText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  setupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  setupIcon: {
    marginRight: 12,
  },
  setupText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 18,
  },
});