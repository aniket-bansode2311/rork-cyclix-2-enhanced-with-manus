import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { getArticleById } from '@/constants/education';
import Colors from '@/constants/colors';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = getArticleById(id || '');
  
  if (!article) {
    return (
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Article Not Found',
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: article.title,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      />
      
      <ScrollView>
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.category}>{article.category.toUpperCase()}</Text>
          
          <Text style={styles.articleContent}>
            {article.content}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: Colors.light.text,
  },
  category: {
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 16,
    fontWeight: '500',
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.darkGray,
  },
});