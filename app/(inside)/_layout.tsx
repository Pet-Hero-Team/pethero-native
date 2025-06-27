import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { onLogout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0333C1',
        },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Meeting Rooms',
          headerRight: () => (
            <TouchableOpacity onPress={onLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="(room)/[id]" options={{ title: 'Room' }} />
    </Stack>
  );
};

export default Layout;