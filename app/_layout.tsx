// RootLayout.tsx
import { toastConfig } from '@/utils/toast';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import '../global.css';


export default function RootLayout() {
  const kakaoNativeAppKey = process.env.EXPO_PUBLIC_NATIVE_APP_KEY || 'c174f8b739a3950a1340c1e45f041b26';

  useEffect(() => {
    initializeKakaoSDK(kakaoNativeAppKey);
  }, []);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(independent)" options={{ headerShown: false }} />
            <Stack.Screen name="analysis/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="manager/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="products" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <Toast config={toastConfig} />
    </>
  );
}