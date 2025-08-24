import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FormData {
    hospital_name: string;
    business_registration_number: string;
    address: string;
    phone: string;
}

export default function VetInfoCustomScreen() {
    const { control, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>({
        defaultValues: {
            hospital_name: '',
            business_registration_number: '',
            address: '',
            phone: '',
        },
        mode: 'onChange',
    });

    const [isHospitalNameFocused, setIsHospitalNameFocused] = useState(false);
    const [isBusinessRegFocused, setIsBusinessRegFocused] = useState(false);
    const [isAddressFocused, setIsAddressFocused] = useState(false);
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);

    const onSubmit = async (data: FormData) => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw userError || new Error('사용자 정보 없음');

            const { error: updateError } = await supabase.rpc('update_vet_hospital_info', {
                p_user_id: user.id,
                p_hospital_name: data.hospital_name,
                p_business_registration_number: data.business_registration_number,
                p_address: data.address,
                p_phone: data.phone,
            });

            if (updateError) throw updateError;

            Alert.alert('성공', '수의사 등록이 완료되었습니다. 관리자 승인 후 활동 가능합니다.');
            router.replace('/(tabs)/(home)');
        } catch (error) {
            console.error('Submit Error:', JSON.stringify(error, null, 2));
            Alert.alert('오류', (error as Error).message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
                    <View className="flex-row justify-end mt-4">
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color="#51555c" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-semibold mt-4">병원 정보를 입력해주세요</Text>
                    <Text className="mt-3 mb-8 text-gray-600">찾으시는 병원이 없어 직접 입력합니다.</Text>
                    <View>
                        <Controller
                            control={control}
                            name="hospital_name"
                            rules={{ required: '병원 이름을 입력해주세요.', maxLength: { value: 100, message: '병원 이름은 100자 이내로 입력해주세요.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('hospital_name');
                                    }}
                                    onFocus={() => setIsHospitalNameFocused(true)}
                                    onBlur={() => setIsHospitalNameFocused(false)}
                                    placeholder="병원 이름"
                                    className={`bg-white pb-5 text-xl border-b ${isHospitalNameFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    maxLength={100}
                                />
                            )}
                        />
                        <View className="flex-row items-center mt-2 justify-end">
                            <Text className="text-right text-sm text-gray-500">{(getValues('hospital_name') || '').length}/100</Text>
                        </View>
                        {errors.hospital_name && <Text className="text-red-500 mt-2">{errors.hospital_name.message}</Text>}
                    </View>
                    <View className="mt-4">
                        <Controller
                            control={control}
                            name="business_registration_number"
                            rules={{ required: '사업자 등록번호를 입력해주세요.', pattern: { value: /^\d{3}-\d{2}-\d{5}$/, message: '사업자 등록번호는 XXX-XX-XXXXX 형식이어야 합니다.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        const formatted = text.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3');
                                        onChange(formatted);
                                        trigger('business_registration_number');
                                    }}
                                    onFocus={() => setIsBusinessRegFocused(true)}
                                    onBlur={() => setIsBusinessRegFocused(false)}
                                    placeholder="123-45-67890"
                                    keyboardType="numeric"
                                    maxLength={12}
                                    className={`bg-white pb-5 text-xl border-b ${isBusinessRegFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                />
                            )}
                        />
                        {errors.business_registration_number && <Text className="text-red-500 mt-2">{errors.business_registration_number.message}</Text>}
                    </View>
                    {/* 새로운 입력 필드: 병원 주소 */}
                    <View className="mt-4">
                        <Controller
                            control={control}
                            name="address"
                            rules={{ required: '병원 주소를 입력해주세요.' }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('address');
                                    }}
                                    onFocus={() => setIsAddressFocused(true)}
                                    onBlur={() => setIsAddressFocused(false)}
                                    placeholder="병원 주소"
                                    className={`bg-white pb-5 text-xl border-b ${isAddressFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                />
                            )}
                        />
                        {errors.address && <Text className="text-red-500 mt-2">{errors.address.message}</Text>}
                    </View>
                    {/* 새로운 입력 필드: 대표 전화번호 */}
                    <View className="mt-4">
                        <Controller
                            control={control}
                            name="phone"
                            rules={{ required: '대표 전화번호를 입력해주세요.' }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('phone');
                                    }}
                                    onFocus={() => setIsPhoneFocused(true)}
                                    onBlur={() => setIsPhoneFocused(false)}
                                    placeholder="대표 전화번호"
                                    className={`bg-white pb-5 text-xl border-b ${isPhoneFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    keyboardType="phone-pad"
                                />
                            )}
                        />
                        {errors.phone && <Text className="text-red-500 mt-2">{errors.phone.message}</Text>}
                    </View>
                </ScrollView>
                <View className="px-6 pb-8 bg-white">
                    <TouchableOpacity
                        className={`py-4 rounded-xl ${getValues('hospital_name') && getValues('business_registration_number') && getValues('address') && getValues('phone') ? 'bg-blue-500' : 'bg-gray-300'}`}
                        onPress={handleSubmit(onSubmit)}
                        disabled={!getValues('hospital_name') || !getValues('business_registration_number') || !getValues('address') || !getValues('phone')}
                    >
                        <Text className="text-white font-semibold text-center">제출</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}