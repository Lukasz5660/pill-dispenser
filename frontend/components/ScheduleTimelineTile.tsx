import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';
import { useTheme } from '../context/ThemeContext';

interface ScheduleTimelineTileProps {
  scheduledTimes: string[]; // e.g., ["9:00", "14:30", "20:00"]
}

export default function ScheduleTimelineTile({ scheduledTimes }: ScheduleTimelineTileProps) {
  const { brandColors } = useTheme();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const timeToFraction = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + (m || 0) / 60;
  };

  const fractionalHours = scheduledTimes.map(timeToFraction);

  const minHour = fractionalHours.length > 0 ? Math.floor(Math.min(...fractionalHours)) : 12;
  const maxHour = fractionalHours.length > 0 ? Math.ceil(Math.max(...fractionalHours)) : 12;

  const startHour = Math.max(0, minHour - 3);
  const endHour = Math.min(24, maxHour + 3);
  const span = Math.max(1, endHour - startHour);

  const renderDots = () => {
    return scheduledTimes.map((timeStr) => {
      const hourFrac = timeToFraction(timeStr);
      const leftPosition = `${((hourFrac - startHour) / span) * 100}%`;
      return (
        <View key={timeStr} style={[styles.dotContainer, { left: leftPosition as any }]}>
          <View style={styles.dot} />
          <Text style={styles.timeLabel}>{timeStr}</Text>
        </View>
      );
    });
  };

  const midHour = Math.round(startHour + span / 2);

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
          <Text style={styles.axisText}>{`${startHour}:00`}</Text>
          <Text style={styles.axisText}>{`${midHour}:00`}</Text>
          <Text style={styles.axisText}>{`${endHour}:00`}</Text>
        </View>
      </View>
    </Tile>
  );
}

const getStyles = (brandColors: any) => StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: brandColors.border,
    paddingBottom: 10,
    marginBottom: 20, // Extra margin for the timeline rendering
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: brandColors.white,
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
    backgroundColor: brandColors.success, // Green dot for active time
    borderWidth: 2,
    borderColor: brandColors.glassBackground, // Matches the dark grey background slightly
  },
  timeLabel: {
    color: brandColors.white,
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
    color: brandColors.whiteMuted,
    fontSize: 12,
  },
});
