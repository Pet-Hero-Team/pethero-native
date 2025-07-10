import { supabase } from '@/supabase/supabase';
import { signInWithApple, signInWithKakao } from '@/utils/auth';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { initializeKakaoSDK } from '@react-native-kakao/core';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
    useEffect(() => {
        if (!process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY) {
            console.error('Kakao Native App Key missing');
            Alert.alert('오류', '카카오 앱 키가 설정되지 않았습니다.');
            return;
        }
        initializeKakaoSDK(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY);
    }, []);

    const handleKakaoLogin = async () => {
        try {
            await signInWithKakao();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('카카오 로그인 실패', '사용자 정보가 없습니다.');
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                Alert.alert('프로필 조회 실패', profileError.message);
                return;
            }

            router.push(profile ? '/(tabs)/(home)' : '/auth/auth-info');
        } catch (error) {
            Alert.alert('카카오 로그인 실패', (error as Error).message);
            console.error('카카오 로그인 에러:', (error as Error).message);
        }
    };

    const handleAppleLogin = async () => {
        try {
            await signInWithApple();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert('Apple 로그인 실패', '사용자 정보가 없습니다.');
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                Alert.alert('프로필 조회 실패', profileError.message);
                return;
            }

            router.push(profile ? '/(tabs)/(home)' : '/auth/auth-info');
        } catch (error) {
            Alert.alert('Apple 로그인 실패', (error as Error).message);
            console.error('Apple 로그인 에러:', (error as Error).message);
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
                    <Link href="/auth/auth-info" className="w-full py-4 bg-gray-200 rounded-xl mb-4 relative overflow-hidden">
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <MaterialIcons name="email" size={24} color="#1e1e1e" />
                        </View>
                        <Text className="text-lg font-medium text-neutral-900 text-center">
                            이메일로 계속하기
                        </Text>
                    </Link>

                    <TouchableOpacity
                        className="w-full py-4 bg-yellow-300 rounded-xl mb-4 relative overflow-hidden"
                        onPress={handleKakaoLogin}
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
                        onPress={handleAppleLogin}
                    >
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <AntDesign name="apple1" size={22} color="white" />
                        </View>
                        <Text className="text-lg font-medium text-white text-center">
                            Apple로 계속하기
                        </Text>
                    </TouchableOpacity>
                </View>
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={5}
                    style={styles.button}
                    onPress={handleAppleLogin}
                />
                <View className="mt-4 flex-row items-center justify-center">
                    <Text className="text-sm text-neutral-500 px-4">계정찾기</Text>
                    <View className="w-px h-4 bg-neutral-200" />
                    <Link href="/auth/vet-signup" asChild>
                        <Text className="text-sm text-neutral-500 px-4">수의사이신가요?</Text>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 200,
        height: 44,
    },
});