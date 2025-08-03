import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { format, parseISO, isWithinInterval, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Circle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useCycleStore } from '@/hooks/use-cycle-store';

export default function CalendarView() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { 
    periodLogs, 
    symptomLogs,
    userProfile, 
    getPredictedPeriods, 
    getFertileWindow,
    getLogsForDate,
    isLoading,
    isSyncing
  } = useCycleStore();

  console.log('CalendarView render:', {
    periodLogsCount: periodLogs.length,
    userProfile,
    isLoading,
    isSyncing
  });

  const predictedPeriods = getPredictedPeriods(3);
  const fertileWindow = getFertileWindow();
  const selectedDateLogs = getLogsForDate(selectedDate);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const getDayStyle = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSelected = dateStr === selectedDate;
    const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
    
    // Check if it's a period day
    const isPeriodDay = periodLogs.some(log => log.date === dateStr);
    
    // Check if it's a predicted period day
    const isPredictedPeriod = !userProfile.isPregnancyMode && predictedPeriods.some(period => {
      const start = parseISO(period.startDate);
      const end = parseISO(period.endDate);
      return date >= start && date <= end;
    });
    
    // Check if it's in fertile window
    const isFertileDay = !userProfile.isPregnancyMode && fertileWindow && isWithinInterval(date, {
      start: parseISO(fertileWindow.startDate),
      end: parseISO(fertileWindow.endDate)
    });
    
    const isOvulationDay = !userProfile.isPregnancyMode && fertileWindow && isSameDay(date, parseISO(fertileWindow.ovulationDate));

    let backgroundColor = Colors.light.background;
    let textColor = Colors.light.text;
    
    if (isPeriodDay) {
      const periodLog = periodLogs.find(log => log.date === dateStr);
      if (periodLog) {
        backgroundColor = periodLog.flow === 'light' 
          ? Colors.light.periodLight 
          : periodLog.flow === 'medium' 
            ? Colors.light.periodMedium 
            : Colors.light.periodHeavy;
        textColor = '#FFF';
      }
    } else if (isOvulationDay) {
      backgroundColor = Colors.light.ovulation;
      textColor = '#FFF';
    } else if (isFertileDay) {
      backgroundColor = Colors.light.fertile;
      textColor = '#FFF';
    } else if (isPredictedPeriod) {
      backgroundColor = Colors.light.periodLight;
      textColor = Colors.light.text;
    }
    
    if (isSelected) {
      return {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
        borderWidth: 2,
        textColor: '#FFF',
      };
    }
    
    if (isToday) {
      return {
        backgroundColor,
        borderColor: Colors.light.primary,
        borderWidth: 2,
        textColor,
      };
    }
    
    return {
      backgroundColor,
      borderColor: 'transparent',
      borderWidth: 2,
      textColor,
    };
  };

  const renderCalendar = () => {
    const firstDayOfWeek = getDay(monthStart);
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color={Colors.light.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {format(currentDate, 'MMMM yyyy')}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {emptyDays.map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCell} />
          ))}
          
          {calendarDays.map(date => {
            const dayStyle = getDayStyle(date);
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: dayStyle.backgroundColor,
                    borderColor: dayStyle.borderColor,
                    borderWidth: dayStyle.borderWidth,
                  }
                ]}
                onPress={() => handleDatePress(date)}
                testID={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
              >
                <Text style={[styles.dayText, { color: dayStyle.textColor }]}>
                  {format(date, 'd')}
                </Text>
                {/* Show symptom indicator */}
                {(() => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const daySymptoms = symptomLogs.filter(log => log.date === dateStr);
                  return daySymptoms.length > 0 && !periodLogs.some(log => log.date === dateStr) && (
                    <View style={styles.symptomIndicator}>
                      <Circle size={4} color={dayStyle.textColor} fill={dayStyle.textColor} />
                    </View>
                  );
                })()} 
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDateInfo = () => {
    const isPeriodDay = selectedDateLogs.periodLogs.length > 0;
    const isFertileDay = fertileWindow && isWithinInterval(parseISO(selectedDate), {
      start: parseISO(fertileWindow.startDate),
      end: parseISO(fertileWindow.endDate)
    });
    const isOvulationDay = fertileWindow && isSameDay(parseISO(selectedDate), parseISO(fertileWindow.ovulationDate));
    
    return (
      <View style={styles.dateInfoContainer}>
        <Text style={styles.dateTitle}>
          {format(parseISO(selectedDate), 'EEEE, MMMM d')}
        </Text>
        
        {isPeriodDay && (
          <View style={[styles.infoTag, { backgroundColor: Colors.light.periodMedium }]}>
            <Text style={styles.infoTagText}>Period Day</Text>
          </View>
        )}
        
        {isOvulationDay && !userProfile.isPregnancyMode && (
          <View style={[styles.infoTag, { backgroundColor: Colors.light.ovulation }]}>
            <Text style={styles.infoTagText}>Ovulation Day</Text>
          </View>
        )}
        
        {isFertileDay && !isOvulationDay && !userProfile.isPregnancyMode && (
          <View style={[styles.infoTag, { backgroundColor: Colors.light.fertile }]}>
            <Text style={styles.infoTagText}>Fertile Window</Text>
          </View>
        )}
        
        {selectedDateLogs.symptomLogs.length > 0 && (
          <View style={styles.symptomsContainer}>
            <Text style={styles.symptomsTitle}>Symptoms & Lifestyle:</Text>
            {selectedDateLogs.symptomLogs.map(log => {
              const symptomName = log.symptomId.split('-').slice(1).map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              
              return (
                <View key={log.id} style={styles.symptomItem}>
                  <Text style={styles.symptomText}>• {symptomName}</Text>
                  {log.intensity && (
                    <Text style={styles.intensityText}>({log.intensity}/5)</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const handleAddLog = () => {
    router.push('/log-period');
  };

  const handleAddSymptom = () => {
    router.push('/log-symptom');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {renderCalendar()}
        {renderDateInfo()}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors.light.periodLight }]}
            onPress={handleAddLog}
            testID="add-period-button"
            disabled={isSyncing}
          >
            <Text style={styles.actionButtonText}>
              {isSyncing ? 'Syncing...' : 'Log Period'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: Colors.light.lightGray }]}
            onPress={handleAddSymptom}
            testID="add-symptom-button"
            disabled={isSyncing}
          >
            <Plus size={16} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>
              {isSyncing ? 'Syncing...' : 'Add Symptom'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
  },
  calendar: {
    backgroundColor: Colors.light.background,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.lightGray,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.lightGray,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.darkGray,
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
    minHeight: 40,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dateInfoContainer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.light.lightGray,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  infoTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  infoTagText: {
    color: '#FFF',
    fontWeight: '500',
  },
  symptomsContainer: {
    marginTop: 12,
  },
  symptomsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  symptomText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  intensityText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginLeft: 8,
    fontWeight: '500',
  },
  symptomIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '600',
  },
});