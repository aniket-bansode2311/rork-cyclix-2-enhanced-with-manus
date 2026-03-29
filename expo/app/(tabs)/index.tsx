import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { format } from 'date-fns';

import HomeHeader from '@/components/HomeHeader';
import CycleSummary from '@/components/CycleSummary';
import QuickActions from '@/components/QuickActions';
import EducationCard from '@/components/EducationCard';
import { educationArticles } from '@/constants/education';
import { CycleContext } from '@/hooks/use-cycle-store';
import Colors from '@/constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [showingArticles, setShowingArticles] = useState(2);
  
  const handleAddPeriod = () => {
    router.push('/log-period');
  };
  
  const handleAddSymptom = () => {
    router.push('/log-symptom');
  };
  
  const handleViewInsights = () => {
    router.push('/(tabs)/insights');
  };
  
  const handleViewEducation = () => {
    router.push('/(tabs)/insights');
  };
  
  const handleViewCalendar = () => {
    router.push('/(tabs)/calendar');
  };
  
  const handleArticlePress = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };
  
  return (
    <CycleContext>
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            headerShown: false,
          }}
        />
        
        <ScrollView>
          <HomeHeader />
          <CycleSummary onViewCalendar={handleViewCalendar} />
          
          <QuickActions 
            onAddPeriod={handleAddPeriod}
            onAddSymptom={handleAddSymptom}
            onViewInsights={handleViewInsights}
            onViewEducation={handleViewEducation}
          />
          
          <View style={styles.educationSection}>
            <Text style={styles.sectionTitle}>Health Education</Text>
            
            {educationArticles.slice(0, showingArticles).map(article => (
              <EducationCard
                key={article.id}
                title={article.title}
                description={article.description}
                imageUrl={article.imageUrl}
                onPress={() => handleArticlePress(article.id)}
              />
            ))}
            
            {showingArticles < educationArticles.length && (
              <Text 
                style={styles.viewMoreText}
                onPress={() => setShowingArticles(educationArticles.length)}
              >
                View more articles
              </Text>
            )}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last updated: {format(new Date(), 'MMMM d, yyyy')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </CycleContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  educationSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  viewMoreText: {
    textAlign: 'center',
    color: Colors.light.primary,
    fontWeight: '500',
    padding: 12,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
});