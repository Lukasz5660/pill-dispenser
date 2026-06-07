import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Tile from './Tile';
import { useGlobalStyles } from '../constants/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

export default function UserTile({ users = [] }: { users?: any[] }) {
  const router = useRouter();
  const { brandColors } = useTheme();
  const globalStyles = useGlobalStyles();
  const styles = useMemo(() => getStyles(brandColors), [brandColors]);

  return (
    <Tile>
      <Link href="/users" asChild>
        <TouchableOpacity style={globalStyles.tileHeader}>
          <Text style={globalStyles.titleText}>Users</Text>
          <Ionicons name="chevron-forward" size={20} color={brandColors.white} />
        </TouchableOpacity>
      </Link>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.content}>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() => router.push(`/user/${user.id}` as any)}
            style={styles.userAvatar}
          >
            <Text style={styles.userInitial}>{user.initial}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.userAvatar, styles.addUserAvatar]}
          onPress={() => router.push('/user/new/name')}
        >
          <Text style={styles.addUserText}>+</Text>
        </TouchableOpacity>
      </ScrollView>
    </Tile>
  );
}

const getStyles = (brandColors: any) => StyleSheet.create({
  content: {
    marginTop: 5,
    flexDirection: 'row',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: brandColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitial: {
    color: brandColors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addUserAvatar: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: brandColors.whiteHalf,
    borderStyle: 'dashed',
  },
  addUserText: {
    color: brandColors.whiteMuted,
    fontSize: 24,
  },
});
