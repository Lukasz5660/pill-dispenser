import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import UserTile from '../components/UserTile';
import MedicinesTile from '../components/MedicinesTile';
import DeviceTile from '../components/DeviceTile';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function App() {
  const { brandColors, theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/dashboard/1');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !dashboardData) {
    return (
      <LinearGradient
        colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
        style={[styles.container, styles.centerContent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color={brandColors.white} />
        <Text style={{color: brandColors.white, marginTop: 10}}>Loading dashboard...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
        
        <View style={[globalStyles.rowSpaceBetween, styles.topBar]}>
          <Text style={[styles.appName, { color: brandColors.white }]}>AKESO</Text>
          <Link href="/account" asChild>
            <TouchableOpacity>
              <Ionicons name="person-circle-outline" size={36} color={brandColors.white} />
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <UserTile users={dashboardData.users} />
            <MedicinesTile medicines={dashboardData.medicines} />
            <DeviceTile device={dashboardData.device} />
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    gap: 15,
  },
});
