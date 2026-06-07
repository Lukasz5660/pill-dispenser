import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import TopBar from '../../../components/TopBar';
import { useGlobalStyles } from '../../../constants/GlobalStyles';
import { useTheme } from '../../../context/ThemeContext';

export default function NewUserScheduleScreen() {
  const router = useRouter();
  const { name, userId, editPayload } = useLocalSearchParams<{ name: string; userId?: string; editPayload?: string }>();
  
  const initialTimes = useMemo(() => {
    if (editPayload) {
      try {
        const payload = JSON.parse(editPayload);
        const assignmentTimes = Object.keys(payload.assignments || {});
        if (assignmentTimes.length > 0) {
          return assignmentTimes.sort();
        }
      } catch (e) {
        console.error("Failed to parse editPayload in schedule", e);
      }
    }
    return ['08:00', '14:00', '20:00'];
  }, [editPayload]);

  const [times, setTimes] = useState<string[]>(initialTimes);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());

  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const handleAddTime = () => {
    setShowPicker(true);
  };

  const handlePickerChange = (event: any, selectedDate?: Date) => {
    // If user cancelled picker or selected
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      setPickerTime(selectedDate);
      if (Platform.OS === 'android' && event.type === 'set') {
        addTimeToList(selectedDate);
      }
    }
  };

  const confirmIosTime = () => {
    setShowPicker(false);
    addTimeToList(pickerTime);
  };

  const addTimeToList = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    if (!times.includes(formattedTime)) {
      setTimes([...times, formattedTime].sort());
    }
  };

  const removeTime = (timeToRemove: string) => {
    setTimes(times.filter(t => t !== timeToRemove));
  };

  const handleComplete = () => {
    router.push({
      pathname: '/user/new/select-medicines',
      params: { 
        name: name || '', 
        times: JSON.stringify(times),
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
        <TopBar title={userId ? `Edit Schedule for ${name}` : `Schedule for ${name || 'User'}`} />
        
        <View style={styles.content}>
          <Text style={styles.label}>When should pills be taken?</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {times.map((time, index) => (
              <View key={index} style={styles.timeRow}>
                <Text style={styles.timeText}>{time}</Text>
                <TouchableOpacity onPress={() => removeTime(time)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color={brandColors.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddTime}>
              <Ionicons name="add-circle-outline" size={24} color={brandColors.white} />
              <Text style={styles.addText}>Add Time</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
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
                <TouchableOpacity onPress={confirmIosTime}>
                  <Text style={styles.pickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
            )}
            <DateTimePicker
              value={pickerTime}
              mode="time"
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: brandColors.glassBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: brandColors.border,
  },
  timeText: {
    color: brandColors.white,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brandColors.whiteHalf,
    borderStyle: 'dashed',
    marginTop: 10,
    gap: 8,
  },
  addText: {
    color: brandColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: brandColors.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
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
