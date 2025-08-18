import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';

const { width: screenWidth } = Dimensions.get('window');

interface FormData {
    full_name: string;
    license_number: string;
    phone: string;
    otp: string;
}

export default function VetSignUpScreen() {
    const { control, handleSubmit, formState: { errors }, trigger, getValues, resetField } = useForm<FormData>({
        defaultValues: {
            full_name: '',
            license_number: '',
            phone: '',
            otp: '',
        },
        mode: 'onChange',
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [isNameFocused, setIsNameFocused] = useState(false);
    const [isLicenseFocused, setIsLicenseFocused] = useState(false);
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);

    const steps = [
        { name: 'full_name', label: '이름' },
        { name: 'license_number', label: '면허번호' },
        { name: 'phone', label: '핸드폰 번호' },
        { name: 'otp', label: 'OTP 인증' },
    ];

    const formatPhoneNumberForSupabase = (phone: string) => {
        if (phone.startsWith('010')) {
            return `+82${phone.substring(1)}`;
        }
        return phone;
    };

    const sendOtp = async () => {
        const phone = getValues('phone');
        const fullName = getValues('full_name');
        if (!phone || !fullName) return;

        const formattedPhone = formatPhoneNumberForSupabase(phone);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });
            if (error) throw error;
            setCurrentStep(3);
            Alert.alert('OTP 전송', '핸드폰으로 인증 코드를 전송했습니다.');
        } catch (error) {
            console.error('Send OTP Error:', error);
            Alert.alert('오류', (error as Error).message);
        }
    };

    const resendOtp = async () => {
        setIsResending(true);
        resetField('otp');
        await sendOtp();
        setIsResending(false);
    };

    const verifyOtp = async (otp: string) => {
        if (otp.length !== 6) return;

        const phone = getValues('phone');
        const formattedPhone = formatPhoneNumberForSupabase(phone);

        try {
            const { data: { session }, error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
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
            let isConversion = false;
            if (profile.user_role === 'user') {
                isConversion = true;
            }

            const { error: signupError } = await supabase.rpc('handle_vet_signup', {
                p_user_id: user.id,
                p_full_name: getValues('full_name'),
                p_license_number: getValues('license_number'),
                p_hospital_id: null,
                p_hospital_name: null,
                p_business_registration_number: null,
            });
            if (signupError) throw signupError;

            resetField('full_name');
            resetField('license_number');
            resetField('phone');
            resetField('otp');
            if (isConversion) {
                Alert.alert('성공', '성공적으로 수의사로 전환되었습니다');
            }
            router.replace('/auth/vet-info');
        } catch (error) {
            console.error('Verify OTP Error:', JSON.stringify(error, null, 2));
            Alert.alert('오류', `회원가입 실패: ${(error as Error).message}`);
            resetField('otp');
        }
    };

    const handleNext = async () => {
        const isValid = await trigger(steps[currentStep].name as keyof FormData);
        if (isValid) {
            if (currentStep === 2) {
                sendOtp();
            } else {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        resetField(steps[currentStep].name as keyof FormData);
        setCurrentStep(currentStep - 1);
    };

    const isNextDisabled = () => {
        const currentStepName = steps[currentStep].name as keyof FormData;
        return !getValues(currentStepName);
    };

    const renderProgressBar = () => {
        const progress = ((currentStep + 1) / steps.length) * 100;
        return (
            <View className="w-full h-2 bg-gray-200 rounded-full mt-4 mb-6">
                <View className="h-2 bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
        );
    };

    const styles = useMemo(() => {
        const containerPadding = 48;
        const otpInputMargin = 20;
        const gapBetweenPins = 8;
        const numberOfPins = 6;

        const availableWidth = screenWidth - containerPadding - otpInputMargin;
        const pinCodeWidth = (availableWidth - (gapBetweenPins * (numberOfPins - 1))) / numberOfPins;
        const pinCodeHeight = pinCodeWidth * 1.2;

        const finalPinCodeWidth = Math.min(pinCodeWidth, 52);
        const finalPinCodeHeight = Math.min(pinCodeHeight, 64);

        return StyleSheet.create({
            otpContainer: { marginHorizontal: otpInputMargin / 2, marginBottom: 20 },
            pinCodeContainer: { width: finalPinCodeWidth, height: finalPinCodeHeight, borderBottomWidth: 2, borderColor: '#E5E7EB' },
            pinCodeText: { fontSize: 24, color: '#000000' },
            focusStick: { width: 2, height: '60%', backgroundColor: '#3B82F6' },
            focusedPinCodeContainer: { borderColor: '#9CA3AF' },
        });
    }, []);

    const renderStep = () => {
        switch (steps[currentStep].name) {
            case 'full_name':
                return (
                    <View key="full_name">
                        <Text className="text-2xl font-semibold">이름을 입력해주세요</Text>
                        <Text className="mt-3 mb-8 text-gray-600">실명을 입력해주세요.</Text>
                        <Controller
                            control={control}
                            name="full_name"
                            rules={{ required: '이름을 입력해주세요.', maxLength: { value: 50, message: '이름은 50자 이내로 입력해주세요.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => { onChange(text); trigger('full_name'); }}
                                    onFocus={() => setIsNameFocused(true)}
                                    onBlur={() => setIsNameFocused(false)}
                                    placeholder="이름"
                                    className={`bg-white pb-5 text-xl border-b ${isNameFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    maxLength={50}
                                />
                            )}
                        />
                        <View className="flex-row items-center mt-2 justify-end">
                            <Text className="text-right text-sm text-gray-500">{(getValues('full_name') || '').length}/50</Text>
                        </View>
                        {errors.full_name && <Text className="text-red-500 mt-2">{errors.full_name.message}</Text>}
                    </View>
                );
            case 'license_number':
                return (
                    <View key="license_number">
                        <Text className="text-2xl font-semibold">면허번호를 입력해주세요</Text>
                        <Text className="mt-3 mb-8 text-gray-600">수의사 면허번호를 입력해주세요.</Text>
                        <Controller
                            control={control}
                            name="license_number"
                            rules={{ required: '면허번호를 입력해주세요.', maxLength: { value: 20, message: '면허번호는 20자 이내로 입력해주세요.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => { onChange(text); trigger('license_number'); }}
                                    onFocus={() => setIsLicenseFocused(true)}
                                    onBlur={() => setIsLicenseFocused(false)}
                                    placeholder="면허번호"
                                    className={`bg-white pb-5 text-xl border-b ${isLicenseFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    maxLength={20}
                                />
                            )}
                        />
                        <View className="flex-row items-center mt-2 justify-end">
                            <Text className="text-right text-sm text-gray-500">{(getValues('license_number') || '').length}/20</Text>
                        </View>
                        {errors.license_number && <Text className="text-red-500 mt-2">{errors.license_number.message}</Text>}
                    </View>
                );
            case 'phone':
                return (
                    <View key="phone">
                        <Text className="text-2xl font-semibold">핸드폰 번호를 입력해주세요</Text>
                        <Text className="mt-3 mb-8 text-gray-600">'-'를 제외하고 핸드폰 번호 11자리를 입력해주세요.</Text>
                        <Controller
                            control={control}
                            name="phone"
                            rules={{ required: '핸드폰 번호를 입력해주세요.', pattern: { value: /^010\d{8}$/, message: '올바른 핸드폰 번호 형식(010XXXXXXXX)이 아닙니다.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => { onChange(text); trigger('phone'); }}
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
                    </View>
                );
            case 'otp':
                return (
                    <View key="otp">
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
                                    onFilled={(text) => verifyOtp(text)}
                                    theme={{ ...styles }}
                                />
                            )}
                        />
                        {errors.otp && <Text className="text-red-500 mt-2">{errors.otp.message}</Text>}
                        <TouchableOpacity onPress={resendOtp} disabled={isResending}>
                            <Text className={`text-blue-500 mt-8 text-center ${isResending ? 'opacity-50' : ''}`}>
                                {isResending ? '재전송 중...' : '메시지가 오지 않습니까? 재전송'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
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
                    {renderProgressBar()}
                    <Text className="text-xl font-bold mb-4 text-gray-400">
                        <Text className="text-gray-800">{currentStep + 1}</Text> / {steps.length}
                    </Text>
                    {renderStep()}
                </View>
                {currentStep < steps.length - 1 && (
                    <View className="px-6 pb-8 bg-white">
                        <View className="flex-row">
                            {currentStep > 0 && (
                                <TouchableOpacity className="bg-gray-100 py-4 rounded-xl flex-[2] mr-2" onPress={handlePrevious}>
                                    <Text className="text-black font-semibold text-center">이전</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                className={`py-4 rounded-xl flex-[8] ${isNextDisabled() ? 'bg-gray-300' : 'bg-blue-500'}`}
                                onPress={handleNext}
                                disabled={isNextDisabled()}
                            >
                                <Text className="text-white font-semibold text-center">다음</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}