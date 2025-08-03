import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Droplets, Plus, BookOpen, Heart, Calendar } from 'lucide-react-native';

import Colors from '@/constants/colors';

type QuickActionsProps = {
  onAddPeriod: () => void;
  onAddSymptom: () => void;
  onViewInsights: () => void;
  onViewEducation: () => void;
};

export default function QuickActions({ 
  onAddPeriod, 
  onAddSymptom, 
  onViewInsights, 
  onViewEducation 
}: QuickActionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.light.periodLight }]}
          onPress={onAddPeriod}
          testID="add-period-button"
        >
          <Droplets size={24} color={Colors.light.periodHeavy} />
          <Text style={styles.actionText}>Log Period</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.light.lightGray }]}
          onPress={onAddSymptom}
          testID="add-symptom-button"
        >
          <Plus size={24} color={Colors.light.primary} />
          <Text style={styles.actionText}>Add Symptom</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.light.fertile }]}
          onPress={onViewInsights}
          testID="view-insights-button"
        >
          <Heart size={24} color={Colors.light.accent} />
          <Text style={styles.actionText}>Fertility</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.light.lightGray }]}
          onPress={onViewEducation}
          testID="view-education-button"
        >
          <BookOpen size={24} color={Colors.light.primary} />
          <Text style={styles.actionText}>Education</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
});