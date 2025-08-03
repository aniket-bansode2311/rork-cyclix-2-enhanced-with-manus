import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { 
  Brain, 
  Heart, 
  Utensils, 
  Moon, 
  Activity, 
  AlertTriangle, 
  Info, 
  X, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { PersonalizedRecommendation, HealthAlert } from '@/types/cycle';

export default function PersonalizedGuidance() {
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'alerts'>('recommendations');

  const recommendationsQuery = trpc.guidance.recommendations.get.useQuery({
    dismissed: false,
  });
  const alertsQuery = trpc.guidance.alerts.get.useQuery({
    dismissed: false,
  });

  const updateRecommendationMutation = trpc.guidance.recommendations.update.useMutation({
    onSuccess: () => {
      recommendationsQuery.refetch();
    },
  });

  const updateAlertMutation = trpc.guidance.alerts.update.useMutation({
    onSuccess: () => {
      alertsQuery.refetch();
    },
  });

  const generateRecommendationsMutation = trpc.guidance.recommendations.generatePersonalizedRecommendations.useMutation({
    onSuccess: () => {
      recommendationsQuery.refetch();
    },
  });

  const generateAlertsMutation = trpc.guidance.alerts.generatePredictiveAlerts.useMutation({
    onSuccess: () => {
      alertsQuery.refetch();
    },
  });

  const recommendations = recommendationsQuery.data || [];
  const alerts = alertsQuery.data || [];

  const handleDismissRecommendation = (id: string) => {
    updateRecommendationMutation.mutate({
      id,
      dismissed: true,
    });
  };

  const handleDismissAlert = (id: string) => {
    updateAlertMutation.mutate({
      id,
      dismissed: true,
    });
  };

  const handleGenerateRecommendations = () => {
    Alert.alert(
      'Generate Personalized Recommendations',
      'This will analyze your recent data to create personalized health recommendations.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => generateRecommendationsMutation.mutate() }
      ]
    );
  };

  const handleGenerateAlerts = () => {
    Alert.alert(
      'Generate Health Alerts',
      'This will analyze your patterns to create predictive health alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => generateAlertsMutation.mutate() }
      ]
    );
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return <Utensils size={20} color={Colors.light.primary} />;
      case 'exercise': return <Activity size={20} color={Colors.light.secondary} />;
      case 'stress': return <Brain size={20} color={Colors.light.accent} />;
      case 'sleep': return <Moon size={20} color={Colors.light.primary} />;
      case 'symptom_management': return <Heart size={20} color={Colors.light.secondary} />;
      default: return <Info size={20} color={Colors.light.darkGray} />;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={20} color="#FF4444" />;
      case 'warning': return <AlertTriangle size={20} color="#FF8800" />;
      case 'info': return <Info size={20} color={Colors.light.primary} />;
      default: return <Info size={20} color={Colors.light.darkGray} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.light.secondary;
      case 'medium': return '#FF8800';
      case 'low': return Colors.light.accent;
      default: return Colors.light.darkGray;
    }
  };

  const renderRecommendation = (recommendation: PersonalizedRecommendation) => {
    const actionItems = Array.isArray(recommendation.action_items) 
      ? recommendation.action_items 
      : JSON.parse(recommendation.action_items as string || '[]');
    
    const basedOn = Array.isArray(recommendation.based_on)
      ? recommendation.based_on
      : JSON.parse(recommendation.based_on as string || '[]');

    return (
      <View key={recommendation.id} style={styles.recommendationCard}>
        <View style={styles.recommendationHeader}>
          <View style={styles.recommendationIconContainer}>
            {getRecommendationIcon(recommendation.type)}
          </View>
          <View style={styles.recommendationInfo}>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <View style={styles.priorityBadge}>
              <View 
                style={[
                  styles.priorityDot, 
                  { backgroundColor: getPriorityColor(recommendation.priority) }
                ]} 
              />
              <Text style={styles.priorityText}>
                {recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)} Priority
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismissRecommendation(recommendation.id)}
          >
            <X size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
        </View>

        <Text style={styles.recommendationDescription}>
          {recommendation.description}
        </Text>

        <View style={styles.actionItemsSection}>
          <Text style={styles.actionItemsTitle}>Action Items:</Text>
          {actionItems.map((item: string, index: number) => (
            <View key={index} style={styles.actionItem}>
              <CheckCircle size={16} color={Colors.light.primary} />
              <Text style={styles.actionItemText}>{item}</Text>
            </View>
          ))}
        </View>

        {basedOn.length > 0 && (
          <View style={styles.basedOnSection}>
            <Text style={styles.basedOnTitle}>Based on:</Text>
            <Text style={styles.basedOnText}>{basedOn.join(', ')}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderAlert = (alert: HealthAlert) => {
    const basedOn = Array.isArray(alert.based_on)
      ? alert.based_on
      : JSON.parse(alert.based_on as string || '[]');

    return (
      <View key={alert.id} style={[styles.alertCard, styles[`alert${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}`]]}>
        <View style={styles.alertHeader}>
          <View style={styles.alertIconContainer}>
            {getAlertIcon(alert.severity)}
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertType}>
              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismissAlert(alert.id)}
          >
            <X size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
        </View>

        <Text style={styles.alertMessage}>{alert.message}</Text>

        {alert.predicted_date && (
          <View style={styles.predictedDateSection}>
            <Clock size={16} color={Colors.light.darkGray} />
            <Text style={styles.predictedDateText}>
              Predicted for: {new Date(alert.predicted_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {basedOn.length > 0 && (
          <View style={styles.basedOnSection}>
            <Text style={styles.basedOnTitle}>Based on:</Text>
            <Text style={styles.basedOnText}>{basedOn.join(', ')}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    if (selectedTab === 'recommendations') {
      return (
        <View style={styles.tabContent}>
          <View style={styles.tabHeader}>
            <Text style={styles.tabTitle}>Personalized Recommendations</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateRecommendations}
              disabled={generateRecommendationsMutation.isPending}
            >
              <TrendingUp size={16} color={Colors.light.background} />
              <Text style={styles.generateButtonText}>
                {generateRecommendationsMutation.isPending ? 'Generating...' : 'Generate'}
              </Text>
            </TouchableOpacity>
          </View>

          {recommendations.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart size={48} color={Colors.light.darkGray} />
              <Text style={styles.emptyStateTitle}>No Recommendations Yet</Text>
              <Text style={styles.emptyStateText}>
                Generate personalized recommendations based on your health data and patterns.
              </Text>
            </View>
          ) : (
            <View style={styles.contentList}>
              {recommendations.map(renderRecommendation)}
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.tabHeader}>
          <Text style={styles.tabTitle}>Health Alerts</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateAlerts}
            disabled={generateAlertsMutation.isPending}
          >
            <AlertTriangle size={16} color={Colors.light.background} />
            <Text style={styles.generateButtonText}>
              {generateAlertsMutation.isPending ? 'Generating...' : 'Generate'}
            </Text>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertTriangle size={48} color={Colors.light.darkGray} />
            <Text style={styles.emptyStateTitle}>No Active Alerts</Text>
            <Text style={styles.emptyStateText}>
              Generate predictive health alerts based on your patterns and data.
            </Text>
          </View>
        ) : (
          <View style={styles.contentList}>
            {alerts.map(renderAlert)}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'recommendations' && styles.activeTab]}
          onPress={() => setSelectedTab('recommendations')}
        >
          <Heart size={20} color={selectedTab === 'recommendations' ? Colors.light.primary : Colors.light.darkGray} />
          <Text style={[
            styles.tabText,
            selectedTab === 'recommendations' && styles.activeTabText
          ]}>
            Recommendations
          </Text>
          {recommendations.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recommendations.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alerts' && styles.activeTab]}
          onPress={() => setSelectedTab('alerts')}
        >
          <AlertTriangle size={20} color={selectedTab === 'alerts' ? Colors.light.primary : Colors.light.darkGray} />
          <Text style={[
            styles.tabText,
            selectedTab === 'alerts' && styles.activeTabText
          ]}>
            Alerts
          </Text>
          {alerts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{alerts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.darkGray,
    marginLeft: 8,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  badge: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  contentList: {
    gap: 16,
  },
  recommendationCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  dismissButton: {
    padding: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionItemsSection: {
    marginBottom: 12,
  },
  actionItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  actionItemText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  basedOnSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.lightGray,
  },
  basedOnTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  basedOnText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    fontStyle: 'italic',
  },
  alertCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertInfo: {
    borderLeftColor: Colors.light.primary,
  },
  alertWarning: {
    borderLeftColor: '#FF8800',
  },
  alertCritical: {
    borderLeftColor: '#FF4444',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  alertType: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  predictedDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictedDateText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});