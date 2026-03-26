import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';

export default function DeviceTile() {
  return (
    <Tile>
      <View style={styles.header}>
        <Text style={styles.title}>Device Info</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Device Hub:</Text>
          <Text style={styles.value}>Dispenser Alpha-1</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Battery:</Text>
          <Text style={[styles.value, { color: '#4CAF50' }]}>78%</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: '#4CAF50' }]}>Online (WiFi)</Text>
        </View>
      </View>
    </Tile>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#dddddd',
    fontSize: 14,
  },
  value: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
