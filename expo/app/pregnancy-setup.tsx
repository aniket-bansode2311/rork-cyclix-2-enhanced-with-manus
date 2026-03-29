import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Baby, Calendar, ArrowRight } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInWeeks, addWeeks } from 'date-fns';

import Colors from '@/constants/colors';
import { CycleContext, useCycleStore } from '@/hooks/use-cycle-store';

export default function PregnancySetupScreen() {
  return (
    <CycleContext>
      <PregnancySetupContent />
    </CycleContext>
  );
}

function PregnancySetupContent() {
  const router = useRouter();
  const { updateUserProfile } = useCycleStore();
  
  const [setupType, setSetupType] = useState<'due_date' | 'start_date' | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSetupComplete = () => {
    if (!setupType) {
      Alert.alert('Setup Required', 'Please select how you want to set up pregnancy tracking.');
      return;
    }

    let pregnancyStartDate: string;
    let pregnancyDueDate: string;
    let currentWeek: number;

    if (setupType === 'due_date') {
      pregnancyDueDate = format(selectedDate, 'yyyy-MM-dd');
      pregnancyStartDate = format(addWeeks(selectedDate, -40), 'yyyy-MM-dd');
      currentWeek = Math.max(1, Math.min(40, differenceInWeeks(new Date(), addWeeks(selectedDate, -40)) + 1));
    } else {
      pregnancyStartDate = format(selectedDate, 'yyyy-MM-dd');
      pregnancyDueDate = format(addWeeks(selectedDate, 40), 'yyyy-MM-dd');
      currentWeek = Math.max(1, Math.min(40, differenceInWeeks(new Date(), selectedDate) + 1));
    }

    updateUserProfile({
      isPregnancyMode: true,
      pregnancyStartDate,
      pregnancyDueDate,
      currentWeek,
    });

    Alert.alert(
      'Pregnancy Mode Enabled',
      `You're now in pregnancy mode! You're currently in week ${currentWeek} of your pregnancy.`,
      [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)/')
        }
      ]
    );
  };

  const renderSetupOption = (
    type: 'due_date' | 'start_date',
    title: string,
    description: string,
    icon: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.setupOption,
        setupType === type && styles.setupOptionSelected
      ]}
      onPress={() => setSetupType(type)}
    >
      <View style={styles.setupOptionIcon}>
        {icon}
      </View>
      <View style={styles.setupOptionContent}>
        <Text style={styles.setupOptionTitle}>{title}</Text>
        <Text style={styles.setupOptionDescription}>{description}</Text>
      </View>
      <View style={styles.setupOptionRadio}>
        <View style={[
          styles.radioOuter,
          setupType === type && styles.radioSelected
        ]}>
          {setupType === type && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Pregnancy Setup',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Baby size={48} color={Colors.light.primary} />
          <Text style={styles.title}>Set Up Pregnancy Tracking</Text>
          <Text style={styles.subtitle}>
            Choose how you'd like to configure your pregnancy tracking. We'll calculate your current week and due date.
          </Text>
        </View>

        <View style={styles.setupOptions}>
          {renderSetupOption(
            'due_date',
            'I know my due date',
            'Enter your expected due date and we\'ll calculate everything else',
            <Calendar size={24} color={Colors.light.primary} />
          )}

          {renderSetupOption(
            'start_date',
            'I know when I conceived',
            'Enter your conception date or last menstrual period',
            <Baby size={24} color={Colors.light.secondary} />
          )}
        </View>

        {setupType && (
          <View style={styles.dateSection}>
            <Text style={styles.dateSectionTitle}>
              {setupType === 'due_date' ? 'Select Due Date' : 'Select Start Date'}
            </Text>
            
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.dateButtonText}>
                {format(selectedDate, 'MMMM dd, yyyy')}
              </Text>
              <ArrowRight size={20} color={Colors.light.darkGray} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                maximumDate={setupType === 'due_date' ? addWeeks(new Date(), 40) : new Date()}
                minimumDate={setupType === 'due_date' ? new Date() : addWeeks(new Date(), -40)}
              />
            )}

            <View style={styles.calculatedInfo}>
              <Text style={styles.calculatedTitle}>Calculated Information:</Text>
              {setupType === 'due_date' ? (
                <>
                  <Text style={styles.calculatedText}>
                    Pregnancy Start: {format(addWeeks(selectedDate, -40), 'MMMM dd, yyyy')}
                  </Text>
                  <Text style={styles.calculatedText}>
                    Current Week: {Math.max(1, Math.min(40, differenceInWeeks(new Date(), addWeeks(selectedDate, -40)) + 1))}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.calculatedText}>
                    Due Date: {format(addWeeks(selectedDate, 40), 'MMMM dd, yyyy')}
                  </Text>
                  <Text style={styles.calculatedText}>
                    Current Week: {Math.max(1, Math.min(40, differenceInWeeks(new Date(), selectedDate) + 1))}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !setupType && styles.continueButtonDisabled
          ]}
          onPress={handleSetupComplete}
          disabled={!setupType}
        >
          <Text style={[
            styles.continueButtonText,
            !setupType && styles.continueButtonTextDisabled
          ]}>
            Enable Pregnancy Mode
          </Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  setupOptions: {
    padding: 16,
    gap: 12,
  },
  setupOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  setupOptionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}08`,
  },
  setupOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  setupOptionContent: {
    flex: 1,
  },
  setupOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  setupOptionDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
  },
  setupOptionRadio: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  dateSection: {
    padding: 16,
    marginTop: 8,
  },
  dateSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.lightGray,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  calculatedInfo: {
    backgroundColor: Colors.light.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  calculatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  calculatedText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  continueButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.light.lightGray,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.background,
  },
  continueButtonTextDisabled: {
    color: Colors.light.darkGray,
  },
});