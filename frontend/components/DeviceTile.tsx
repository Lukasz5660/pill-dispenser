import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Tile from './Tile';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function DeviceTile({ device }: { device?: any }) {
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  let onlineStatusText = "Unknown";
  let onlineStatusColor = brandColors.error;

  if (device && device.last_heartbeat) {
    const lastHeartbeatTime = new Date(device.last_heartbeat).getTime();
    const currentTime = new Date().getTime();
    const diffMinutes = (currentTime - lastHeartbeatTime) / 1000 / 60;
    
    if (diffMinutes <= 5) {
      onlineStatusText = "Online (WiFi)";
      onlineStatusColor = brandColors.success;
    } else {
      onlineStatusText = "Offline";
      onlineStatusColor = brandColors.error;
    }
  }

  return (
    <Tile>
      <View style={globalStyles.tileHeader}>
        <Text style={globalStyles.titleText}>Device Info</Text>
      </View>
      <View style={styles.content}>
        <View style={globalStyles.rowSpaceBetween}>
          <Text style={globalStyles.secondaryText}>Device model:</Text>
          <Text style={globalStyles.bodyText}>{device?.model || "Unknown"}</Text>
        </View>
        <View style={globalStyles.rowSpaceBetween}>
          <Text style={globalStyles.secondaryText}>Status:</Text>
          <Text style={[globalStyles.bodyText, { color: onlineStatusColor }]}>{onlineStatusText}</Text>
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
