import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TrendingUp, BookOpen } from 'lucide-react-native';

import CycleInsights from '@/components/CycleInsights';
import EducationCard from '@/components/EducationCard';
import { educationArticles } from '@/constants/education';
import { CycleContext } from '@/hooks/use-cycle-store';
import Colors from '@/constants/colors';

export default function InsightsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'insights' | 'education'>('insights');
  
  const handleArticlePress = (articleId: string) => {
    router.push(`/article/${articleId}`);
  };
  
  return (
    <CycleContext>
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Insights & Education',
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerShadowVisible: false,
          }}
        />
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'insights' && styles.activeTab
            ]}
            onPress={() => setActiveTab('insights')}
            testID="insights-tab"
          >
            <TrendingUp size={20} color={activeTab === 'insights' ? Colors.light.primary : Colors.light.darkGray} />
            <Text style={[
              styles.tabText,
              activeTab === 'insights' && styles.activeTabText
            ]}>
              Insights
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'education' && styles.activeTab
            ]}
            onPress={() => setActiveTab('education')}
            testID="education-tab"
          >
            <BookOpen size={20} color={activeTab === 'education' ? Colors.light.primary : Colors.light.darkGray} />
            <Text style={[
              styles.tabText,
              activeTab === 'education' && styles.activeTabText
            ]}>
              Education
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView>
          {activeTab === 'insights' ? (
            <CycleInsights />
          ) : (
            <View style={styles.educationSection}>
              <Text style={styles.sectionTitle}>Health Articles</Text>
              
              {educationArticles.map(article => (
                <EducationCard
                  key={article.id}
                  title={article.title}
                  description={article.description}
                  imageUrl={article.imageUrl}
                  onPress={() => handleArticlePress(article.id)}
                />
              ))}
            </View>
          )}
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
  tabContainer: {
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
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.darkGray,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  educationSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.light.text,
  },
});