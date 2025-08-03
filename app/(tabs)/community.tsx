import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Users, Search, Plus, MessageCircle, Heart, Calendar } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  created_at: string;
}

export default function CommunityScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: groups, isLoading } = trpc.community.groups.getAll.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory as any,
  });

  const { data: userGroups } = trpc.community.groups.getUserGroups.useQuery();

  const categories = [
    { id: 'general', name: 'General', icon: '💬' },
    { id: 'pcos', name: 'PCOS', icon: '🩺' },
    { id: 'endometriosis', name: 'Endometriosis', icon: '🎗️' },
    { id: 'ttc', name: 'TTC', icon: '🤱' },
    { id: 'pregnancy', name: 'Pregnancy', icon: '🤰' },
    { id: 'menopause', name: 'Menopause', icon: '🌸' },
    { id: 'teens', name: 'Teens', icon: '👧' },
  ];

  const handleGroupPress = (groupId: string) => {
    router.push(`/community/group/${groupId}`);
  };

  const handleCreateGroup = () => {
    router.push('/community/create-group');
  };

  const renderGroupCard = (group: CommunityGroup) => {
    const category = categories.find(c => c.id === group.category);
    const isJoined = userGroups?.some(ug => ug.community_groups?.id === group.id);

    return (
      <TouchableOpacity
        key={group.id}
        style={styles.groupCard}
        onPress={() => handleGroupPress(group.id)}
        testID={`group-${group.id}`}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupTitleContainer}>
            <Text style={styles.groupEmoji}>{category?.icon || '💬'}</Text>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupCategory}>{category?.name || group.category}</Text>
            </View>
          </View>
          {isJoined && (
            <View style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Joined</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.groupDescription} numberOfLines={2}>
          {group.description}
        </Text>
        
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Users size={16} color={Colors.light.darkGray} />
            <Text style={styles.statText}>{group.member_count} members</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={16} color={Colors.light.darkGray} />
            <Text style={styles.statText}>Active</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Community',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateGroup} testID="create-group-button">
              <Plus size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.darkGray}
            />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(undefined)}
            >
              <Text style={[
                styles.categoryText,
                !selectedCategory && styles.categoryTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.id ? undefined : category.id
                )}
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* My Groups Section */}
        {userGroups && userGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Communities</Text>
            {userGroups.slice(0, 3).map(userGroup => {
              if (!userGroup.community_groups) return null;
              return renderGroupCard(userGroup.community_groups as CommunityGroup);
            })}
            {userGroups.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all my communities</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Discover Groups Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover Communities</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading communities...</Text>
            </View>
          ) : groups && groups.length > 0 ? (
            groups.map(group => renderGroupCard(group as CommunityGroup))
          ) : (
            <View style={styles.emptyContainer}>
              <Users size={48} color={Colors.light.darkGray} />
              <Text style={styles.emptyTitle}>No communities found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your search or create a new community
              </Text>
            </View>
          )}
        </View>

        {/* Expert Q&A Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expert Q&A Sessions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllLink}>View all</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.expertCard}>
            <View style={styles.expertHeader}>
              <View style={styles.expertAvatar}>
                <Text style={styles.expertInitials}>Dr</Text>
              </View>
              <View style={styles.expertInfo}>
                <Text style={styles.expertName}>Dr. Sarah Johnson</Text>
                <Text style={styles.expertSpecialty}>Gynecologist</Text>
              </View>
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            
            <Text style={styles.expertTitle}>
              Understanding PCOS: Symptoms and Management
            </Text>
            
            <View style={styles.expertStats}>
              <View style={styles.statItem}>
                <Calendar size={16} color={Colors.light.darkGray} />
                <Text style={styles.statText}>Today, 3:00 PM</Text>
              </View>
              <View style={styles.statItem}>
                <Users size={16} color={Colors.light.darkGray} />
                <Text style={styles.statText}>45 participants</Text>
              </View>
            </View>
          </TouchableOpacity>
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
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  categoryTextActive: {
    color: Colors.light.background,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
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
  viewAllLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  groupCategory: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  joinedBadge: {
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  joinedText: {
    fontSize: 12,
    color: Colors.light.background,
    fontWeight: '500',
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.darkGray,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  expertCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expertAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expertInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.background,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  expertSpecialty: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  liveIndicator: {
    backgroundColor: '#FF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.background,
  },
  expertTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  expertStats: {
    flexDirection: 'row',
    gap: 16,
  },
});