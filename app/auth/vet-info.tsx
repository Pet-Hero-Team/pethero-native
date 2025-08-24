import { supabase } from '@/supabase/supabase';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface Hospital {
    id: string;
    name: string;
}

export default function VetInfoScreen() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

    useEffect(() => {
        const fetchHospitals = async () => {
            const { data, error } = await supabase.from('hospitals').select('id, name').order('name');
            if (error) {
                console.error('Fetch Hospitals Error:', error);
                Alert.alert('오류', '병원 목록을 불러오지 못했습니다.');
                return;
            }
            setHospitals(data || []);
        };
        fetchHospitals();
    }, []);

    const onSubmit = async () => {
        if (!selectedHospitalId) {
            Alert.alert('오류', '병원을 선택해주세요.');
            return;
        }

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) throw userError || new Error('사용자 정보 없음');

            // ✅ 수정된 부분: update_vet_hospital_info 함수 호출
            const { error: updateError } = await supabase.rpc('update_vet_hospital_info', {
                p_user_id: user.id,
                p_hospital_id: selectedHospitalId,
            });

            if (updateError) throw updateError;

            router.replace('/(tabs)/(home)');
        } catch (error) {
            console.error('Submit Error:', JSON.stringify(error, null, 2));
            Alert.alert('오류', (error as Error).message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6">
                <Text className="text-2xl font-semibold mt-4">병원을 선택해주세요</Text>
                <Text className="mt-3 mb-8 text-gray-600">소속된 동물병원을 선택해주세요.</Text>
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    {hospitals.length === 0 ? (
                        <Text className="text-gray-500 text-center">병원 목록을 불러오는 중입니다...</Text>
                    ) : (
                        hospitals.map((hospital) => (
                            <TouchableOpacity
                                key={hospital.id}
                                className={`mb-4 px-5 py-6 rounded-3xl ${selectedHospitalId === hospital.id ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} border`}
                                onPress={() => setSelectedHospitalId(hospital.id)}
                            >
                                <Text className="text-lg font-semibold">{hospital.name}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                    <TouchableOpacity
                        onPress={() => router.push('/auth/vet-info-custom')}
                    >
                        <Text className="text-blue-500 mt-4 text-center">찾는 병원이 없으신가요?</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            <View className="px-6 pb-8 bg-white">
                <TouchableOpacity
                    className={`py-4 rounded-xl ${selectedHospitalId ? 'bg-blue-500' : 'bg-gray-300'}`}
                    onPress={onSubmit}
                    disabled={!selectedHospitalId}
                >
                    <Text className="text-white font-semibold text-center">제출</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
