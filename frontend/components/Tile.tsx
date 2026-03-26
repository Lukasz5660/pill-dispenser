import React from 'react';
import { View, StyleSheet, ViewProps, Platform } from 'react-native';

interface TileProps extends ViewProps {
  children: React.ReactNode;
}

export default function Tile({ children, style, ...rest }: TileProps) {
  return (
    <View style={[styles.tile, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light semi-transparent for glass effect on grey gradient
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      },
    }),
  },
});
