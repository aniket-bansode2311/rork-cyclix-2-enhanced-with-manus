import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { Smartphone, Activity, Heart, Thermometer, Scale, Moon } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { trpc } from '@/lib/trpc';

interface HealthIntegrationProps {
  onDataImported?: () => void;
}

export default function HealthIntegration({ onDataImported }: HealthIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const addHealthDataMutation = trpc.health.data.add.useMutation();
  const addHealthDataBatchMutation = trpc.health.data.addBatch.useMutation();
  const healthInsightsQuery = trpc.health.data.getInsights.useQuery();

  const handleConnectAppleHealth = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Health is only available on iOS devices.');
      return;
    }

    setIsConnecting('apple');
    
    try {
      // TODO: Implement Apple HealthKit integration
      // This would require expo-health or react-native-health package
      Alert.alert(
        'Coming Soon',
        'Apple Health integration will be available in a future update. For now, you can manually add health data.',
        [
          {
            text: 'Add Manual Data',
            onPress: () => handleManualDataEntry('bbt'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Apple Health connection failed:', error);
      Alert.alert('Connection Failed', 'Unable to connect to Apple Health. Please try again.');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleConnectGoogleFit = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Available', 'Google Fit is only available on Android devices.');
      return;
    }

    setIsConnecting('google');
    
    try {
      // TODO: Implement Google Fit integration
      // This would require @react-native-google-fit/google-fit package
      Alert.alert(
        'Coming Soon',
        'Google Fit integration will be available in a future update. For now, you can manually add health data.',
        [
          {
            text: 'Add Manual Data',
            onPress: () => handleManualDataEntry('steps'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Google Fit connection failed:', error);
      Alert.alert('Connection Failed', 'Unable to connect to Google Fit. Please try again.');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleManualDataEntry = (dataType: 'bbt' | 'weight' | 'sleep' | 'steps' | 'heart_rate') => {
    Alert.prompt(
      `Add ${getDataTypeName(dataType)}`,
      `Enter your ${getDataTypeName(dataType).toLowerCase()} value:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async (value) => {
            if (value && !isNaN(Number(value))) {
              try {
                await addHealthDataMutation.mutateAsync({
                  date: new Date().toISOString().split('T')[0],
                  dataType,
                  value: Number(value),
                  unit: getDataTypeUnit(dataType),
                  source: 'manual',
                });
                
                Alert.alert('Success', `${getDataTypeName(dataType)} added successfully!`);
                onDataImported?.();
              } catch (error) {
                console.error('Failed to add health data:', error);
                Alert.alert('Error', 'Failed to add health data. Please try again.');
              }
            } else {
              Alert.alert('Invalid Input', 'Please enter a valid number.');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const getDataTypeName = (dataType: string): string => {
    switch (dataType) {
      case 'bbt':
        return 'Basal Body Temperature';
      case 'weight':
        return 'Weight';
      case 'sleep':
        return 'Sleep Hours';
      case 'steps':
        return 'Steps';
      case 'heart_rate':
        return 'Heart Rate';
      default:
        return dataType;
    }
  };

  const getDataTypeUnit = (dataType: string): string => {
    switch (dataType) {
      case 'bbt':
        return 'celsius';
      case 'weight':
        return 'kg';
      case 'sleep':
        return 'hours';
      case 'steps':
        return 'steps';
      case 'heart_rate':
        return 'bpm';
      default:
        return '';
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'bbt':
        return Thermometer;
      case 'weight':
        return Scale;
      case 'sleep':
        return Moon;
      case 'steps':
        return Activity;
      case 'heart_rate':
        return Heart;
      default:
        return Activity;
    }
  };

  const renderHealthDataTypes = () => {
    const dataTypes = ['bbt', 'weight', 'sleep', 'steps', 'heart_rate'];

    return (
      <View style={styles.dataTypesContainer}>
        <Text style={styles.sectionTitle}>Track Health Metrics</Text>
        <View style={styles.dataTypesGrid}>
          {dataTypes.map((dataType) => {
            const IconComponent = getDataTypeIcon(dataType);
            const insight = healthInsightsQuery.data?.[dataType];
            
            return (
              <TouchableOpacity
                key={dataType}
                style={styles.dataTypeCard}
                onPress={() => handleManualDataEntry(dataType as any)}
              >
                <IconComponent size={24} color={Colors.light.primary} />
                <Text style={styles.dataTypeName}>
                  {getDataTypeName(dataType)}
                </Text>
                {insight && (
                  <View style={styles.insightContainer}>
                    <Text style={styles.insightValue}>
                      {insight.current?.toFixed(1) || '--'}
                    </Text>
                    <Text style={styles.insightUnit}>
                      {getDataTypeUnit(dataType)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderIntegrationOptions = () => {
    return (
      <View style={styles.integrationContainer}>
        <Text style={styles.sectionTitle}>Connect Health Apps</Text>
        
        <TouchableOpacity
          style={[
            styles.integrationButton,
            Platform.OS !== 'ios' && styles.integrationButtonDisabled,
          ]}
          onPress={handleConnectAppleHealth}
          disabled={isConnecting === 'apple' || Platform.OS !== 'ios'}
        >
          <Smartphone size={20} color={Platform.OS === 'ios' ? Colors.light.background : Colors.light.darkGray} />
          <Text style={[
            styles.integrationButtonText,
            Platform.OS !== 'ios' && styles.integrationButtonTextDisabled,
          ]}>
            {isConnecting === 'apple' ? 'Connecting...' : 'Connect Apple Health'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.integrationButton,
            styles.googleFitButton,
            Platform.OS !== 'android' && styles.integrationButtonDisabled,
          ]}
          onPress={handleConnectGoogleFit}
          disabled={isConnecting === 'google' || Platform.OS !== 'android'}
        >
          <Activity size={20} color={Platform.OS === 'android' ? Colors.light.background : Colors.light.darkGray} />
          <Text style={[
            styles.integrationButtonText,
            Platform.OS !== 'android' && styles.integrationButtonTextDisabled,
          ]}>
            {isConnecting === 'google' ? 'Connecting...' : 'Connect Google Fit'}
          </Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Health app integrations are coming soon. For now, you can manually track your health metrics.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Integration</Text>
      {renderHealthDataTypes()}
      {renderIntegrationOptions()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: Colors.light.text,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.light.text,
  },
  dataTypesContainer: {
    marginBottom: 32,
  },
  dataTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dataTypeCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataTypeName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  insightContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  insightUnit: {
    fontSize: 10,
    color: Colors.light.darkGray,
  },
  integrationContainer: {
    marginBottom: 32,
  },
  integrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  integrationButtonDisabled: {
    backgroundColor: Colors.light.lightGray,
  },
  googleFitButton: {
    backgroundColor: '#4285F4', // Google Blue
  },
  integrationButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  integrationButtonTextDisabled: {
    color: Colors.light.darkGray,
  },
  disclaimer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.light.darkGray,
    textAlign: 'center',
    lineHeight: 16,
  },
});