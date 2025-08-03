import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { User, Mail, Calendar, Shield, LogOut } from 'lucide-react-native';

import { useAuth } from '@/hooks/use-auth';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout, isLoggingOut } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Profile updated:", { name });
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // TODO: Implement account deletion API call
            console.log("Account deletion requested");
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            logout();
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Profile' }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Profile',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
        }} 
      />
      
      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User size={40} color={Colors.light.primary} />
          </View>
          <Text style={styles.userName}>{user.user_metadata?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {!user.email_confirmed_at && (
            <View style={styles.verificationBanner}>
              <Text style={styles.verificationText}>Email not verified</Text>
              <TouchableOpacity>
                <Text style={styles.verifyButton}>Verify Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoItem}>
            <User size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  testID="name-input"
                />
              ) : (
                <Text style={styles.infoValue}>{user.user_metadata?.name || 'Not set'}</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              testID="edit-name-button"
            >
              <Text style={styles.editButton}>
                {isEditing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <Mail size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Calendar size={20} color={Colors.light.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <Shield size={20} color={Colors.light.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Export My Data</Text>
              <Text style={styles.actionDescription}>
                Download all your cycle data
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Shield size={20} color={Colors.light.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>Privacy Settings</Text>
              <Text style={styles.actionDescription}>
                Manage your data preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={handleLogout}
            disabled={isLoggingOut}
            testID="logout-button"
          >
            <LogOut size={20} color={Colors.light.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionLabel}>
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, styles.dangerAction]}
            onPress={handleDeleteAccount}
            testID="delete-account-button"
          >
            <User size={20} color={Colors.light.periodHeavy} />
            <View style={styles.actionContent}>
              <Text style={[styles.actionLabel, styles.dangerText]}>
                Delete Account
              </Text>
              <Text style={styles.actionDescription}>
                Permanently delete your account and all data
              </Text>
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
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.darkGray,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.periodLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  verificationText: {
    fontSize: 14,
    color: Colors.light.text,
    marginRight: 8,
  },
  verifyButton: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.text,
  },
  editInput: {
    fontSize: 16,
    color: Colors.light.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.primary,
    paddingVertical: 4,
  },
  editButton: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.lightGray,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginTop: 2,
  },
  dangerAction: {
    marginTop: 8,
  },
  dangerText: {
    color: Colors.light.periodHeavy,
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