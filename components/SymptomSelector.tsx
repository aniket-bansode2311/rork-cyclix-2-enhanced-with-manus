import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { getSymptomsByCategory, symptomCategories, getSymptomById } from '@/constants/symptoms';
import Colors from '@/constants/colors';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { Heart, Activity, Smile, Droplets, Plus, User, Battery, Cookie, Pill, X, Star } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type SymptomSelectorProps = {
  date: string;
  onClose: () => void;
};

export default function SymptomSelector({ date, onClose }: SymptomSelectorProps) {
  const { addSymptomLog, removeSymptomLog, getLogsForDate } = useCycleStore();
  const { symptomLogs } = getLogsForDate(date);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [notes, setNotes] = useState('');
  const [showIntensityModal, setShowIntensityModal] = useState(false);
  
  const selectedSymptomIds = symptomLogs.map(log => log.symptomId);
  
  const handleSymptomPress = (symptomId: string) => {
    if (selectedSymptomIds.includes(symptomId)) {
      // Remove symptom
      const existingLog = symptomLogs.find(log => log.symptomId === symptomId);
      if (existingLog) {
        removeSymptomLog(existingLog.id);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
      return;
    }
    
    // Check if symptom might benefit from intensity rating
    const symptom = getSymptomById(symptomId);
    const needsIntensity = symptom && ['pain', 'mood', 'energy', 'appetite'].includes(symptom.category);
    
    if (needsIntensity) {
      setSelectedSymptom(symptomId);
      setIntensity(3);
      setNotes('');
      setShowIntensityModal(true);
    } else {
      // Add symptom directly
      addSymptomLog({
        date,
        symptomId,
      });
      
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };
  
  const handleSaveWithIntensity = () => {
    if (!selectedSymptom) return;
    
    addSymptomLog({
      date,
      symptomId: selectedSymptom,
      intensity,
      notes: notes.trim() || undefined,
    });
    
    setShowIntensityModal(false);
    setSelectedSymptom(null);
    setNotes('');
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const renderCategoryIcon = (iconName: string) => {
    const iconProps = { size: 20, color: Colors.light.primary };
    
    switch (iconName) {
      case 'smile':
        return <Smile {...iconProps} />;
      case 'activity':
        return <Activity {...iconProps} />;
      case 'user':
        return <User {...iconProps} />;
      case 'droplets':
        return <Droplets {...iconProps} />;
      case 'battery':
        return <Battery {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'cookie':
        return <Cookie {...iconProps} />;
      case 'pill':
        return <Pill {...iconProps} />;
      default:
        return <Heart {...iconProps} />;
    }
  };
  
  const renderIntensityStars = (currentIntensity: number, onPress: (intensity: 1 | 2 | 3 | 4 | 5) => void) => {
    return (
      <View style={styles.intensityContainer}>
        <Text style={styles.intensityLabel}>Intensity:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => onPress(star as 1 | 2 | 3 | 4 | 5)}
              style={styles.starButton}
            >
              <Star
                size={24}
                color={star <= currentIntensity ? Colors.light.primary : Colors.light.darkGray}
                fill={star <= currentIntensity ? Colors.light.primary : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderCategory = (categoryData: { id: string; name: string; icon: string }) => {
    const symptoms = getSymptomsByCategory(categoryData.id);
    
    if (symptoms.length === 0) return null;
    
    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          {renderCategoryIcon(categoryData.icon)}
          <Text style={styles.categoryTitle}>{categoryData.name}</Text>
        </View>
        
        <View style={styles.symptomsGrid}>
          {symptoms.map(symptom => {
            const isSelected = selectedSymptomIds.includes(symptom.id);
            const existingLog = symptomLogs.find(log => log.symptomId === symptom.id);
            
            return (
              <TouchableOpacity
                key={symptom.id}
                style={[
                  styles.symptomButton,
                  isSelected && styles.selectedSymptom
                ]}
                onPress={() => handleSymptomPress(symptom.id)}
                testID={`symptom-${symptom.id}`}
              >
                <Text 
                  style={[
                    styles.symptomText,
                    isSelected && styles.selectedSymptomText
                  ]}
                >
                  {symptom.name}
                </Text>
                {isSelected && existingLog?.intensity && (
                  <View style={styles.intensityIndicator}>
                    <Text style={styles.intensityText}>{existingLog.intensity}/5</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Symptoms & Lifestyle</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>Done</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {symptomCategories.map(category => renderCategory(category))}
        
        <TouchableOpacity style={styles.customButton}>
          <Plus size={16} color={Colors.light.primary} />
          <Text style={styles.customButtonText}>Add Custom Symptom</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Intensity Modal */}
      <Modal
        visible={showIntensityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIntensityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedSymptom ? getSymptomById(selectedSymptom)?.name : 'Symptom'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowIntensityModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={Colors.light.darkGray} />
              </TouchableOpacity>
            </View>
            
            {renderIntensityStars(intensity, setIntensity)}
            
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any additional notes..."
                placeholderTextColor={Colors.light.darkGray}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveWithIntensity}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.light.text,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symptomButton: {
    backgroundColor: Colors.light.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    margin: 4,
  },
  selectedSymptom: {
    backgroundColor: Colors.light.primary,
  },
  symptomText: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  selectedSymptomText: {
    color: '#FFF',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  customButtonText: {
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  intensityIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  intensityText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  intensityContainer: {
    marginBottom: 20,
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  notesInput: {
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});