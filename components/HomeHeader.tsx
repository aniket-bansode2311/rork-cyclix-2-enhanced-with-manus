import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Bell, Settings, User, Cloud, CloudOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { useCycleStore } from '@/hooks/use-cycle-store';
import { useAuth } from '@/hooks/use-auth';

export default function HomeHeader() {
  const router = useRouter();
  const { userProfile, isSyncing, lastSyncTime, manualSync } = useCycleStore();
  const { user, isAuthenticated } = useAuth();
  
  const handleSettingsPress = () => {
    router.push('/(tabs)/settings');
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSyncPress = () => {
    if (isAuthenticated) {
      manualSync();
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>
            Hello{isAuthenticated && user ? `, ${user.name}` : ''}!
          </Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        
        <View style={styles.headerButtons}>
          {isAuthenticated && (
            <TouchableOpacity 
              style={[styles.headerButton, isSyncing && styles.syncingButton]}
              onPress={handleSyncPress}
              disabled={isSyncing}
              testID="sync-button"
            >
              {isSyncing ? (
                <Cloud size={22} color={Colors.light.primary} />
              ) : (
                <CloudOff size={22} color={Colors.light.darkGray} />
              )}
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.headerButton}
            testID="notifications-button"
          >
            <Bell size={22} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleProfilePress}
            testID="profile-button"
          >
            <User size={22} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleSettingsPress}
            testID="settings-button"
          >
            <Settings size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {userProfile.isPregnancyMode && (
        <View style={styles.pregnancyBanner}>
          <Text style={styles.pregnancyText}>Pregnancy Mode Active</Text>
        </View>
      )}

      {isAuthenticated && lastSyncTime && (
        <View style={styles.syncStatus}>
          <Text style={styles.syncText}>
            Last synced: {format(lastSyncTime, 'MMM d, h:mm a')}
          </Text>
        </View>
      )}

      {!isAuthenticated && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Sign in to sync your data across devices
          </Text>
          <TouchableOpacity onPress={handleProfilePress}>
            <Text style={styles.signInButton}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  date: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncingButton: {
    backgroundColor: Colors.light.fertile,
  },
  pregnancyBanner: {
    backgroundColor: Colors.light.accent,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  pregnancyText: {
    color: '#FFF',
    fontWeight: '600',
  },
  syncStatus: {
    alignItems: 'center',
    marginTop: 8,
  },
  syncText: {
    fontSize: 12,
    color: Colors.light.darkGray,
  },
  offlineBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  offlineText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  signInButton: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});