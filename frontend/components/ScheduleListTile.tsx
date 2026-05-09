import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Tile from './Tile';
import { useTheme } from '../context/ThemeContext';

interface ScheduleItem {
  time: string; // e.g., "9:00"
  medications: { amount: string; name: string }[];
}

interface ScheduleListTileProps {
  scheduleData: ScheduleItem[];
}

export default function ScheduleListTile({ scheduleData }: ScheduleListTileProps) {
  const { brandColors } = useTheme();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const renderItem = ({ item }: { item: ScheduleItem }) => {
    return (
      <View style={styles.scheduleBlock}>
        <Text style={styles.timeHeader}>{item.time}</Text>
        <View style={styles.medList}>
          {item.medications.map((med, index) => (
            <View key={index} style={styles.medRow}>
              <Text style={styles.medAmount}>{med.amount}x</Text>
              <Text style={styles.medName}>{med.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Tile>
      <View style={styles.header}>
        <Text style={styles.title}>Prescription Routine</Text>
      </View>
      <FlatList
        data={scheduleData}
        keyExtractor={(item) => item.time}
        renderItem={renderItem}
        scrollEnabled={false} // Since this is inside a larger ScrollView, we disable scrolling for this internal FlatList to avoid nesting issues.
        contentContainerStyle={{ paddingBottom: 10 }}
      />
    </Tile>
  );
}

const getStyles = (brandColors: any) => StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: brandColors.border,
    paddingBottom: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: brandColors.white,
  },
  scheduleBlock: {
    marginBottom: 20,
    backgroundColor: brandColors.glassBackground,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: brandColors.success, // Highlight active rows
  },
  timeHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: brandColors.white,
    marginBottom: 10,
  },
  medList: {
    paddingLeft: 5,
  },
  medRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  medAmount: {
    color: brandColors.whiteMuted,
    fontSize: 16,
    marginRight: 10,
    width: 30, // Fixed width for alignment
    textAlign: 'right',
  },
  medName: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: '500',
  },
});
