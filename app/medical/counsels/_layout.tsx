import { Ionicons } from '@expo/vector-icons';
import { StreamVideo } from '@stream-io/video-react-native-sdk';
import { Stack } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { OverlayProvider } from 'stream-chat-expo';
import { AuthProvider, useAuth } from '../../../context/AuthContext';

const CounselsLayout = () => {
  const { client, onLogin, initialized } = useAuth();

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading authentication...</Text>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Stream client not initialized. Please log in.</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#0333C1',
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => onLogin?.('test@example.com', 'password123')}
        >
          <Ionicons name="log-in-outline" size={24} color="white" />
          <Text style={{ color: 'white', fontSize: 16, marginLeft: 10 }}>Auto Login (Test)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <StreamVideo client={client}>
      <OverlayProvider>
        <Stack >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(room)/[id]" options={{ title: 'Counsel Room', headerShown: false }} />
        </Stack>
        <Toast />
      </OverlayProvider>
    </StreamVideo>
  );
};

export default function Layout() {
  return (
    <AuthProvider>
      <CounselsLayout />
    </AuthProvider>
  );
}