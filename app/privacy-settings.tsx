import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Shield, Download, Trash2, Eye, EyeOff, Users, Mail, Database } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { data: privacySettings, refetch } = trpc.privacy.settings.get.useQuery();
  const { data: exportRequests } = trpc.privacy.settings.getExportRequests.useQuery();
  const { data: deletionRequest } = trpc.privacy.settings.getDeletionRequest.useQuery();

  const updateSettingsMutation = trpc.privacy.settings.update.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const requestExportMutation = trpc.privacy.settings.requestDataExport.useMutation({
    onSuccess: () => {
      Alert.alert('Export Requested', 'Your data export request has been submitted. You will receive an email when it is ready.');
      refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const requestDeletionMutation = trpc.privacy.settings.requestAccountDeletion.useMutation({
    onSuccess: () => {
      Alert.alert('Deletion Scheduled', 'Your account deletion has been scheduled. You can cancel this request anytime before the deletion date.');
      refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const cancelDeletionMutation = trpc.privacy.settings.cancelAccountDeletion.useMutation({
    onSuccess: () => {
      Alert.alert('Deletion Cancelled', 'Your account deletion request has been cancelled.');
      refetch();
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  const handleDataExport = (type: 'full_export' | 'cycle_data' | 'symptom_data' | 'health_data') => {
    Alert.alert(
      'Export Data',
      `Export your ${type.replace('_', ' ')}? This may take a few minutes to process.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => requestExportMutation.mutate({ request_type: type }) }
      ]
    );
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted after 30 days. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Schedule Deletion',
          style: 'destructive',
          onPress: () => {
            const deletionDate = new Date();
            deletionDate.setDate(deletionDate.getDate() + 30);
            requestDeletionMutation.mutate({
              scheduled_deletion_date: deletionDate.toISOString(),
              reason: 'User requested deletion',
            });
          }
        }
      ]
    );
  };

  const handleCancelDeletion = () => {
    Alert.alert(
      'Cancel Deletion',
      'Are you sure you want to cancel your account deletion?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel Deletion', onPress: () => cancelDeletionMutation.mutate() }
      ]
    );
  };

  if (!privacySettings) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading privacy settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Privacy & Data',
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerShadowVisible: false,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Privacy Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Mode</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              {privacySettings.anonymous_mode ? (
                <EyeOff size={20} color={Colors.light.primary} />
              ) : (
                <Eye size={20} color={Colors.light.primary} />
              )}
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Anonymous Mode</Text>
              <Text style={styles.settingDescription}>
                Hide your identity in community posts and make your data anonymous for research
              </Text>
            </View>
            <Switch
              value={privacySettings.anonymous_mode}
              onValueChange={(value) => handleSettingChange('anonymous_mode', value)}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Data Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Database size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Research Participation</Text>
              <Text style={styles.settingDescription}>
                Allow anonymized data to be used for health research studies
              </Text>
            </View>
            <Switch
              value={privacySettings.data_sharing_research}
              onValueChange={(value) => handleSettingChange('data_sharing_research', value)}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Personalized Insights</Text>
              <Text style={styles.settingDescription}>
                Use your data to provide personalized health insights and recommendations
              </Text>
            </View>
            <Switch
              value={privacySettings.data_sharing_insights}
              onValueChange={(value) => handleSettingChange('data_sharing_insights', value)}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Users size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Third-Party Sharing</Text>
              <Text style={styles.settingDescription}>
                Share anonymized data with trusted health partners (always opt-in)
              </Text>
            </View>
            <Switch
              value={privacySettings.data_sharing_third_party}
              onValueChange={(value) => handleSettingChange('data_sharing_third_party', value)}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Communication Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Mail size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Marketing Communications</Text>
              <Text style={styles.settingDescription}>
                Receive emails about new features, tips, and health content
              </Text>
            </View>
            <Switch
              value={privacySettings.marketing_communications}
              onValueChange={(value) => handleSettingChange('marketing_communications', value)}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Users size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Community Profile Visible</Text>
              <Text style={styles.settingDescription}>
                Show your profile in community features (unless in anonymous mode)
              </Text>
            </View>
            <Switch
              value={privacySettings.community_profile_visible}
              onValueChange={(value) => handleSettingChange('community_profile_visible', value)}
              trackColor={{ false: Colors.light.gray, true: Colors.light.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Data Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Text style={styles.sectionDescription}>
            Download your data in a portable format. Exports are available for 7 days.
          </Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDataExport('full_export')}
          >
            <Download size={20} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>Export All Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDataExport('cycle_data')}
          >
            <Download size={20} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>Export Cycle Data Only</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDataExport('symptom_data')}
          >
            <Download size={20} color={Colors.light.primary} />
            <Text style={styles.actionButtonText}>Export Symptom Data Only</Text>
          </TouchableOpacity>

          {exportRequests && exportRequests.length > 0 && (
            <View style={styles.exportStatus}>
              <Text style={styles.exportStatusTitle}>Recent Export Requests</Text>
              {exportRequests.slice(0, 3).map((request) => (
                <View key={request.id} style={styles.exportItem}>
                  <Text style={styles.exportType}>{request.request_type.replace('_', ' ')}</Text>
                  <Text style={styles.exportRequestStatus}>{request.status}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Account Deletion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Deletion</Text>
          
          {deletionRequest ? (
            <View style={styles.deletionWarning}>
              <Text style={styles.deletionWarningTitle}>Deletion Scheduled</Text>
              <Text style={styles.deletionWarningText}>
                Your account is scheduled for deletion on{' '}
                {new Date(deletionRequest.scheduled_deletion_date).toLocaleDateString()}.
                You can cancel this request anytime before the deletion date.
              </Text>
              <TouchableOpacity
                style={styles.cancelDeletionButton}
                onPress={handleCancelDeletion}
              >
                <Text style={styles.cancelDeletionText}>Cancel Deletion</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.sectionDescription}>
                Permanently delete your account and all associated data. This action cannot be undone.
                Your data will be scheduled for deletion in 30 days, giving you time to change your mind.
              </Text>
              
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={handleAccountDeletion}
              >
                <Trash2 size={20} color={Colors.light.background} />
                <Text style={styles.dangerButtonText}>Delete My Account</Text>
              </TouchableOpacity>
            </>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    lineHeight: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.primary,
    marginLeft: 12,
  },
  exportStatus: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 12,
  },
  exportStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  exportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  exportType: {
    fontSize: 14,
    color: Colors.light.text,
    textTransform: 'capitalize',
  },
  exportRequestStatus: {
    fontSize: 14,
    color: Colors.light.darkGray,
    textTransform: 'capitalize',
  },
  deletionWarning: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  deletionWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  deletionWarningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  cancelDeletionButton: {
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelDeletionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.background,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.periodHeavy,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.background,
    marginLeft: 8,
  },
});