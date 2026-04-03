import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';
import { GlobalStyles } from '../constants/GlobalStyles';
import { Colors } from '../constants/theme';

export default function DeviceTile() {
  return (
    <Tile>
      <View style={GlobalStyles.tileHeader}>
        <Text style={GlobalStyles.titleText}>Device Info</Text>
      </View>
      <View style={styles.content}>
        <View style={GlobalStyles.rowSpaceBetween}>
          <Text style={GlobalStyles.secondaryText}>Device model:</Text>
          <Text style={GlobalStyles.bodyText}>Dispenser Alpha-1</Text>
        </View>
        <View style={GlobalStyles.rowSpaceBetween}>
          <Text style={GlobalStyles.secondaryText}>Status:</Text>
          <Text style={[GlobalStyles.bodyText, { color: Colors.brand.success }]}>Online (WiFi)</Text>
        </View>
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 5,
    gap: 8,
  },
});
