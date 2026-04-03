import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tile from './Tile';
import { GlobalStyles } from '../constants/GlobalStyles';
import { Colors } from '../constants/theme';

const mockMedicines = [
  { id: '1', name: 'Aspirin', remaining: 80 },
  { id: '2', name: 'Vitamin C', remaining: 40 },
  { id: '3', name: 'Ibuprofen', remaining: 10 },
];

export default function MedicinesTile() {
  const router = useRouter();

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push('/medicines')}
    >
      <Tile>
        <View style={GlobalStyles.tileHeader}>
          <Text style={GlobalStyles.titleText}>Medicines</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.brand.whiteHalf} />
        </View>
        <View style={styles.content}>
          {mockMedicines.map((med) => {
            // Determine progress bar color based on remaining percentage
            const barColor =
              med.remaining > 50 ? Colors.brand.success : med.remaining > 20 ? Colors.brand.warning : Colors.brand.error;

            return (
              <View key={med.id} style={styles.medicineContainer}>
                <View style={[GlobalStyles.rowSpaceBetween, styles.medicineInfo]}>
                  <Text style={GlobalStyles.bodyText}>{med.name}</Text>
                  <Text style={GlobalStyles.secondaryText}>{med.remaining}%</Text>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 5,
  },
  medicineContainer: {
    marginBottom: 15,
  },
  medicineInfo: {
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.brand.glassBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
