import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { CycleContext, useCycleStore } from '@/hooks/use-cycle-store';
import Colors from '@/constants/colors';

export default function LogPeriodScreen() {
  return (
    <CycleContext>
      <LogPeriodContent />
    </CycleContext>
  );
}

function LogPeriodContent() {
  const router = useRouter();
  const { addPeriodLog } = useCycleStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedFlow, setSelectedFlow] = useState<'light' | 'medium' | 'heavy' | 'spotting'>('medium');
  const [notes, setNotes] = useState('');
  
  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };
  
  const handleFlowSelect = (flow: 'light' | 'medium' | 'heavy' | 'spotting') => {
    setSelectedFlow(flow);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };
  
  const handleSave = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Basic validation
    if (!selectedFlow) {
      Alert.alert('Error', 'Please select a flow intensity.');
      return;
    }
    
    addPeriodLog({
      date: dateStr,
      flow: selectedFlow,
      notes: notes.trim() || undefined,
    });
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    router.back();
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Log Period',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          
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
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flow Intensity</Text>
          
          <View style={styles.flowOptions}>
            <TouchableOpacity 
              style={[
                styles.flowOption, 
                selectedFlow === 'light' && styles.selectedFlowOption
              ]}
              onPress={() => handleFlowSelect('light')}
              testID="flow-light-button"
            >
              <View 
                style={[
                  styles.flowIndicator, 
                  { backgroundColor: Colors.light.periodLight }
                ]} 
              />
              <Text style={styles.flowText}>Light</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.flowOption, 
                selectedFlow === 'medium' && styles.selectedFlowOption
              ]}
              onPress={() => handleFlowSelect('medium')}
              testID="flow-medium-button"
            >
              <View 
                style={[
                  styles.flowIndicator, 
                  { backgroundColor: Colors.light.periodMedium }
                ]} 
              />
              <Text style={styles.flowText}>Medium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.flowOption, 
                selectedFlow === 'heavy' && styles.selectedFlowOption
              ]}
              onPress={() => handleFlowSelect('heavy')}
              testID="flow-heavy-button"
            >
              <View 
                style={[
                  styles.flowIndicator, 
                  { backgroundColor: Colors.light.periodHeavy }
                ]} 
              />
              <Text style={styles.flowText}>Heavy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.flowOption, 
                selectedFlow === 'spotting' && styles.selectedFlowOption
              ]}
              onPress={() => handleFlowSelect('spotting')}
              testID="flow-spotting-button"
            >
              <View 
                style={[
                  styles.flowIndicator, 
                  styles.spottingIndicator,
                  { borderColor: Colors.light.periodLight }
                ]} 
              />
              <Text style={styles.flowText}>Spotting</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about your period..."
            placeholderTextColor={Colors.light.darkGray}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={500}
            testID="notes-input"
          />
          <Text style={styles.characterCount}>{notes.length}/500</Text>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          testID="save-period-button"
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 16,
    color: Colors.light.text,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    padding: 12,
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
  flowOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  flowOption: {
    width: '48%',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFlowOption: {
    borderColor: Colors.light.primary,
  },
  flowIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  spottingIndicator: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  flowText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.lightGray,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textAlign: 'right',
    marginTop: 8,
  },
});