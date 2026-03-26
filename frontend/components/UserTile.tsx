import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Tile from './Tile';

const mockUsers = [
  { id: '1', name: 'Mom (Active)', initial: 'M', isActive: true },
  { id: '2', name: 'Dad', initial: 'D', isActive: false },
  { id: '3', name: 'Grandma', initial: 'G', isActive: false },
];

export default function UserTile() {
  const router = useRouter();

  return (
    <Tile>
      <View style={styles.header}>
        <Text style={styles.title}>Active User</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.content}>
        {mockUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() => router.push(`/user/${user.id}` as any)}
            style={[
              styles.userAvatar,
              user.isActive ? styles.activeUserAvatar : null,
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
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    marginTop: 5,
    flexDirection: 'row',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activeUserAvatar: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userInitial: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addUserAvatar: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
  },
  addUserText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 24,
  },
});
