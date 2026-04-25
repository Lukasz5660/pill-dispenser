import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const router = useRouter();
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();

  return (
    <View style={[globalStyles.rowSpaceBetween, styles.topBar]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={brandColors.white} />
      </TouchableOpacity>
      <Text style={[globalStyles.titleText, styles.title]}>{title}</Text>
      {/* Empty view for balance if we want the text to be perfectly centered */}
      <View style={{ width: 34 }} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
});
