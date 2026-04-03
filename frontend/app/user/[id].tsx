import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

import ScheduleTimelineTile from '../../components/ScheduleTimelineTile';
import ScheduleListTile from '../../components/ScheduleListTile';
import TopBar from '../../components/TopBar';

// Mock data referencing the user's specific schedule
const mockScheduleData = [
  {
    time: '9:00',
    hour: 9,
    medications: [
      { amount: '2x', name: 'Ibuprofen' },
      { amount: '1x', name: 'Aspirin' },
    ],
  },
  {
    time: '14:00',
    hour: 14,
    medications: [
      { amount: '1x', name: 'Vitamin C' },
    ],
  },
  {
    time: '20:00',
    hour: 20,
    medications: [
      { amount: '1x', name: 'Melatonin' },
    ],
  },
];

export default function UserSchedule() {
  const { id } = useLocalSearchParams();

  // Extract just the hours for the visual timeline plot
  const scheduledHours = mockScheduleData.map(data => data.hour);

  return (
    <LinearGradient
      colors={['#1c1c1c', '#3a3a3a', '#545454']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <TopBar title={`User ${id}`} />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            <ScheduleTimelineTile scheduledHours={scheduledHours} />
            <ScheduleListTile scheduleData={mockScheduleData} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
    gap: 15,
  },
  titleContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
