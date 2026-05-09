import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, TouchableOpacity, Text, TextInput, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Tile from '../../components/Tile';
import TopBar from '../../components/TopBar';
import { useGlobalStyles } from '../../constants/GlobalStyles';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL, ACCOUNT_ID } from '../../constants/config';

interface Medicine {
  id: string;
  name: string;
  chamber: number;
  remaining: number;
}

export default function ManageMedicines() {
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [medName, setMedName] = useState('');
  const [chamberNumber, setChamberNumber] = useState('');

  const fetchMedicines = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/medicines?account_id=${ACCOUNT_ID}`);
      const data = await response.json();
      setMedicines(data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      Alert.alert('Error', 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddMedicine = async () => {
    if (!medName || !chamberNumber) {
      Alert.alert('Validation Error', 'Please enter both medicine name and chamber number.');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch(`${API_BASE_URL}/medicines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: ACCOUNT_ID,
          med_name: medName,
          chamber_number: parseInt(chamberNumber, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Failed to add medicine');
      } else {
        Alert.alert('Success', 'Medicine added successfully');
        setMedName('');
        setChamberNumber('');
        fetchMedicines();
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      Alert.alert('Error', 'An unexpected error occurred while adding medicine.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/medicines/${id}`, {
                method: 'DELETE',
              });
              
              if (!response.ok) {
                const data = await response.json();
                Alert.alert('Error', data.error || 'Failed to delete medicine');
              } else {
                fetchMedicines();
              }
            } catch (error) {
              console.error('Error deleting medicine:', error);
              Alert.alert('Error', 'An unexpected error occurred while deleting medicine.');
            }
          },
        },
      ]
    );
  };

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
                <Text style={styles.sectionSubtitle}>Tap trash to delete</Text>
              </View>

              {loading ? (
                <ActivityIndicator size="small" color={brandColors.white} />
              ) : medicines.length === 0 ? (
                <Text style={globalStyles.bodyText}>No medicines found.</Text>
              ) : (
                medicines.map((med) => (
                  <View key={med.id} style={styles.medicineRow}>
                    <View style={styles.medicineDetails}>
                      <Text style={globalStyles.bodyText}>{med.name}</Text>
                      <Text style={globalStyles.secondaryText}>Chamber {med.chamber} • {med.remaining} remaining</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteMedicine(med.id)}>
                      <Ionicons name="trash-outline" size={24} color={brandColors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
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
                  value={medName}
                  onChangeText={setMedName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Chamber Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 4"
                  placeholderTextColor={brandColors.whiteMuted}
                  keyboardType="numeric"
                  value={chamberNumber}
                  onChangeText={setChamberNumber}
                />
              </View>

              <TouchableOpacity 
                style={[styles.addButton, adding && { opacity: 0.7 }]} 
                onPress={handleAddMedicine}
                disabled={adding}
              >
                {adding ? (
                  <ActivityIndicator size="small" color={brandColors.white} />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={20} color={brandColors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.addButtonText}>Add Medicine</Text>
                  </>
                )}
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
