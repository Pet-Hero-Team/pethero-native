import { supabase } from '@/supabase/supabase';
import { signInWithApple, signInWithKakao } from '@/utils/auth';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
    useEffect(() => {
        if (!process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY) {
            Alert.alert('오류', '카카오 앱 키가 설정되지 않았습니다.');
            return;
        }
        initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY);
    }, []);

    const handleSocialLogin = async (loginFn: () => Promise<void>) => {
        try {
            await loginFn();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('사용자 정보가 없습니다.');

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, has_pet')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;

            router.push(profile?.has_pet ? '/(tabs)/(home)' : '/auth/auth-info');
        } catch (error) {
            Alert.alert('로그인 실패', (error as Error).message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center">
                <Image
                    source={require('@/assets/images/6.png')}
                    className="size-44"
                    resizeMode="contain"
                />
                <View className="w-full px-10 mt-36">
                    <Link href="/auth/phone-auth" asChild>
                        <TouchableOpacity className="w-full py-4 bg-gray-200 rounded-xl mb-4 relative overflow-hidden">
                            <View className="absolute left-4 top-0 bottom-0 justify-center">
                                <MaterialIcons name="phone" size={24} color="#1e1e1e" />
                            </View>
                            <Text className="text-lg font-medium text-neutral-900 text-center">
                                전화번호로 계속하기
                            </Text>
                        </TouchableOpacity>
                    </Link>
                    <TouchableOpacity
                        className="w-full py-4 bg-yellow-300 rounded-xl mb-4 relative overflow-hidden"
                        onPress={() => handleSocialLogin(signInWithKakao)}
                    >
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <Image
                                source={require('@/assets/images/kakao.png')}
                                className="size-8"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-lg font-medium text-neutral-900 text-center">
                            카카오톡으로 계속하기
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-full py-4 bg-black rounded-xl mb-8 relative overflow-hidden"
                        onPress={() => handleSocialLogin(signInWithApple)}
                    >
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <AntDesign name="apple1" size={22} color="white" />
                        </View>
                        <Text className="text-lg font-medium text-white text-center">
                            Apple로 계속하기
                        </Text>
                    </TouchableOpacity>
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={5}
                        style={{ width: 200, height: 44 }}
                        onPress={() => handleSocialLogin(signInWithApple)}
                    />
                    <View className="mt-4 flex-row items-center justify-center">
                        <Text className="text-sm text-neutral-500 px-4">계정찾기</Text>
                        <View className="w-px h-4 bg-neutral-200" />
                        <Link href="/auth/vet-signup" asChild>
                            <Text className="text-sm text-neutral-500 px-4">수의사이신가요?</Text>
                        </Link>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}