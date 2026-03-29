import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronRight, Shield, Download, Trash2, Heart, Bell, User, Calendar, LogOut, Cloud, Activity } from 'lucide-react-native';

import { CycleContext, useCycleStore } from '@/hooks/use-cycle-store';
import { useAuth } from '@/hooks/use-auth';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
  return (
    <CycleContext>
      <SettingsContent />
    </CycleContext>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { userProfile, togglePregnancyMode, updateUserProfile, manualSync, isSyncing } = useCycleStore();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handlePregnancyModeToggle = () => {
    if (!userProfile.isPregnancyMode) {
      Alert.alert(
        'Enable Pregnancy Mode',
        'This will disable fertility predictions and focus on pregnancy tracking. You can change this anytime in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: togglePregnancyMode }
        ]
      );
    } else {
      togglePregnancyMode();
    }
  };
  
  const handleViewCalendar = () => {
    router.push('/(tabs)/calendar');
  };
  
  const handleViewInsights = () => {
    router.push('/(tabs)/insights');
  };

  const handleHealthIntegration = () => {
    // For now, we'll show an alert. In the future, this could navigate to a dedicated health integration screen
    Alert.alert(
      'Health Integration',
      'Connect with Apple Health or Google Fit to automatically sync health data like basal body temperature, weight, and sleep patterns.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Learn More', onPress: () => console.log('Navigate to health integration') }
      ]
    );
  };

  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleLogout = () => {
    if (isAuthenticated) {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: logout }
        ]
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView>
        {isAuthenticated && user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleProfilePress}
              testID="profile-button"
            >
              <View style={styles.settingIconContainer}>
                <User size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>{user.user_metadata?.full_name || user.email}</Text>
                <Text style={styles.settingDescription}>{user.email}</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.darkGray} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={manualSync}
              disabled={isSyncing}
              testID="sync-button"
            >
              <View style={styles.settingIconContainer}>
                <Cloud size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>
                  {isSyncing ? 'Syncing...' : 'Sync Data'}
                </Text>
                <Text style={styles.settingDescription}>
                  Sync your data with the cloud
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleLogout}
              testID="logout-button"
            >
              <View style={styles.settingIconContainer}>
                <LogOut size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleProfilePress}
              testID="sign-in-button"
            >
              <View style={styles.settingIconContainer}>
                <User size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Sign In</Text>
                <Text style={styles.settingDescription}>
                  Sync your data across devices
                </Text>
              </View>
              <ChevronRight size={20} color={Colors.light.darkGray} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Navigation</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleViewCalendar}
            testID="navigate-calendar"
          >
            <View style={styles.settingIconContainer}>
              <Calendar size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Calendar & Tracking</Text>
              <Text style={styles.settingDescription}>
                View your cycle calendar and log data
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleViewInsights}
            testID="navigate-insights"
          >
            <View style={styles.settingIconContainer}>
              <Heart size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Insights & Education</Text>
              <Text style={styles.settingDescription}>
                View cycle insights and health articles
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleHealthIntegration}
            testID="health-integration"
          >
            <View style={styles.settingIconContainer}>
              <Activity size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Health Integration</Text>
              <Text style={styles.settingDescription}>
                Connect Apple Health or Google Fit
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cycle Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <User size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Pregnancy Mode</Text>
              <Text style={styles.settingDescription}>
                {userProfile.isPregnancyMode 
                  ? 'Currently tracking pregnancy symptoms' 
                  : 'Disables fertility predictions and focuses on pregnancy tracking'
                }
              </Text>
            </View>
            <Switch
              value={userProfile.isPregnancyMode}
              onValueChange={handlePregnancyModeToggle}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
              testID="pregnancy-mode-switch"
            />
          </View>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Average Cycle Length</Text>
              <Text style={styles.settingValue}>{userProfile.averageCycleLength} days</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Average Period Length</Text>
              <Text style={styles.settingValue}>{userProfile.averagePeriodLength} days</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Birth Control Method</Text>
              <Text style={styles.settingValue}>
                {userProfile.birthControlMethod || 'Not set'}
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Manage period and fertility reminders
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Privacy</Text>
              <Text style={styles.settingDescription}>
                {isAuthenticated 
                  ? 'Your data is encrypted and securely stored' 
                  : 'Your data is stored locally on your device'
                }
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Download size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Download your cycle history
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Heart size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Rate the App</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color={Colors.light.darkGray} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, styles.dangerItem]}>
            <View style={styles.settingIconContainer}>
              <Trash2 size={20} color={Colors.light.periodHeavy} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, styles.dangerText]}>
                Clear All Data
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
    color: Colors.light.text,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 2,
  },
  dangerItem: {
    marginTop: 16,
  },
  dangerText: {
    color: Colors.light.periodHeavy,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
});