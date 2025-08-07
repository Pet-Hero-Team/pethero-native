import { initializeKakaoSDK } from '@react-native-kakao/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { supabase } from '@/supabase/supabase';
import { toastConfig } from '@/utils/toast';

import '../global.css';

const queryClient = new QueryClient();

// Supabase 세션 상태를 추적하는 컴포넌트
function AuthStatusManager() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // 경고 메시지를 기반으로, 라우트 구조를 'auth' 폴더로 가정합니다.
    const inAuthGroup = segments[0] === 'auth';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/auth');
    }
  }, [session, isLoading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const kakaoNativeAppKey = process.env.EXPO_PUBLIC_NATIVE_APP_KEY || 'c174f8b739a3950a1340c1e45f041b26';

  useEffect(() => {
    initializeKakaoSDK(kakaoNativeAppKey);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthStatusManager />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
