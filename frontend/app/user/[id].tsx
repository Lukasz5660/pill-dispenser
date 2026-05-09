import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';

import ScheduleTimelineTile from '../../components/ScheduleTimelineTile';
import ScheduleListTile from '../../components/ScheduleListTile';
import TopBar from '../../components/TopBar';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../constants/config';

export default function UserSchedule() {
  const { id } = useLocalSearchParams();
  const { brandColors } = useTheme();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`);
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id]);

  if (loading || !userData) {
    return (
      <LinearGradient
        colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
        style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color={brandColors.white} />
      </LinearGradient>
    );
  }

  const scheduledTimes = userData.schedule.map((data: any) => data.time);

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <TopBar title={userData.user.name} />

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            <ScheduleTimelineTile scheduledTimes={scheduledTimes} />
            <ScheduleListTile scheduleData={userData.schedule} />
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
    paddingTop: 20,
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
});
