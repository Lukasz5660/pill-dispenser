import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GlobalStyles } from '../constants/GlobalStyles';
import { Colors } from '../constants/theme';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const router = useRouter();

  return (
    <View style={[GlobalStyles.rowSpaceBetween, styles.topBar]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.brand.white} />
      </TouchableOpacity>
      <Text style={[GlobalStyles.titleText, styles.title]}>{title}</Text>
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
