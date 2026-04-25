import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useGlobalStyles } from '../../constants/GlobalStyles';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountScreen() {
  const { theme, toggleTheme, brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const router = useRouter();

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={brandColors.white} />
          </TouchableOpacity>
          <Text style={globalStyles.titleText}>Account Options</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[globalStyles.tile, styles.contentTile]}>
          <View style={globalStyles.rowSpaceBetween}>
            <View style={globalStyles.rowCenter}>
              <Ionicons 
                name={theme === 'dark' ? "moon" : "sunny"} 
                size={24} 
                color={brandColors.white} 
                style={{ marginRight: 10 }}
              />
              <Text style={globalStyles.bodyText}>Enable Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: brandColors.success }}
              thumbColor={brandColors.white}
            />
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  contentTile: {
    marginHorizontal: 15,
    marginTop: 20,
  }
});
