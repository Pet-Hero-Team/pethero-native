// app/(tabs)/home/pets/[id]/add-record.tsx

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const fetchHospitals = async () => {
    const { data, error } = await supabase.from('hospitals').select('id, name');
    if (error) throw new Error(error.message);
    return data;
};

const fetchDiseaseCategories = async (animalType: string) => {
    const { data, error } = await supabase
        .from('disease_categories')
        .select('id, name')
        .or(`animal_type.eq.${animalType},animal_type.eq.common`);
    if (error) throw new Error(error.message);
    return data;
};

export default function AddHealthRecordScreen() {
    const { user } = useAuth();
    const { id: petId, animalType } = useLocalSearchParams() as { id: string, animalType: string };
    const queryClient = useQueryClient();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        mode: 'onChange',
        defaultValues: {
            hospital_id: null,
            diagnosis_date: new Date(),
            disease_category_id: null,
            doctor_opinion: '',
        }
    });

    const { data: hospitals, isLoading: isLoadingHospitals } = useQuery({
        queryKey: ['hospitals'],
        queryFn: fetchHospitals,
    });

    const { data: diseaseCategories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['diseaseCategories', animalType],
        queryFn: () => fetchDiseaseCategories(animalType),
        enabled: !!animalType,
    });

    const addRecordMutation = useMutation({
        mutationFn: async (formData: any) => {
            if (!user || !petId) throw new Error("사용자 또는 반려동물 정보가 없습니다.");

            const { error } = await supabase.from('health_records').insert({
                pet_id: petId,
                user_id: user.id,
                hospital_id: formData.hospital_id,
                diagnosis_date: formData.diagnosis_date.toISOString().split('T')[0],
                disease_category_id: formData.disease_category_id,
                doctor_opinion: formData.doctor_opinion,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            Toast.show({ type: 'success', text1: '진료기록이 추가되었습니다.' });
            queryClient.invalidateQueries({ queryKey: ['myPetData', user?.id] });

            // ⭐️⭐️⭐️ Edge Function이 알아들을 수 있는 올바른 데이터 구조로 수정 ⭐️⭐️⭐️
            supabase.functions.invoke('getPetAiReport', {
                body: {
                    record: { // Edge Function이 예상하는 'record' 객체로 감싸서 보냅니다.
                        pet_id: petId,
                        user_id: user.id
                    }
                }
            })
                .then(({ error }) => {
                    if (error) {
                        console.error("AI report trigger failed:", error);
                        Toast.show({ type: 'error', text1: 'AI 리포트 업데이트 요청에 실패했습니다.' });
                    } else {
                        console.log("AI report generation triggered successfully.");
                    }
                });

            router.back();
        },
        onError: (error) => {
            console.error("Add record error:", error);
            Toast.show({ type: 'error', text1: '기록 추가 실패', text2: error.message });
        }
    });

    const onSubmit = (data) => {
        addRecordMutation.mutate(data);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </Pressable>
                    <Text className="text-lg font-semibold">진료기록 추가</Text>
                    <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={!isValid || addRecordMutation.isPending}>
                        <Text className={`text-lg font-bold ${!isValid || addRecordMutation.isPending ? 'text-gray-400' : 'text-orange-500'}`}>저장</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="p-6" keyboardShouldPersistTaps="handled">
                    <Text className="text-base font-semibold text-neutral-600 mb-2">진료 병원</Text>
                    <Controller
                        control={control}
                        name="hospital_id"
                        render={({ field: { onChange, value } }) => (
                            <View>
                                {isLoadingHospitals ? <ActivityIndicator /> : (
                                    hospitals?.map(hospital => (
                                        <TouchableOpacity key={hospital.id} onPress={() => onChange(hospital.id)} className={`p-4 border rounded-lg mb-2 ${value === hospital.id ? 'bg-orange-50 border-orange-500' : 'border-gray-200'}`}>
                                            <Text className={`${value === hospital.id ? 'font-bold text-orange-600' : 'text-neutral-800'}`}>{hospital.name}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </View>
                        )}
                    />

                    <Text className="text-base font-semibold text-neutral-600 mt-6 mb-2">진단일</Text>
                    <Controller
                        control={control}
                        name="diagnosis_date"
                        rules={{ required: true }}
                        render={({ field: { value, onChange } }) => (
                            <>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} className="p-4 border border-gray-200 rounded-lg">
                                    <Text className="text-lg">{value.toLocaleDateString('ko-KR')}</Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <RNDateTimePicker
                                        value={value}
                                        mode="date"
                                        display="spinner"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            onChange(selectedDate || value);
                                        }}
                                        locale="ko-KR"
                                    />
                                )}
                            </>
                        )}
                    />

                    <Text className="text-base font-semibold text-neutral-600 mt-6 mb-2">병명 (카테고리)</Text>
                    <Controller
                        control={control}
                        name="disease_category_id"
                        rules={{ required: '병명을 선택해주세요.' }}
                        render={({ field: { onChange, value } }) => (
                            <View>
                                {isLoadingCategories ? <ActivityIndicator /> : (
                                    diseaseCategories?.map(category => (
                                        <TouchableOpacity key={category.id} onPress={() => onChange(category.id)} className={`p-4 border rounded-lg mb-2 ${value === category.id ? 'bg-orange-50 border-orange-500' : 'border-gray-200'}`}>
                                            <Text className={`${value === category.id ? 'font-bold text-orange-600' : 'text-neutral-800'}`}>{category.name}</Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                                {errors.disease_category_id && <Text className="text-red-500 mt-1">{errors.disease_category_id.message}</Text>}
                            </View>
                        )}
                    />

                    <Text className="text-base font-semibold text-neutral-600 mt-6 mb-2">의사 소견 (선택)</Text>
                    <Controller
                        control={control}
                        name="doctor_opinion"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                className="p-4 border border-gray-200 rounded-lg h-32 text-base"
                                multiline
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="진단서에 적힌 수의사의 소견을 입력해주세요."
                                style={{ textAlignVertical: 'top' }}
                            />
                        )}
                    />

                    <View className="h-40" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}