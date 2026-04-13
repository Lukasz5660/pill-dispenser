import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import TopBar from '../../../components/TopBar';
import { Colors } from '../../../constants/theme';
import { GlobalStyles } from '../../../constants/GlobalStyles';

export default function NewUserScheduleScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  
  const [times, setTimes] = useState<string[]>(['08:00', '14:00', '20:00']);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());

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
      pathname: '/user/new/medicines',
      params: { name: name || '', times: JSON.stringify(times) }
    });
  };

  return (
    <LinearGradient
      colors={[Colors.brand.gradientStart, Colors.brand.gradientMiddle, Colors.brand.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <TopBar title={"Schedule for " + (name || 'User')} />
        
        <View style={styles.content}>
          <Text style={styles.label}>When should pills be taken?</Text>

          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {times.map((time, index) => (
              <View key={index} style={styles.timeRow}>
                <Text style={styles.timeText}>{time}</Text>
                <TouchableOpacity onPress={() => removeTime(time)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color={Colors.brand.error} />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addButton} onPress={handleAddTime}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.brand.white} />
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
              textColor={Platform.OS === 'ios' ? Colors.brand.white : undefined}
            />
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 20,
    color: Colors.brand.whiteMuted,
    marginBottom: 20,
  },
  listContainer: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.glassBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.brand.border,
  },
  timeText: {
    color: Colors.brand.white,
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
    borderColor: Colors.brand.whiteHalf,
    borderStyle: 'dashed',
    marginTop: 10,
    gap: 8,
  },
  addText: {
    color: Colors.brand.white,
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.brand.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  completeButtonText: {
    color: Colors.brand.gradientEnd,
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: Colors.brand.gradientStart,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: Colors.brand.border,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.border,
  },
  pickerCancel: {
    color: Colors.brand.error,
    fontSize: 16,
  },
  pickerDone: {
    color: Colors.brand.success,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
