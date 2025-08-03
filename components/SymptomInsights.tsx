import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Activity, Calendar, TrendingUp } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { SymptomFrequency } from '@/types/cycle';
import { symptoms } from '@/constants/symptoms';

interface SymptomInsightsProps {
  symptomPatterns: SymptomFrequency[];
  title: string;
}

export default function SymptomInsights({ symptomPatterns, title }: SymptomInsightsProps) {
  const getSymptomName = (symptomId: string) => {
    const symptom = symptoms.find((s: { id: string; name: string; icon: string; category: string }) => s.id === symptomId);
    return symptom?.name || symptomId;
  };

  const getSymptomIcon = (symptomId: string) => {
    const symptom = symptoms.find((s: { id: string; name: string; icon: string; category: string }) => s.id === symptomId);
    return symptom?.icon || '📊';
  };

  const getCyclePhaseColor = (phase?: string) => {
    switch (phase) {
      case 'menstrual':
        return Colors.light.secondary;
      case 'follicular':
        return Colors.light.accent;
      case 'ovulation':
        return Colors.light.primary;
      case 'luteal':
        return Colors.light.darkGray;
      default:
        return Colors.light.gray;
    }
  };

  const getCyclePhaseName = (phase?: string) => {
    switch (phase) {
      case 'menstrual':
        return 'Menstrual';
      case 'follicular':
        return 'Follicular';
      case 'ovulation':
        return 'Ovulation';
      case 'luteal':
        return 'Luteal';
      default:
        return 'Unknown';
    }
  };

  const renderSymptomCard = (pattern: SymptomFrequency, index: number) => {
    const intensityPercentage = pattern.averageIntensity ? (pattern.averageIntensity / 5) * 100 : 0;
    
    return (
      <View key={index} style={styles.symptomCard}>
        <View style={styles.symptomHeader}>
          <View style={styles.symptomTitleContainer}>
            <Text style={styles.symptomIcon}>{getSymptomIcon(pattern.symptomId)}</Text>
            <Text style={styles.symptomName}>{getSymptomName(pattern.symptomId)}</Text>
          </View>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>{pattern.frequency}x</Text>
          </View>
        </View>

        <View style={styles.symptomDetails}>
          {pattern.averageIntensity && (
            <View style={styles.intensityContainer}>
              <Text style={styles.detailLabel}>Average Intensity</Text>
              <View style={styles.intensityBar}>
                <View
                  style={[
                    styles.intensityFill,
                    {
                      width: `${intensityPercentage}%`,
                      backgroundColor: getIntensityColor(pattern.averageIntensity),
                    },
                  ]}
                />
              </View>
              <Text style={styles.intensityValue}>
                {pattern.averageIntensity.toFixed(1)}/5
              </Text>
            </View>
          )}

          {pattern.cyclePhase && (
            <View style={styles.phaseContainer}>
              <Text style={styles.detailLabel}>Most Common Phase</Text>
              <View
                style={[
                  styles.phaseBadge,
                  { backgroundColor: getCyclePhaseColor(pattern.cyclePhase) },
                ]}
              >
                <Text style={styles.phaseText}>{getCyclePhaseName(pattern.cyclePhase)}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTopSymptoms = () => {
    const sortedPatterns = [...symptomPatterns]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    if (sortedPatterns.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Activity size={48} color={Colors.light.darkGray} />
          <Text style={styles.noDataTitle}>No Symptom Data</Text>
          <Text style={styles.noDataText}>
            Start logging symptoms to see patterns and insights
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Most Frequent Symptoms</Text>
        </View>
        {sortedPatterns.map((pattern, index) => renderSymptomCard(pattern, index))}
      </View>
    );
  };

  const renderPhaseAnalysis = () => {
    const phaseGroups = symptomPatterns.reduce((acc, pattern) => {
      const phase = pattern.cyclePhase || 'unknown';
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(pattern);
      return acc;
    }, {} as { [key: string]: SymptomFrequency[] });

    const phases = Object.keys(phaseGroups).filter(phase => phase !== 'unknown');

    if (phases.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Symptoms by Cycle Phase</Text>
        </View>
        {phases.map(phase => (
          <View key={phase} style={styles.phaseAnalysisCard}>
            <View style={styles.phaseAnalysisHeader}>
              <View
                style={[
                  styles.phaseIndicator,
                  { backgroundColor: getCyclePhaseColor(phase) },
                ]}
              />
              <Text style={styles.phaseAnalysisTitle}>{getCyclePhaseName(phase)}</Text>
              <Text style={styles.phaseSymptomCount}>
                {phaseGroups[phase].length} symptoms
              </Text>
            </View>
            <View style={styles.phaseSymptomsList}>
              {phaseGroups[phase]
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 3)
                .map((pattern, index) => (
                  <View key={index} style={styles.phaseSymptomItem}>
                    <Text style={styles.phaseSymptomIcon}>
                      {getSymptomIcon(pattern.symptomId)}
                    </Text>
                    <Text style={styles.phaseSymptomName}>
                      {getSymptomName(pattern.symptomId)}
                    </Text>
                    <Text style={styles.phaseSymptomFreq}>{pattern.frequency}x</Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {renderTopSymptoms()}
      {renderPhaseAnalysis()}
    </ScrollView>
  );
}

function getIntensityColor(intensity: number): string {
  if (intensity <= 1) return Colors.light.accent;
  if (intensity <= 2) return '#FFA500'; // Orange
  if (intensity <= 3) return '#FF6B35'; // Orange-red
  if (intensity <= 4) return Colors.light.secondary;
  return '#CC0000'; // Dark red
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: Colors.light.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.light.text,
  },
  symptomCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  symptomTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symptomIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  frequencyBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  frequencyText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '600',
  },
  symptomDetails: {
    gap: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.light.darkGray,
    width: 80,
  },
  intensityBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
  },
  intensityValue: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
    width: 30,
    textAlign: 'right',
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  phaseText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '500',
  },
  phaseAnalysisCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  phaseAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  phaseAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  phaseSymptomCount: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  phaseSymptomsList: {
    gap: 8,
  },
  phaseSymptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  phaseSymptomIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  phaseSymptomName: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  phaseSymptomFreq: {
    fontSize: 12,
    color: Colors.light.darkGray,
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});