import { supabase } from '@/supabase/supabase';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PhoneAuthScreen() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        setLoading(true);
        try {
            // 전화번호 형식: 국제 전화번호 (예: +821012345678)
            const formattedPhone = phone.startsWith('+') ? phone : `+82${phone.replace(/^0/, '')}`;
            const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
            if (error) throw error;
            setIsOtpSent(true);
            Alert.alert('성공', '인증 코드가 전송되었습니다.');
        } catch (error) {
            Alert.alert('OTP 전송 실패', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const formattedPhone = phone.startsWith('+') ? phone : `+82${phone.replace(/^0/, '')}`;
            const { data: { user }, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;
            if (!user) throw new Error('사용자 정보가 없습니다.');

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, has_pet')
                .eq('id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;

            router.push(profile?.has_pet ? '/(tabs)/(home)' : '/auth/auth-info');
        } catch (error) {
            Alert.alert('OTP 인증 실패', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 justify-center">
                <Text className="text-2xl font-semibold mb-8">전화번호로 {isOtpSent ? '인증' : '계속하기'}</Text>
                <View className="mb-4">
                    <View className="flex-row items-center border-b border-gray-200 pb-2">
                        <MaterialIcons name="phone" size={24} color="#9ca3af" />
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="전화번호 (예: 01012345678)"
                            placeholderTextColor="#9ca3af"
                            className="flex-1 ml-2 text-lg"
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            editable={!isOtpSent}
                        />
                    </View>
                </View>
                {isOtpSent && (
                    <View className="mb-6">
                        <View className="flex-row items-center border-b border-gray-200 pb-2">
                            <MaterialIcons name="lock" size={24} color="#9ca3af" />
                            <TextInput
                                value={otp}
                                onChangeText={setOtp}
                                placeholder="인증 코드"
                                placeholderTextColor="#9ca3af"
                                className="flex-1 ml-2 text-lg"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                )}
                <TouchableOpacity
                    className={`py-4 rounded-xl ${loading || !phone || (isOtpSent && !otp) ? 'bg-gray-300' : 'bg-orange-500'
                        }`}
                    onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                    disabled={loading || !phone || (isOtpSent && !otp)}
                >
                    <Text className="text-white font-semibold text-center text-lg">
                        {isOtpSent ? '인증 확인' : '인증 코드 전송'}
                    </Text>
                </TouchableOpacity>
                <Link href="/auth" asChild>
                    <TouchableOpacity className="mt-4">
                        <Text className="text-center text-sm text-neutral-400 underline">
                            다른 방법으로 계속하기
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}