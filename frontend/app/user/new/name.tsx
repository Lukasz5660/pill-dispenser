import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '../../../components/TopBar';
import { Colors } from '../../../constants/theme';
import { GlobalStyles } from '../../../constants/GlobalStyles';

export default function NewUserNameScreen() {
  const router = useRouter();
  const [name, setName] = useState('');

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
      colors={[Colors.brand.gradientStart, Colors.brand.gradientMiddle, Colors.brand.gradientEnd]}
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
              placeholderTextColor={Colors.brand.whiteMuted}
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

const styles = StyleSheet.create({
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
    color: Colors.brand.white,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.brand.glassBackground,
    borderWidth: 1,
    borderColor: Colors.brand.border,
    borderRadius: 15,
    padding: 18,
    color: Colors.brand.white,
    fontSize: 18,
  },
  nextButton: {
    backgroundColor: Colors.brand.white,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: Colors.brand.gradientEnd,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
