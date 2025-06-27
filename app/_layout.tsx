import { StreamVideo } from '@stream-io/video-react-native-sdk';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { OverlayProvider } from 'stream-chat-expo';
import { AuthProvider, useAuth } from '../context/AuthContext';
import '../global.css';

const STREAM_KEY = process.env.EXPO_PUBLIC_STREAM_ACCESS_KEY;

const InitialLayout = () => {
  const { authState, initialized, client } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(inside)';

    if (authState?.authenticated && !inAuthGroup) {
      router.replace('/(inside)');
    } else if (!authState?.authenticated) {
      client?.disconnectUser();
      router.replace('/');
    }
  }, [initialized, authState, client]);

  return (
    <>
      {!client && (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      )}
      {client && (
        <StreamVideo client={client}>
          <OverlayProvider>
            <Slot />
            <Toast />
          </OverlayProvider>
        </StreamVideo>
      )}
    </>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <InitialLayout />
      </GestureHandlerRootView>
    </AuthProvider>
  );
}