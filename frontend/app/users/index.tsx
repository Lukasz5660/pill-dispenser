import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import Tile from '../../components/Tile';
import { useGlobalStyles } from '../../constants/GlobalStyles';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL, ACCOUNT_ID } from '../../constants/config';

export default function UsersList() {
  const router = useRouter();
  const { brandColors, theme } = useTheme();
  const globalStyles = useGlobalStyles();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users?account_id=${ACCOUNT_ID}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userName}? This will remove all their schedules and logs.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                fetchUsers();
              } else {
                console.error("Failed to delete user");
              }
            } catch (error) {
              console.error("Error deleting user:", error);
            }
          }
        }
      ]
    );
  };

  if (loading && users.length === 0) {
    return (
      <LinearGradient
        colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
        style={[styles.container, styles.centerContent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ActivityIndicator size="large" color={brandColors.white} />
        <Text style={{color: brandColors.white, marginTop: 10}}>Loading users...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[brandColors.gradientStart, brandColors.gradientMiddle, brandColors.gradientEnd]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />

        <View style={[globalStyles.rowSpaceBetween, styles.topBar]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={brandColors.white} />
          </TouchableOpacity>
          <Text style={[styles.appName, { color: brandColors.white }]}>Users</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {users.map(user => (
              <Tile key={user.id}>
                <TouchableOpacity 
                  style={globalStyles.rowSpaceBetween} 
                  onPress={() => router.push(`/user/${user.id}` as any)}
                >
                  <View style={globalStyles.rowCenter}>
                    <View style={[styles.userAvatar, { backgroundColor: brandColors.border }]}>
                      <Text style={[styles.userInitial, { color: brandColors.white }]}>{user.initial}</Text>
                    </View>
                    <Text style={[globalStyles.titleText, { marginLeft: 15 }]}>{user.name}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteUser(user.id, user.name)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color={brandColors.danger || '#ff4444'} />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Tile>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    gap: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 10,
  }
});
