import { StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const useGlobalStyles = () => {
  const { brandColors } = useTheme();

  return StyleSheet.create({
    // Layout
    row: {
      flexDirection: 'row',
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowSpaceBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    // Element Headers (used in Tile components)
    tileHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: brandColors.border,
      paddingBottom: 10,
      marginBottom: 10,
    },
    
    // Typography
    titleText: {
      fontSize: 18,
      fontWeight: '600',
      color: brandColors.white,
    },
    bodyText: {
      color: brandColors.white,
      fontSize: 16,
      fontWeight: '500',
    },
    secondaryText: {
      color: brandColors.textSecondary,
      fontSize: 14,
    },
    
    // Tile Box Style (Glassmorphism)
    tile: {
      backgroundColor: brandColors.glassBackground, // Light semi-transparent for glass effect
      borderRadius: 20,
      padding: 20,
      marginVertical: 10,
      borderWidth: 1,
      borderColor: brandColors.border,
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
};
