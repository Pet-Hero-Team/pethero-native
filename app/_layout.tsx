import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

const USER_ID = "devscarycat";
const USER_TOKEN = "test";
const client = new StreamVideoClient({
  apiKey: "test",
  user: { id: USER_ID },
  token: USER_TOKEN,
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StreamVideo client={client}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="home" options={{ headerShown: false }} />
            <Stack.Screen name="medical" options={{ headerShown: false }} />
            <Stack.Screen name="map" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </StreamVideo>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}