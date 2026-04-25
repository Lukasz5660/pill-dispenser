import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '../../../components/TopBar';
import { useGlobalStyles } from '../../../constants/GlobalStyles';
import { useTheme } from '../../../context/ThemeContext';

export default function NewUserNameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  const handleNext = () => {
    if (name.trim()) {
      router.push({
        pathname: '/user/new/schedule',
        params: { name: name.trim() }
      });
    }
  };

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <TopBar title="New User" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.content}
        >
          <View style={styles.form}>
            <Text style={styles.label}>What is the user's name?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor={brandColors.whiteMuted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.nextButton, !name.trim() && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!name.trim()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const getStyles = (brandColors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  form: {
    marginTop: 40,
  },
  label: {
    fontSize: 24,
    color: brandColors.white,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: brandColors.glassBackground,
    borderWidth: 1,
    borderColor: brandColors.border,
    borderRadius: 15,
    padding: 18,
    color: brandColors.white,
    fontSize: 18,
  },
  nextButton: {
    backgroundColor: brandColors.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: brandColors.gradientEnd,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
