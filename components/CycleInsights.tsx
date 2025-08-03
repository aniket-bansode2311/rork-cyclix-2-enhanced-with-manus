import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, Droplets, Heart, Activity, BarChart3, TrendingUp, Brain } from 'lucide-react-native';
import { format, parseISO, addDays } from 'date-fns';

import Colors from '@/constants/colors';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { trpc } from '@/lib/trpc';
import CycleChart from './CycleChart';
import SymptomInsights from './SymptomInsights';

type ViewMode = 'overview' | 'charts' | 'symptoms' | 'predictions';

export default function CycleInsights() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const { 
    userProfile, 
    getPredictedPeriods, 
    getFertileWindow 
  } = useCycleStore();

  // Fetch analytics data
  const analyticsQuery = trpc.cycles.cycles.getAnalytics.useQuery();
  const generatePredictionsMutation = trpc.cycles.cycles.generatePredictions.useMutation();

  const nextPeriods = getPredictedPeriods(3);
  const fertileWindow = getFertileWindow();

  const renderNextPeriod = () => {
    if (nextPeriods.length === 0) {
      return (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Calendar size={20} color={Colors.light.primary} />
            <Text style={styles.insightTitle}>Next Period</Text>
          </View>
          <Text style={styles.noDataText}>
            Log your period to see predictions
          </Text>
        </View>
      );
    }

    const nextPeriod = nextPeriods[0];
    const startDate = parseISO(nextPeriod.startDate);
    const endDate = parseISO(nextPeriod.endDate);
    
    return (
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Calendar size={20} color={Colors.light.primary} />
          <Text style={styles.insightTitle}>Next Period</Text>
        </View>
        <Text style={styles.dateText}>
          {format(startDate, 'MMMM d')} - {format(endDate, 'MMMM d, yyyy')}
        </Text>
        <View style={styles.daysContainer}>
          <Text style={styles.daysText}>
            {userProfile.averagePeriodLength} days
          </Text>
        </View>
      </View>
    );
  };

  const renderFertileWindow = () => {
    if (!fertileWindow || userProfile.isPregnancyMode) {
      return null;
    }

    const startDate = parseISO(fertileWindow.startDate);
    const endDate = parseISO(fertileWindow.endDate);
    const ovulationDate = parseISO(fertileWindow.ovulationDate);
    
    return (
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Heart size={20} color={Colors.light.accent} />
          <Text style={styles.insightTitle}>Fertility Window</Text>
        </View>
        <Text style={styles.dateText}>
          {format(startDate, 'MMMM d')} - {format(endDate, 'MMMM d, yyyy')}
        </Text>
        <Text style={styles.ovulationText}>
          Ovulation: {format(ovulationDate, 'MMMM d')}
        </Text>
      </View>
    );
  };

  const renderCycleStats = () => {
    return (
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Activity size={20} color={Colors.light.primary} />
          <Text style={styles.insightTitle}>Cycle Stats</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.averageCycleLength}</Text>
            <Text style={styles.statLabel}>Cycle Length</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.averagePeriodLength}</Text>
            <Text style={styles.statLabel}>Period Length</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPMSPrediction = () => {
    if (nextPeriods.length === 0) {
      return null;
    }

    const nextPeriod = nextPeriods[0];
    const periodStart = parseISO(nextPeriod.startDate);
    const pmsStart = addDays(periodStart, -7);
    const pmsEnd = addDays(periodStart, -1);
    
    return (
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Droplets size={20} color={Colors.light.secondary} />
          <Text style={styles.insightTitle}>PMS Prediction</Text>
        </View>
        <Text style={styles.dateText}>
          {format(pmsStart, 'MMMM d')} - {format(pmsEnd, 'MMMM d, yyyy')}
        </Text>
        <Text style={styles.pmsText}>
          You may experience PMS symptoms during this time
        </Text>
      </View>
    );
  };

  const renderViewModeSelector = () => {
    const modes: { key: ViewMode; label: string; icon: any }[] = [
      { key: 'overview', label: 'Overview', icon: Activity },
      { key: 'charts', label: 'Charts', icon: BarChart3 },
      { key: 'symptoms', label: 'Symptoms', icon: Heart },
      { key: 'predictions', label: 'AI Insights', icon: Brain },
    ];

    return (
      <View style={styles.viewModeSelector}>
        {modes.map(mode => {
          const IconComponent = mode.icon;
          const isActive = viewMode === mode.key;
          
          return (
            <TouchableOpacity
              key={mode.key}
              style={[styles.viewModeButton, isActive && styles.viewModeButtonActive]}
              onPress={() => setViewMode(mode.key)}
            >
              <IconComponent 
                size={16} 
                color={isActive ? Colors.light.background : Colors.light.darkGray} 
              />
              <Text style={[
                styles.viewModeButtonText,
                isActive && styles.viewModeButtonTextActive
              ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderPredictionsView = () => {
    const handleGeneratePredictions = async () => {
      try {
        await generatePredictionsMutation.mutateAsync();
        console.log('Predictions generated successfully');
      } catch (error) {
        console.error('Failed to generate predictions:', error);
      }
    };

    return (
      <View style={styles.predictionsContainer}>
        <View style={styles.predictionsHeader}>
          <Brain size={24} color={Colors.light.primary} />
          <Text style={styles.predictionsTitle}>AI-Powered Insights</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGeneratePredictions}
          disabled={generatePredictionsMutation.isPending}
        >
          <TrendingUp size={16} color={Colors.light.background} />
          <Text style={styles.generateButtonText}>
            {generatePredictionsMutation.isPending ? 'Generating...' : 'Generate New Predictions'}
          </Text>
        </TouchableOpacity>

        {analyticsQuery.data && (
          <View style={styles.dataQualityCard}>
            <Text style={styles.dataQualityTitle}>Data Quality Score</Text>
            <View style={styles.dataQualityBar}>
              <View 
                style={[
                  styles.dataQualityFill,
                  { width: `${(analyticsQuery.data.dataQualityScore || 0) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.dataQualityText}>
              {Math.round((analyticsQuery.data.dataQualityScore || 0) * 100)}% - 
              {analyticsQuery.data.dataQualityScore > 0.8 ? 'Excellent' :
               analyticsQuery.data.dataQualityScore > 0.6 ? 'Good' :
               analyticsQuery.data.dataQualityScore > 0.4 ? 'Fair' : 'Needs Improvement'}
            </Text>
          </View>
        )}

        {renderNextPeriod()}
        {renderFertileWindow()}
        {renderPMSPrediction()}
      </View>
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'charts':
        if (!analyticsQuery.data) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          );
        }
        return (
          <CycleChart
            cycleLengths={analyticsQuery.data.cycleLengthVariation}
            periodLengths={analyticsQuery.data.periodLengthVariation}
            title="Cycle Analytics"
          />
        );
      
      case 'symptoms':
        if (!analyticsQuery.data) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading symptom data...</Text>
            </View>
          );
        }
        return (
          <SymptomInsights
            symptomPatterns={analyticsQuery.data.symptomPatterns}
            title="Symptom Patterns"
          />
        );
      
      case 'predictions':
        return renderPredictionsView();
      
      default:
        return (
          <ScrollView style={styles.overviewContainer}>
            {renderNextPeriod()}
            {renderFertileWindow()}
            {renderCycleStats()}
            {renderPMSPrediction()}
            
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                Predictions are based on your logged data and may vary. This app should not be used as a contraceptive method.
              </Text>
            </View>
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Cycle Insights</Text>
      {renderViewModeSelector()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  overviewContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.light.text,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  viewModeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.darkGray,
  },
  viewModeButtonTextActive: {
    color: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.darkGray,
  },
  predictionsContainer: {
    flex: 1,
    padding: 16,
  },
  predictionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.light.text,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  generateButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  dataQualityCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataQualityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  dataQualityBar: {
    height: 8,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dataQualityFill: {
    height: '100%',
    backgroundColor: Colors.light.accent,
    borderRadius: 4,
  },
  dataQualityText: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  insightCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: Colors.light.text,
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  daysContainer: {
    backgroundColor: Colors.light.periodLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  daysText: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  ovulationText: {
    fontSize: 14,
    color: Colors.light.accent,
    fontWeight: '500',
  },
  pmsText: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.light.gray,
    height: '100%',
  },
  noDataText: {
    fontSize: 16,
    color: Colors.light.darkGray,
    fontStyle: 'italic',
  },
  disclaimer: {
    marginTop: 8,
    marginBottom: 24,
    padding: 12,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textAlign: 'center',
  },
});