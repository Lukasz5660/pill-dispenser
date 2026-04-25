import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

type ThemeType = 'light' | 'dark';
type BrandColorsType = typeof Colors.brandDark;

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
  brandColors: BrandColorsType;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  // Default to dark or system preference. The app originally was dark.
  const [theme, setTheme] = useState<ThemeType>('dark'); 

  useEffect(() => {
    // If we wanted to sync with system preference:
    // if (systemColorScheme) setTheme(systemColorScheme);
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const brandColors = theme === 'light' ? Colors.brandLight : Colors.brandDark;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, brandColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
