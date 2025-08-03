import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Baby, Calendar, CheckCircle, Circle, Clock, Heart, Star } from 'lucide-react-native';
import { format, differenceInWeeks, parseISO } from 'date-fns';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';
import { PregnancyMilestone } from '@/types/cycle';

interface PregnancyTrackerProps {
  pregnancyStartDate: string;
  pregnancyDueDate: string;
  currentWeek: number;
}

export default function PregnancyTracker({ 
  pregnancyStartDate, 
  pregnancyDueDate, 
  currentWeek 
}: PregnancyTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const milestonesQuery = trpc.cycles.pregnancyMilestones.get.useQuery();
  const updateMilestoneMutation = trpc.cycles.pregnancyMilestones.update.useMutation({
    onSuccess: () => {
      milestonesQuery.refetch();
    },
  });
  const generateMilestonesMutation = trpc.cycles.pregnancyMilestones.generateDefaultMilestones.useMutation({
    onSuccess: () => {
      milestonesQuery.refetch();
    },
  });

  const milestones = milestonesQuery.data || [];
  const filteredMilestones = selectedCategory === 'all' 
    ? milestones 
    : milestones.filter(m => m.category === selectedCategory);

  const handleToggleMilestone = (milestone: PregnancyMilestone) => {
    updateMilestoneMutation.mutate({
      id: milestone.id,
      completed: !milestone.completed,
    });
  };

  const handleGenerateDefaultMilestones = () => {
    Alert.alert(
      'Generate Default Milestones',
      'This will add standard pregnancy milestones to your tracker. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => generateMilestonesMutation.mutate() }
      ]
    );
  };

  const getWeeklyUpdate = (week: number) => {
    const weeklyUpdates: Record<number, { baby: string; mother: string; tips: string[] }> = {
      8: {
        baby: "Your baby is about the size of a raspberry and major organs are forming.",
        mother: "You might experience morning sickness and breast tenderness.",
        tips: ["Take prenatal vitamins", "Stay hydrated", "Get plenty of rest"]
      },
      12: {
        baby: "Your baby is about the size of a lime with fully formed fingers and toes.",
        mother: "Morning sickness may start to improve as you enter the second trimester.",
        tips: ["Consider sharing your news", "Schedule genetic screening", "Maintain healthy diet"]
      },
      16: {
        baby: "Your baby can hear sounds and is about the size of an avocado.",
        mother: "You might start feeling the first movements and have more energy.",
        tips: ["Start thinking about baby names", "Consider prenatal classes", "Stay active"]
      },
      20: {
        baby: "Your baby is about the size of a banana and you can find out the gender.",
        mother: "Your belly is showing and you might feel stronger movements.",
        tips: ["Schedule anatomy scan", "Start shopping for baby items", "Take photos"]
      },
      24: {
        baby: "Your baby's hearing is developing and they're about the size of corn.",
        mother: "You might experience some back pain as your belly grows.",
        tips: ["Take glucose screening test", "Practice good posture", "Wear comfortable shoes"]
      },
      28: {
        baby: "Your baby's eyes can open and they're about the size of eggplant.",
        mother: "You're entering the third trimester and might feel more tired.",
        tips: ["Start birth classes", "Plan maternity leave", "Prepare nursery"]
      },
      32: {
        baby: "Your baby is gaining weight rapidly and is about the size of squash.",
        mother: "You might experience shortness of breath and frequent urination.",
        tips: ["Pack hospital bag", "Install car seat", "Practice breathing exercises"]
      },
      36: {
        baby: "Your baby is considered full-term soon and is about the size of papaya.",
        mother: "You might feel uncomfortable and experience Braxton Hicks contractions.",
        tips: ["Finalize birth plan", "Stock up on essentials", "Rest when possible"]
      }
    };

    return weeklyUpdates[week] || {
      baby: "Your baby continues to grow and develop.",
      mother: "Continue taking care of yourself and your growing baby.",
      tips: ["Stay healthy", "Follow doctor's advice", "Prepare for baby's arrival"]
    };
  };

  const weeklyUpdate = getWeeklyUpdate(currentWeek);
  const daysUntilDue = Math.max(0, Math.floor((parseISO(pregnancyDueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const categories = [
    { id: 'all', name: 'All', icon: 'calendar' },
    { id: 'appointment', name: 'Appointments', icon: 'calendar' },
    { id: 'test', name: 'Tests', icon: 'activity' },
    { id: 'development', name: 'Development', icon: 'baby' },
    { id: 'preparation', name: 'Preparation', icon: 'star' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment': return <Calendar size={16} color={Colors.light.primary} />;
      case 'test': return <Heart size={16} color={Colors.light.secondary} />;
      case 'development': return <Baby size={16} color={Colors.light.accent} />;
      case 'preparation': return <Star size={16} color={Colors.light.primary} />;
      default: return <Circle size={16} color={Colors.light.darkGray} />;
    }
  };

  const renderWeeklyUpdate = () => (
    <View style={styles.weeklyUpdateCard}>
      <View style={styles.weekHeader}>
        <Baby size={24} color={Colors.light.primary} />
        <Text style={styles.weekTitle}>Week {currentWeek}</Text>
        <Text style={styles.daysRemaining}>{daysUntilDue} days to go</Text>
      </View>
      
      <View style={styles.updateSection}>
        <Text style={styles.updateTitle}>Your Baby</Text>
        <Text style={styles.updateText}>{weeklyUpdate.baby}</Text>
      </View>
      
      <View style={styles.updateSection}>
        <Text style={styles.updateTitle}>Your Body</Text>
        <Text style={styles.updateText}>{weeklyUpdate.mother}</Text>
      </View>
      
      <View style={styles.updateSection}>
        <Text style={styles.updateTitle}>This Week's Tips</Text>
        {weeklyUpdate.tips.map((tip, index) => (
          <Text key={index} style={styles.tipText}>• {tip}</Text>
        ))}
      </View>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === category.id && styles.categoryButtonTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderMilestone = (milestone: PregnancyMilestone) => (
    <TouchableOpacity
      key={milestone.id}
      style={[styles.milestoneCard, milestone.completed && styles.milestoneCompleted]}
      onPress={() => handleToggleMilestone(milestone)}
    >
      <View style={styles.milestoneHeader}>
        <View style={styles.milestoneIconContainer}>
          {getCategoryIcon(milestone.category)}
        </View>
        <View style={styles.milestoneInfo}>
          <Text style={[styles.milestoneTitle, milestone.completed && styles.milestoneCompletedText]}>
            {milestone.title}
          </Text>
          <Text style={styles.milestoneWeek}>Week {milestone.week}</Text>
        </View>
        <View style={styles.milestoneCheckbox}>
          {milestone.completed ? (
            <CheckCircle size={24} color={Colors.light.primary} />
          ) : (
            <Circle size={24} color={Colors.light.darkGray} />
          )}
        </View>
      </View>
      
      <Text style={[styles.milestoneDescription, milestone.completed && styles.milestoneCompletedText]}>
        {milestone.description}
      </Text>
      
      {milestone.due_date && (
        <View style={styles.milestoneDueDate}>
          <Clock size={14} color={Colors.light.darkGray} />
          <Text style={styles.milestoneDueDateText}>
            Due: {format(parseISO(milestone.due_date), 'MMM dd, yyyy')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {renderWeeklyUpdate()}
      
      <View style={styles.milestonesSection}>
        <View style={styles.milestonesHeader}>
          <Text style={styles.sectionTitle}>Pregnancy Milestones</Text>
          {milestones.length === 0 && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateDefaultMilestones}
              disabled={generateMilestonesMutation.isPending}
            >
              <Text style={styles.generateButtonText}>
                {generateMilestonesMutation.isPending ? 'Generating...' : 'Add Milestones'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {milestones.length > 0 && renderCategoryFilter()}
        
        <View style={styles.milestonesList}>
          {filteredMilestones.map(renderMilestone)}
        </View>
        
        {filteredMilestones.length === 0 && milestones.length > 0 && (
          <View style={styles.noMilestonesContainer}>
            <Text style={styles.noMilestonesText}>
              No milestones in this category yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  weeklyUpdateCard: {
    backgroundColor: Colors.light.background,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  daysRemaining: {
    fontSize: 14,
    color: Colors.light.darkGray,
    fontWeight: '500',
  },
  updateSection: {
    marginBottom: 16,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  updateText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
    marginBottom: 4,
  },
  milestonesSection: {
    padding: 16,
  },
  milestonesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  generateButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGray,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.light.background,
  },
  milestonesList: {
    gap: 12,
  },
  milestoneCard: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneCompleted: {
    backgroundColor: Colors.light.lightGray,
    opacity: 0.8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  milestoneWeek: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  milestoneCheckbox: {
    marginLeft: 8,
  },
  milestoneDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  milestoneCompletedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  milestoneDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  milestoneDueDateText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    marginLeft: 4,
  },
  noMilestonesContainer: {
    padding: 32,
    alignItems: 'center',
  },
  noMilestonesText: {
    fontSize: 16,
    color: Colors.light.darkGray,
    textAlign: 'center',
  },
});