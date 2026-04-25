import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tile from './Tile';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

const mockMedicines = [
  { id: '1', name: 'Aspirin', remaining: 80 },
  { id: '2', name: 'Vitamin C', remaining: 40 },
  { id: '3', name: 'Ibuprofen', remaining: 10 },
];

export default function MedicinesTile() {
  const router = useRouter();
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => router.push('/medicines')}
    >
      <Tile>
        <View style={globalStyles.tileHeader}>
          <Text style={globalStyles.titleText}>Medicines</Text>
          <Ionicons name="chevron-forward" size={20} color={brandColors.whiteHalf} />
        </View>
        <View style={styles.content}>
          {mockMedicines.map((med) => {
            // Determine progress bar color based on remaining percentage
            const barColor =
              med.remaining > 50 ? brandColors.success : med.remaining > 20 ? brandColors.warning : brandColors.error;

            return (
              <View key={med.id} style={styles.medicineContainer}>
                <View style={[globalStyles.rowSpaceBetween, styles.medicineInfo]}>
                  <Text style={globalStyles.bodyText}>{med.name}</Text>
                  <Text style={globalStyles.secondaryText}>{med.remaining}%</Text>
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

const getStyles = (brandColors: any) => StyleSheet.create({
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
    backgroundColor: brandColors.glassBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
