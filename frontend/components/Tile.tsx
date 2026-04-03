import React from 'react';
import { View, ViewProps } from 'react-native';
import { GlobalStyles } from '../constants/GlobalStyles';

interface TileProps extends ViewProps {
  children: React.ReactNode;
}

export default function Tile({ children, style, ...rest }: TileProps) {
  return (
    <View style={[GlobalStyles.tile, style]} {...rest}>
      {children}
    </View>
  );
}
