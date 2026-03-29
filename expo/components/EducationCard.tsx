import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import Colors from '@/constants/colors';

type EducationCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  onPress: () => void;
};

export default function EducationCard({ 
  title, 
  description, 
  imageUrl, 
  onPress 
}: EducationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} testID={`education-card-${title}`}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>Read more</Text>
          <ArrowRight size={16} color={Colors.light.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  description: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 12,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
    marginRight: 4,
  },
});