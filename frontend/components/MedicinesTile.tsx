import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';

const mockMedicines = [
  { id: '1', name: 'Aspirin', remaining: 80 },
  { id: '2', name: 'Vitamin C', remaining: 40 },
  { id: '3', name: 'Ibuprofen', remaining: 10 },
];

export default function MedicinesTile() {
  return (
    <Tile>
      <View style={styles.header}>
        <Text style={styles.title}>Medicines</Text>
      </View>
      <View style={styles.content}>
        {mockMedicines.map((med) => {
          // Determine progress bar color based on remaining percentage
          const barColor =
            med.remaining > 50 ? '#4CAF50' : med.remaining > 20 ? '#FFC107' : '#F44336';

          return (
            <View key={med.id} style={styles.medicineContainer}>
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{med.name}</Text>
                <Text style={styles.medicineRemaining}>{med.remaining}%</Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${med.remaining}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    marginTop: 5,
  },
  medicineContainer: {
    marginBottom: 15,
  },
  medicineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  medicineName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  medicineRemaining: {
    color: '#dddddd',
    fontSize: 14,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
