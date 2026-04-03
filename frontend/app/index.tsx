import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import UserTile from '../components/UserTile';
import MedicinesTile from '../components/MedicinesTile';
import DeviceTile from '../components/DeviceTile';
import { Colors } from '../constants/theme';
import { GlobalStyles } from '../constants/GlobalStyles';

export default function App() {
  return (
    <LinearGradient
      // Linear Gradient from dark grey to medium grey
      colors={[Colors.brand.gradientStart, Colors.brand.gradientMiddle, Colors.brand.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <View style={[GlobalStyles.rowSpaceBetween, styles.topBar]}>
          <Text style={styles.appName}>AKESO</Text>
          <Ionicons name="person-circle-outline" size={36} color={Colors.brand.white} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <UserTile />
            <MedicinesTile />
            <DeviceTile />
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
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.brand.white,
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
