import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { format, parseISO } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { CycleContext } from '@/hooks/use-cycle-store';
import SymptomSelector from '@/components/SymptomSelector';
import Colors from '@/constants/colors';

export default function LogSymptomScreen() {
  return (
    <CycleContext>
      <LogSymptomContent />
    </CycleContext>
  );
}

function LogSymptomContent() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  
  // Use the date from URL params if provided, otherwise use today
  const initialDate = date ? parseISO(date) : new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  
  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const handleClose = () => {
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Log Symptoms',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <View style={styles.dateSelector}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => handleDateChange(-1)}
          testID="previous-day-button"
        >
          <Text style={styles.dateButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <View style={styles.selectedDate}>
          <Text style={styles.selectedDateText}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => handleDateChange(1)}
          testID="next-day-button"
        >
          <Text style={styles.dateButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      
      <SymptomSelector 
        date={format(selectedDate, 'yyyy-MM-dd')}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  dateButton: {
    padding: 8,
  },
  dateButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  selectedDate: {
    flex: 1,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
});