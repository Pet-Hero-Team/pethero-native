import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

interface FormData {
    phone: string;
    otp: string;
}

export default function VetSignInScreen() {
    const { control, handleSubmit, formState: { errors }, trigger, getValues, resetField } = useForm<FormData>({
        defaultValues: {
            phone: '',
            otp: '',
        },
        mode: 'onChange',
    });

    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatPhoneNumberForSupabase = (phone: string) => {
        if (phone.startsWith('010')) {
            return `+82${phone.substring(1)}`;
        }
        return phone;
    };

    const sendOtp = async () => {
        const phone = getValues('phone');
        if (!phone) {
            Alert.alert('오류', '핸드폰 번호를 입력해주세요.');
            return;
        }

        const formattedPhone = formatPhoneNumberForSupabase(phone);
        console.log('Sending OTP to:', formattedPhone);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });
            if (error) throw error;

            setIsOtpSent(true);
            Alert.alert('OTP 전송', '핸드폰으로 인증 코드를 전송했습니다.');
        } catch (error) {
            console.error('Send OTP Error:', JSON.stringify(error, null, 2));
            Alert.alert('오류', (error as Error).message);
        }
    };

    const onSubmit = async (data: FormData) => {
        if (data.otp.length !== 6) {
            Alert.alert('오류이', '6자리 OTP 코드를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        const formattedPhone = formatPhoneNumberForSupabase(data.phone);

        try {
            const { data: { session }, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: data.otp,
                type: 'sms',
            });
            if (error || !session) throw error || new Error('인증 실패');

            await supabase.auth.refreshSession();
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw userError || new Error('사용자 인증 실패');

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('user_role')
                .eq('id', user.id)
                .single();
            if (profileError || !profile) throw profileError || new Error('프로필 조회 실패');
            if (profile.user_role !== 'vet') {
                await supabase.auth.signOut();
                throw new Error('일반유저는 수의사로 로그인할 수 없습니다. 수의사이시라면 같은 번호로 수의사 회원가입을 진행한 후 로그인을 진행해주세요');
            }

            resetField('phone');
            resetField('otp');
            setIsOtpSent(false);
            router.push('/(tabs)/(home)');
        } catch (error) {
            console.error('Sign-in Error:', JSON.stringify(error, null, 2));
            Alert.alert('오류', (error as Error).message);
            resetField('otp');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 px-6">
                    <View className="flex-row justify-end mt-4">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color="#51555c" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-semibold mt-4">수의사 로그인</Text>
                    <Text className="mt-3 mb-8 text-gray-600">핸드폰 번호로 로그인해주세요.</Text>
                    {!isOtpSent ? (
                        <View>
                            <Controller
                                control={control}
                                name="phone"
                                rules={{ required: '핸드폰 번호를 입력해주세요.', pattern: { value: /^010\d{8}$/, message: '올바른 핸드폰 번호 형식(010XXXXXXXX)이 아닙니다.' } }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);
                                            trigger('phone');
                                        }}
                                        onFocus={() => setIsPhoneFocused(true)}
                                        onBlur={() => setIsPhoneFocused(false)}
                                        placeholder="01012345678"
                                        keyboardType="number-pad"
                                        maxLength={11}
                                        className={`bg-white pb-5 text-xl border-b ${isPhoneFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    />
                                )}
                            />
                            {errors.phone && <Text className="text-red-500 mt-2">{errors.phone.message}</Text>}
                            <TouchableOpacity
                                className={`mt-8 py-4 rounded-xl ${getValues('phone') ? 'bg-blue-500' : 'bg-gray-300'}`}
                                onPress={sendOtp}
                                disabled={!getValues('phone')}
                            >
                                <Text className="text-white font-semibold text-center">OTP 전송</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <Text className="text-2xl font-semibold">인증번호를 입력해주세요</Text>
                            <Text className="mt-3 mb-8 text-gray-600">핸드폰으로 전송된 6자리 번호를 입력해주세요.</Text>
                            <Controller
                                control={control}
                                name="otp"
                                rules={{ required: 'OTP를 입력해주세요.', minLength: { value: 6, message: '6자리 코드를 입력해주세요.' } }}
                                render={({ field: { onChange } }) => (
                                    <OtpInput
                                        numberOfDigits={6}
                                        onTextChange={onChange}
                                        onFilled={(text) => handleSubmit(onSubmit)({ otp: text, phone: getValues('phone') })}
                                        theme={{
                                            containerStyle: { marginHorizontal: 20, marginBottom: 20 },
                                            pinCodeContainerStyle: { width: 52, height: 64, borderBottomWidth: 2, borderColor: '#E5E7EB' },
                                            pinCodeTextStyle: { fontSize: 24, color: '#000000' },
                                            focusStickStyle: { width: 2, height: '60%', backgroundColor: '#3B82F6' },
                                            focusedPinCodeContainerStyle: { borderColor: '#9CA3AF' },
                                        }}
                                    />
                                )}
                            />
                            {errors.otp && <Text className="text-red-500 mt-2">{errors.otp.message}</Text>}
                            <TouchableOpacity
                                className={`mt-8 py-4 rounded-xl ${getValues('otp')?.length === 6 ? 'bg-blue-500' : 'bg-gray-300'}`}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isSubmitting || getValues('otp')?.length !== 6}
                            >
                                <Text className="text-white font-semibold text-center">{isSubmitting ? '로그인 중...' : '로그인'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}