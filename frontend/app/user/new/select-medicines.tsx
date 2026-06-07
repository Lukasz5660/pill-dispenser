import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import TopBar from '../../../components/TopBar';
import { useGlobalStyles } from '../../../constants/GlobalStyles';
import { useTheme } from '../../../context/ThemeContext';
import { API_BASE_URL, ACCOUNT_ID } from '../../../constants/config';

type AvailableMedicine = {
  id: string;
  name: string;
};

type SelectedMedicine = {
  name: string;
  endDate: string;
};

export default function NewUserSelectMedicinesScreen() {
  const router = useRouter();
  const { name, times, userId, editPayload } = useLocalSearchParams<{ name: string; times: string; userId?: string; editPayload?: string }>();
  
  const initialSelected = useMemo(() => {
    if (editPayload) {
      try {
        const payload = JSON.parse(editPayload);
        const meds = payload.medications || [];
        const initialMap: Record<string, { name: string, endDate: string }> = {};
        meds.forEach((m: any) => {
          initialMap[m.id] = { name: m.name, endDate: m.endDate };
        });
        return initialMap;
      } catch (e) {
        console.error("Failed to parse editPayload in select-medicines", e);
      }
    }
    return {};
  }, [editPayload]);

  const [availableMedicines, setAvailableMedicines] = useState<AvailableMedicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<Record<string, { name: string, endDate: string }>>(initialSelected);
  
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [activeMedicineForDate, setActiveMedicineForDate] = useState<AvailableMedicine | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/medicines?account_id=${ACCOUNT_ID}`)
      .then(res => res.json())
      .then(data => {
        setAvailableMedicines(data);
      })
      .catch(err => console.error('Failed to fetch medicines:', err));
  }, []);

  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const handleToggleMedicine = (med: AvailableMedicine) => {
    if (selectedMedicines[med.id]) {
      // Remove it
      const newSelected = { ...selectedMedicines };
      delete newSelected[med.id];
      setSelectedMedicines(newSelected);
    } else {
      // Add it and prompt for date
      setActiveMedicineForDate(med);
      setPickerDate(new Date());
      setShowPicker(true);
    }
  };

  const handleChangeDate = (med: AvailableMedicine) => {
    setActiveMedicineForDate(med);
    const currDateStr = selectedMedicines[med.id]?.endDate;
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
      [activeMedicineForDate.id]: {
        name: activeMedicineForDate.name,
        endDate: formattedDate
      }
    }));
    setActiveMedicineForDate(null);
  };

  const handleComplete = () => {
    // Pass the list of selected medicines
    const selectedList = Object.keys(selectedMedicines).map(id => ({
      id,
      name: selectedMedicines[id].name,
      endDate: selectedMedicines[id].endDate
    }));

    router.push({
      pathname: '/user/new/medicines',
      params: { 
        name: name || '', 
        times: times || '[]',
        selectedMedicines: JSON.stringify(selectedList),
        userId: userId || '',
        editPayload: editPayload || ''
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
        <TopBar title={userId ? `Edit Medicines` : `Select Medicines`} />
        
        <View style={styles.content}>
          <Text style={styles.label}>Which medicines are you taking?</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {availableMedicines.map((med, index) => {
              const isSelected = !!selectedMedicines[med.id];
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
                      {med.name}
                    </Text>
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <TouchableOpacity 
                      style={styles.dateSelector}
                      onPress={() => handleChangeDate(med)}
                    >
                      <Text style={styles.dateLabel}>End Date:</Text>
                      <Text style={styles.dateValue}>{selectedMedicines[med.id]?.endDate}</Text>
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
