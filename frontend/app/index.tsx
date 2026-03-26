import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import AccountTile from '../components/AccountTile';
import UserTile from '../components/UserTile';
import MedicinesTile from '../components/MedicinesTile';
import DeviceTile from '../components/DeviceTile';

export default function App() {
  return (
    <LinearGradient
      // Linear Gradient from dark grey to medium grey
      colors={['#1c1c1c', '#3a3a3a', '#545454']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <AccountTile />
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
    gap: 15, // Adds spacing between floating tiles
  },
});
