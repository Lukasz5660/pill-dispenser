import React, { useMemo } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Tile from '../../components/Tile';
import TopBar from '../../components/TopBar';
import { useGlobalStyles } from '../../constants/GlobalStyles';
import { useTheme } from '../../context/ThemeContext';

const staticMedicines = [
  { id: '1', name: 'Aspirin', chamber: 1, remaining: 80 },
  { id: '2', name: 'Vitamin C', chamber: 2, remaining: 40 },
  { id: '3', name: 'Ibuprofen', chamber: 3, remaining: 10 },
];

export default function ManageMedicines() {
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <TopBar title="Medicines" />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            {/* Current Medicines Section */}
            <Tile>
              <View style={styles.sectionHeader}>
                <Text style={globalStyles.titleText}>Current Inventory</Text>
                <Text style={styles.sectionSubtitle}>Tap trash to delete (mockup)</Text>
              </View>

              {staticMedicines.map((med) => (
                <View key={med.id} style={styles.medicineRow}>
                  <View style={styles.medicineDetails}>
                    <Text style={globalStyles.bodyText}>{med.name}</Text>
                    <Text style={globalStyles.secondaryText}>Chamber {med.chamber} • {med.remaining}% left</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color={brandColors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </Tile>

            {/* Add New Medicine Section */}
            <Tile>
              <View style={styles.sectionHeader}>
                <Text style={globalStyles.titleText}>Add New Medicine</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Medicine Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Paracetamol"
                  placeholderTextColor={brandColors.whiteMuted}
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Chamber Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4"
                  placeholderTextColor={brandColors.whiteMuted}
                  keyboardType="numeric"
                  editable={false}
                />
              </View>

              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add-circle-outline" size={20} color={brandColors.white} style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </Tile>

          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const getStyles = (brandColors: any) => StyleSheet.create({
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
    paddingTop: 10,
    gap: 15,
  },
  titleContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: brandColors.white,
  },
  sectionHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.border,
    paddingBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: brandColors.whiteMuted,
    marginTop: 4,
  },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  medicineDetails: {
    flex: 1,
  },
  deleteButton: {
    padding: 5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: brandColors.white,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 12,
    color: brandColors.white,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    backgroundColor: brandColors.success,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  addButtonText: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
