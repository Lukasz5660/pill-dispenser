import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';

interface ScheduleTimelineTileProps {
  scheduledHours: number[]; // e.g., [9, 14, 20]
}

export default function ScheduleTimelineTile({ scheduledHours }: ScheduleTimelineTileProps) {
  // We represent 24 hours (0 to 24)
  const renderDots = () => {
    return scheduledHours.map((hour) => {
      // Calculate position percentage (hour / 24)
      const leftPosition = `${(hour / 24) * 100}%`;
      return (
        <View key={hour} style={[styles.dotContainer, { left: leftPosition as any }]}>
          <View style={styles.dot} />
          <Text style={styles.timeLabel}>{`${hour}:00`}</Text>
        </View>
      );
    });
  };

  return (
    <Tile>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Timeline</Text>
      </View>
      <View style={styles.timelineWrapper}>
        <View style={styles.bar}>
          {renderDots()}
        </View>
        <View style={styles.axisLabels}>
          <Text style={styles.axisText}>0:00</Text>
          <Text style={styles.axisText}>12:00</Text>
          <Text style={styles.axisText}>24:00</Text>
        </View>
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 10,
    marginBottom: 20, // Extra margin for the timeline rendering
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  timelineWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  bar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    position: 'relative',
    marginTop: 15, // Space for the time labels above the dots
    marginBottom: 5,
  },
  dotContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: -3, // Pulls the dot up to perfectly center it vertically on the 8px bar (8/2 - 14/2 = -3)
    transform: [{ translateX: -10 }], // Center the dot on the exact percentage horizontally
    width: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50', // Green dot for active time
    borderWidth: 2,
    borderColor: '#1e1e1e', // Matches the dark grey background slightly
  },
  timeLabel: {
    color: '#ffffff',
    fontSize: 10,
    position: 'absolute',
    top: -20,
    width: 40,
    textAlign: 'center',
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  axisText: {
    color: '#888888',
    fontSize: 12,
  },
});
