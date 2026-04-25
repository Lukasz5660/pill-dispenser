import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import TopBar from '../../../components/TopBar';
import { useGlobalStyles } from '../../../constants/GlobalStyles';
import { useTheme } from '../../../context/ThemeContext';

const PREDEFINED_MEDICINES = ['Aspirin', 'Vitamin C', 'Ibuprofen', 'Paracetamol'];

type SelectedMedicine = {
  name: string;
  endDate: string;
};

export default function NewUserSelectMedicinesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string; times: string }>();
  
  const [selectedMedicines, setSelectedMedicines] = useState<Record<string, string>>({});
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [activeMedicineForDate, setActiveMedicineForDate] = useState<string | null>(null);

  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const handleToggleMedicine = (med: string) => {
    if (selectedMedicines[med]) {
      // Remove it
      const newSelected = { ...selectedMedicines };
      delete newSelected[med];
      setSelectedMedicines(newSelected);
    } else {
      // Add it and prompt for date
      setActiveMedicineForDate(med);
      setPickerDate(new Date());
      setShowPicker(true);
    }
  };

  const handleChangeDate = (med: string) => {
    setActiveMedicineForDate(med);
    const currDateStr = selectedMedicines[med];
    setPickerDate(currDateStr ? new Date(currDateStr) : new Date());
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      setPickerDate(date);
      if (Platform.OS === 'android' && event.type === 'set' && activeMedicineForDate) {
        confirmDate(date);
      }
    }
  };

  const confirmIosDate = () => {
    setShowPicker(false);
    if (activeMedicineForDate) {
      confirmDate(pickerDate);
    }
  };

  const confirmDate = (date: Date) => {
    if (!activeMedicineForDate) return;
    
    // Format YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setSelectedMedicines(prev => ({
      ...prev,
      [activeMedicineForDate]: formattedDate
    }));
    setActiveMedicineForDate(null);
  };

  const handleComplete = () => {
    // Only pass the names of the selected medicines for now, or the objects.
    const selectedList = Object.keys(selectedMedicines).map(name => ({
      name,
      endDate: selectedMedicines[name]
    }));

    router.push({
      pathname: '/user/new/medicines',
      params: { 
        name: params.name || '', 
        times: params.times || '[]',
        selectedMedicines: JSON.stringify(selectedList)
      }
    });
  };

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <TopBar title={"Select Medicines"} />
        
        <View style={styles.content}>
          <Text style={styles.label}>Which medicines are you taking?</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {PREDEFINED_MEDICINES.map((med, index) => {
              const isSelected = !!selectedMedicines[med];
              return (
                <View key={index} style={[styles.medicineRow, isSelected && styles.medicineRowActive]}>
                  <TouchableOpacity 
                    style={styles.medicineInfo} 
                    onPress={() => handleToggleMedicine(med)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={isSelected ? brandColors.success : brandColors.whiteMuted} 
                    />
                    <Text style={[styles.medicineText, isSelected && styles.medicineTextActive]}>
                      {med}
                    </Text>
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <TouchableOpacity 
                      style={styles.dateSelector}
                      onPress={() => handleChangeDate(med)}
                    >
                      <Text style={styles.dateLabel}>End Date:</Text>
                      <Text style={styles.dateValue}>{selectedMedicines[med]}</Text>
                      <Ionicons name="calendar-outline" size={18} color={brandColors.gradientEnd} style={{marginLeft: 4}} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity 
            style={[
              styles.completeButton, 
              Object.keys(selectedMedicines).length === 0 && styles.completeButtonDisabled
            ]} 
            onPress={handleComplete}
            disabled={Object.keys(selectedMedicines).length === 0}
          >
            <Text style={styles.completeButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <View style={styles.pickerContainer}>
             {Platform.OS === 'ios' && (
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmIosDate}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handlePickerChange}
              textColor={Platform.OS === 'ios' ? brandColors.white : undefined}
            />
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 20,
    color: brandColors.whiteMuted,
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
  },
  medicineRow: {
    flexDirection: 'column',
    backgroundColor: brandColors.glassBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  medicineRowActive: {
    borderColor: brandColors.success,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  medicineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicineText: {
    color: brandColors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  medicineTextActive: {
    color: brandColors.success,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brandColors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
    marginLeft: 36,
  },
  dateLabel: {
    fontSize: 14,
    color: brandColors.gradientStart,
    marginRight: 6,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: brandColors.gradientEnd,
  },
  completeButton: {
    backgroundColor: brandColors.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: brandColors.gradientEnd,
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: brandColors.gradientStart,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: brandColors.border,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.border,
  },
  pickerCancel: {
    color: brandColors.error,
    fontSize: 16,
  },
  pickerDone: {
    color: brandColors.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
