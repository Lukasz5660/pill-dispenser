import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Tile from './Tile';
import { GlobalStyles } from '../constants/GlobalStyles';
import { Colors } from '../constants/theme';

const mockUsers = [
  { id: '1', name: 'Mom (Active)', initial: 'M', isActive: true },
  { id: '2', name: 'Dad', initial: 'D', isActive: false },
  { id: '3', name: 'Grandma', initial: 'G', isActive: false },
];

export default function UserTile() {
  const router = useRouter();

  return (
    <Tile>
      <View style={GlobalStyles.tileHeader}>
        <Text style={GlobalStyles.titleText}>Users</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.content}>
        {mockUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() => router.push(`/user/${user.id}` as any)}
            style={[
              styles.userAvatar,
            ]}
          >
            <Text style={styles.userInitial}>{user.initial}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.userAvatar, styles.addUserAvatar]}>
          <Text style={styles.addUserText}>+</Text>
        </TouchableOpacity>
      </ScrollView>
    </Tile>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 5,
    flexDirection: 'row',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.brand.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitial: {
    color: Colors.brand.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  addUserAvatar: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.brand.whiteHalf,
    borderStyle: 'dashed',
  },
  addUserText: {
    color: Colors.brand.whiteMuted,
    fontSize: 24,
  },
});
