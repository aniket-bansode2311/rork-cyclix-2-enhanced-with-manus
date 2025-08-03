import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';

import CalendarView from '@/components/CalendarView';
import { CycleContext } from '@/hooks/use-cycle-store';
import Colors from '@/constants/colors';

export default function CalendarScreen() {
  return (
    <CycleContext>
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Calendar',
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerShadowVisible: false,
          }}
        />
        
        <CalendarView />
      </View>
    </CycleContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});