import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function DeviceTile() {
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  return (
    <Tile>
      <View style={globalStyles.tileHeader}>
        <Text style={globalStyles.titleText}>Device Info</Text>
      </View>
      <View style={styles.content}>
        <View style={globalStyles.rowSpaceBetween}>
          <Text style={globalStyles.secondaryText}>Device model:</Text>
          <Text style={globalStyles.bodyText}>Dispenser Alpha-1</Text>
        </View>
        <View style={globalStyles.rowSpaceBetween}>
          <Text style={globalStyles.secondaryText}>Status:</Text>
          <Text style={[globalStyles.bodyText, { color: brandColors.success }]}>Online (WiFi)</Text>
        </View>
      </View>
    </Tile>
  );
}

const getStyles = (brandColors: any) => StyleSheet.create({
  content: {
    marginTop: 5,
    gap: 8,
  },
});
