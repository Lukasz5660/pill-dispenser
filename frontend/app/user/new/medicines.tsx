import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, ACCOUNT_ID } from '../../../constants/config';

import TopBar from '../../../components/TopBar';
import { useGlobalStyles } from '../../../constants/GlobalStyles';
import { useTheme } from '../../../context/ThemeContext';

type SelectedMedicine = {
  id: string;
  name: string;
  endDate: string;
};

type Assignment = {
  id: string;
  name: string;
  dosage: number;
};

export default function NewUserMedicinesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string; times: string; selectedMedicines?: string; userId?: string; editPayload?: string }>();
  
  const [timesArray, setTimesArray] = useState<string[]>([]);
  const [availableMedicines, setAvailableMedicines] = useState<SelectedMedicine[]>([]);
  
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>(() => {
    if (params.editPayload) {
      try {
        const payload = JSON.parse(params.editPayload);
        const currentTimes = params.times ? JSON.parse(params.times) : [];
        const currentMeds = params.selectedMedicines ? JSON.parse(params.selectedMedicines) : [];
        const validMedIds = new Set(currentMeds.map((m: any) => m.id));

        const savedAssignments = payload.assignments || {};
        const filteredAssignments: Record<string, Assignment[]> = {};
        for (const t of currentTimes) {
          if (savedAssignments[t]) {
            filteredAssignments[t] = savedAssignments[t].filter((a: any) => validMedIds.has(a.id));
          }
        }
        return filteredAssignments;
      } catch (e) {
        console.error("Failed to parse editPayload in medicines", e);
      }
    }
    return {};
  });

  const [activeMedicine, setActiveMedicine] = useState<Record<string, string>>({}); // stores id
  const [activeDosage, setActiveDosage] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  useEffect(() => {
    if (params.times) {
      try {
        const parsed = JSON.parse(params.times);
        setTimesArray(parsed);
      } catch (e) {
        console.error("Failed to parse times", e);
      }
    }
    
    if (params.selectedMedicines) {
      try {
        const parsed = JSON.parse(params.selectedMedicines);
        setAvailableMedicines(parsed);
      } catch (e) {
        console.error("Failed to parse selectedMedicines", e);
      }
    }
  }, [params.times, params.selectedMedicines]);

  const handleAddAssignment = (time: string) => {
    const medId = activeMedicine[time];
    const doseStr = activeDosage[time] || '';
    const doseInt = parseInt(doseStr, 10);
    
    if (medId && !isNaN(doseInt) && doseInt > 0) {
      const med = availableMedicines.find(m => m.id === medId);
      if (!med) return;

      const currentList = assignments[time] || [];
      setAssignments({
        ...assignments,
        [time]: [...currentList, { id: medId, name: med.name, dosage: doseInt }]
      });
      // Reset inputs for this time
      setActiveMedicine({ ...activeMedicine, [time]: '' });
      setActiveDosage({ ...activeDosage, [time]: '' });
    }
  };

  const removeAssignment = (time: string, index: number) => {
    const currentList = assignments[time] || [];
    const newList = [...currentList];
    newList.splice(index, 1);
    setAssignments({
      ...assignments,
      [time]: newList
    });
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    const payload = {
      name: params.name || 'User',
      account_id: parseInt(ACCOUNT_ID, 10),
      medications: availableMedicines,
      assignments: assignments
    };

    const isEdit = !!params.userId;
    const url = isEdit ? `${API_BASE_URL}/users/${params.userId}` : `${API_BASE_URL}/users`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} user`);
      }
      
      if (isEdit) {
        if (router.canDismiss()) {
          router.dismiss(3);
        } else {
          router.replace(`/user/${params.userId}`);
        }
      } else {
        router.dismissAll();
      }
    } catch (e) {
      console.error(e);
      // You could show an alert here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <TopBar title={params.userId ? "Update Assignments" : ("Medicines for " + (params.name || 'User'))} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.headerLabel}>Assign Medicines to Schedule</Text>

            {timesArray.map((time) => (
              <View key={time} style={styles.timeBlock}>
                <View style={styles.timeHeader}>
                  <Ionicons name="time-outline" size={24} color={brandColors.white} />
                  <Text style={styles.timeHeaderText}>{time}</Text>
                </View>

                {/* Existing Assignments list */}
                {(assignments[time] || []).map((item, index) => (
                  <View key={index} style={styles.assignmentRow}>
                    <View style={styles.assignmentInfo}>
                      <Text style={styles.assignmentDosage}>{item.dosage}</Text>
                      <Text style={styles.assignmentMedicine}>{item.name}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeAssignment(time, index)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={20} color={brandColors.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Inline form to add new assignment */}
                <View style={styles.addForm}>
                  <Text style={styles.subLabel}>Select Medicine:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicineSelector}>
                    {availableMedicines.map((med) => {
                      const isSelected = activeMedicine[time] === med.id;
                      return (
                        <TouchableOpacity
                          key={med.id}
                          style={[styles.medicineChip, isSelected && styles.medicineChipActive]}
                          onPress={() => setActiveMedicine({ ...activeMedicine, [time]: med.id })}
                        >
                          <Text style={[styles.medicineChipText, isSelected && styles.medicineChipTextActive]}>
                            {med.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  
                  <View style={styles.dosageRow}>
                    <TextInput
                      style={styles.dosageInput}
                      placeholder="Dosage (e.g., 1)"
                      placeholderTextColor={brandColors.whiteMuted}
                      value={activeDosage[time] || ''}
                      onChangeText={(val) => {
                        // Only allow numbers
                        const numericVal = val.replace(/[^0-9]/g, '');
                        setActiveDosage({ ...activeDosage, [time]: numericVal });
                      }}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        (!activeMedicine[time] || !(activeDosage[time] || '').trim()) && styles.addButtonDisabled
                      ]}
                      onPress={() => handleAddAssignment(time)}
                      disabled={!activeMedicine[time] || !(activeDosage[time] || '').trim()}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.completeButton, isLoading && styles.completeButtonDisabled]} 
              onPress={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={brandColors.gradientEnd} />
              ) : (
                <Text style={styles.completeButtonText}>Finish Setup</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerLabel: {
    fontSize: 20,
    color: brandColors.whiteMuted,
    marginBottom: 20,
  },
  timeBlock: {
    backgroundColor: brandColors.glassBackground,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.border,
    paddingBottom: 10,
  },
  timeHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: brandColors.white,
    marginLeft: 10,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignmentDosage: {
    color: brandColors.success,
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    minWidth: 50,
  },
  assignmentMedicine: {
    color: brandColors.white,
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
  },
  addForm: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  subLabel: {
    color: brandColors.whiteMuted,
    marginBottom: 10,
    fontSize: 14,
  },
  medicineSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  medicineChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  medicineChipActive: {
    backgroundColor: brandColors.white,
    borderColor: brandColors.white,
  },
  medicineChipText: {
    color: brandColors.white,
    fontWeight: '600',
  },
  medicineChipTextActive: {
    color: brandColors.gradientEnd,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dosageInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: brandColors.white,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: brandColors.success,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  addButtonText: {
    color: brandColors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  completeButton: {
    backgroundColor: brandColors.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  completeButtonText: {
    color: brandColors.gradientEnd,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
