import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Tile from '../../components/Tile';
import TopBar from '../../components/TopBar';
import { Colors } from '../../constants/theme';
import { GlobalStyles } from '../../constants/GlobalStyles';

const staticMedicines = [
  { id: '1', name: 'Aspirin', chamber: 1, remaining: 80 },
  { id: '2', name: 'Vitamin C', chamber: 2, remaining: 40 },
  { id: '3', name: 'Ibuprofen', chamber: 3, remaining: 10 },
];

export default function ManageMedicines() {
  return (
    <LinearGradient
      colors={[Colors.brand.gradientStart, Colors.brand.gradientMiddle, Colors.brand.gradientEnd]}
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
                <Text style={GlobalStyles.titleText}>Current Inventory</Text>
                <Text style={styles.sectionSubtitle}>Tap trash to delete (mockup)</Text>
              </View>

              {staticMedicines.map((med) => (
                <View key={med.id} style={styles.medicineRow}>
                  <View style={styles.medicineDetails}>
                    <Text style={GlobalStyles.bodyText}>{med.name}</Text>
                    <Text style={GlobalStyles.secondaryText}>Chamber {med.chamber} • {med.remaining}% left</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              ))}
            </Tile>

            {/* Add New Medicine Section */}
            <Tile>
              <View style={styles.sectionHeader}>
                <Text style={GlobalStyles.titleText}>Add New Medicine</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Medicine Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Paracetamol"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  editable={false}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Chamber Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  keyboardType="numeric"
                  editable={false}
                />
              </View>

              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add-circle-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.addButtonText}>Add Medicine</Text>
              </TouchableOpacity>
            </Tile>

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
    color: Colors.brand.white,
  },
  sectionHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
    paddingBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
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
    color: Colors.brand.white,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addButton: {
    backgroundColor: Colors.brand.success,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  addButtonText: {
    color: Colors.brand.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
