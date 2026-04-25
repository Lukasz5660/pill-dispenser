import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tile from './Tile';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function MedicinesTile({ medicines = [] }: { medicines?: any[] }) {
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
          {medicines.map((med) => {
            // Determine progress bar color based on remaining stock (assuming max capacity of 100)
            const remainingPercentage = Math.min(100, Math.max(0, med.remaining));
            const barColor =
              remainingPercentage > 50 ? brandColors.success : remainingPercentage > 20 ? brandColors.warning : brandColors.error;

            return (
              <View key={med.id} style={styles.medicineContainer}>
                <View style={[globalStyles.rowSpaceBetween, styles.medicineInfo]}>
                  <Text style={globalStyles.bodyText}>{med.name}</Text>
                  <Text style={globalStyles.secondaryText}>{Math.round(remainingPercentage)}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${remainingPercentage}%`,
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
