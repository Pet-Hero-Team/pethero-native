import { initializeKakaoSDK } from '@react-native-kakao/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { supabase } from '@/supabase/supabase';
import { toastConfig } from '@/utils/toast';

import '../global.css';

const queryClient = new QueryClient();

function AuthStatusManager() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking initial session');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Get session error:', error);
          setSession(null);
        } else {
          setSession(session);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      handleRouting();
    }
  }, [session, isLoading]);

  const handleRouting = async () => {
    const inAuthGroup = segments[0] === 'auth';

    if (!session && !isLoading) {
      if (!inAuthGroup) {
        router.replace('/auth');
      }
    } else if (session) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, user_role, has_pet')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
          router.replace('/auth');
          return;
        }

        if (!profile) {
          console.log('Session but no profile, redirecting to auth-info');
          if (!inAuthGroup || segments[1] !== 'auth-info') {
            router.replace('/auth/auth-info');
          }
        } else {
          console.log('Profile exists. has_pet:', profile.has_pet);
          if (profile.user_role === 'vet') {
            if (inAuthGroup) {
              router.replace('/(tabs)');
            }
          } else {
            // 수정된 부분: has_pet이 null이 아닐 때 (true 또는 false) 메인으로 이동
            if (profile.has_pet !== null) {
              if (inAuthGroup) {
                router.replace('/(tabs)');
              }
            } else {
              if (!inAuthGroup || segments[1] !== 'auth-info') {
                router.replace('/auth/auth-info');
              }
            }
          }
        }
      } catch (error) {
        console.error('Routing logic error:', error);
        router.replace('/auth');
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-lg text-gray-600">로딩 중...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} initialRouteName="auth" />;
}

export default function RootLayout() {
  const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY || 'c174f8b739a3950a1340c1e45f041b26';

  useEffect(() => {
    console.log('Initializing Kakao SDK with key:', kakaoNativeAppKey);
    initializeKakaoSDK(kakaoNativeAppKey);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <AuthStatusManager />
          <Toast config={toastConfig} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}