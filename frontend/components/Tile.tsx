import React from 'react';
import { View, ViewProps } from 'react-native';
import { useGlobalStyles } from '../constants/GlobalStyles';

interface TileProps extends ViewProps {
  children: React.ReactNode;
}

export default function Tile({ children, style, ...rest }: TileProps) {
  const globalStyles = useGlobalStyles();
  return (
    <View style={[globalStyles.tile, style]} {...rest}>
      {children}
    </View>
  );
}
