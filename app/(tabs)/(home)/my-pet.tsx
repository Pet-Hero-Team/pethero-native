import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const fetchMyPetData = async (userId: string) => {
    const { data: petData, error: petError } = await supabase
        .from('pets')
        .select(`
            *,
            animal_breeds ( breed_name ),
            pet_ai_reports ( report_data, status )
        `)
        .eq('user_id', userId)
        .single();

    if (petError && petError.code !== 'PGRST116') {
        throw new Error(petError.message);
    }
    if (!petData) {
        return null;
    }

    const { count, error: countError } = await supabase
        .from('health_records')
        .select('id', { count: 'exact', head: true })
        .eq('pet_id', petData.id);

    if (countError) {
        console.error('Health record count error:', countError.message);
    }

    return {
        ...petData,
        // ⭐️⭐️⭐️ [0]을 제거하여 객체를 그대로 할당하도록 수정 ⭐️⭐️⭐️
        aiReport: petData.pet_ai_reports || null,
        health_record_count: count || 0,
    };
};


export default function MyPetScreen() {
    const { user } = useAuth();
    const { data: pet, isLoading, error } = useQuery({
        queryKey: ['myPetData', user?.id],
        queryFn: () => fetchMyPetData(user.id),
        enabled: !!user,
    });

    if (isLoading) {
        return <SafeAreaView className="flex-1 justify-center items-center bg-neutral-50"><ActivityIndicator size="large" /></SafeAreaView>;
    }

    if (error || !pet) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-neutral-50 p-6">
                <Text className="text-lg text-neutral-600 mb-2 text-center">반려동물 정보를 불러올 수 없어요</Text>
                <Text className="text-neutral-500 mb-6 text-center">
                    {error ? `오류: ${error.message}` : "등록된 반려동물이 없습니다."}
                </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/auth-info')} className="bg-orange-500 py-3 px-6 rounded-lg">
                    <Text className="text-white font-bold">내 반려동물 등록하기</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const birthday = new Date(pet.birthday);
    const timeWithPet = pet.birthday === '모름' ? '생일을 등록하지 않았어요' : `${birthday.getFullYear()}년 ${birthday.getMonth() + 1}월 ${birthday.getDate()}일부터\n함께하고 있습니다🦴`;

    const renderAiReport = () => {
        const reportContainer = pet.aiReport;
        const report = reportContainer?.report_data;

        if (!reportContainer) {
            return (
                <View className="items-center justify-center py-10 bg-gray-100 rounded-lg">
                    <Text className="text-neutral-500">아직 AI 리포트가 없어요.</Text>
                    <Text className="text-neutral-400 mt-1">진료기록을 추가하면 AI가 분석을 시작해요!</Text>
                </View>
            );
        }
        if (reportContainer.status === 'pending') {
            return (
                <View className="items-center justify-center py-10 bg-gray-100 rounded-lg">
                    <ActivityIndicator />
                    <Text className="text-neutral-500 mt-2">AI가 리포트를 생성하고 있어요...</Text>
                </View>
            );
        }
        if (reportContainer.status === 'failed' || !report) {
            return (
                <View className="items-center justify-center py-10 bg-red-50 rounded-lg">
                    <Text className="text-red-500 font-semibold">리포트 생성에 실패했어요</Text>
                    <Text className="text-red-400 mt-1">잠시 후 다시 시도해주세요.</Text>
                </View>
            );
        }

        return (
            <View>
                <View className="p-4 bg-blue-50 rounded-lg mb-4">
                    <Text className="font-bold text-blue-800">🩺 건강 상태 요약</Text>
                    <Text className="mt-2 text-blue-900 leading-6">{report.health_summary}</Text>
                </View>
                <View className="p-4 bg-green-50 rounded-lg mb-4">
                    <Text className="font-bold text-green-800">🧬 품종 기반 위험 분석</Text>
                    <Text className="mt-2 text-green-900 leading-6">{report.breed_risk_analysis}</Text>
                </View>
                {report.record_risk_analysis && report.record_risk_analysis !== '관련 기록 없음' && (
                    <View className="p-4 bg-yellow-50 rounded-lg mb-4">
                        <Text className="font-bold text-yellow-800">⚠️ 진료기록 기반 위험 분석</Text>
                        <Text className="mt-2 text-yellow-900 leading-6">{report.record_risk_analysis}</Text>
                    </View>
                )}
                <View className="p-4 bg-purple-50 rounded-lg mb-4">
                    <Text className="font-bold text-purple-800">💊 추천 영양제 성분</Text>
                    {report.supplement_recommendation?.map((item, index) => (
                        <View key={index} className="mt-2">
                            <Text className="font-semibold text-purple-900 leading-6"> • {item.ingredient}: <Text className="font-normal">{item.reason}</Text></Text>
                        </View>
                    ))}
                </View>
                <Text className="text-xs text-gray-400 text-center px-4 leading-5">{report.disclaimer}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-row items-center justify-between px-4 pb-4 pt-4 ">
                <Pressable onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={28} color="#222" />
                </Pressable>
                <Text className="text-neutral-500 text-sm">내 반려동물 정보</Text>
            </View>
            <ScrollView className='px-6 pt-8' contentContainerStyle={{ paddingBottom: 50 }}>
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-sm text-neutral-400 mb-1">{pet.breed_name || pet.category}</Text>
                        <Text className="text-6xl font-bold text-neutral-900 leading-none">{pet.name}</Text>
                        <Text className="text-neutral-500 leading-6 mt-4">{timeWithPet}</Text>
                    </View>
                    <View className="items-center">
                        <Image
                            source={require("@/assets/images/6.png")}
                            className="size-36 self-end"
                            resizeMode="contain"
                        />
                    </View>
                </View>
                <View className="flex-row justify-between mt-12 mb-6">
                    <View className="flex-1 relative bg-orange-500 rounded-xl mr-6 justify-center p-6">
                        <MaterialCommunityIcons className="absolute right-4 top-4" name="android-messages" size={50} color="#ffb078" />
                        <Text className="text-base text-white font-semibold mb-1">질문</Text>
                        <Text className="text-5xl font-bold text-white pt-2">0</Text>
                        <Text className="text-sm text-white">아직 작성한 질문이 없어요</Text>
                        <Pressable className="bg-orange-400 rounded-lg py-2 mt-6">
                            <Text className="text-center text-white text-sm font-semibold">내 질문 보기</Text>
                        </Pressable>
                    </View>
                    <View className="flex-1 relative bg-slate-800 rounded-xl justify-center p-6">
                        <FontAwesome6 className="absolute right-4 top-4" name="syringe" size={45} color="#334155" />
                        <Text className="text-base text-white font-semibold mb-1">건강기록</Text>
                        <Text className="text-5xl font-bold text-white pt-2">{pet.health_record_count}</Text>
                        <Text className="text-sm text-left text-white mb-2">개의 기록이 있어요</Text>
                        <Pressable
                            className="bg-slate-700 rounded-lg py-2 mt-4"
                            onPress={() => router.push({
                                pathname: `/pets/${pet.id}/add-record`,
                                params: { animalType: pet.category }
                            })}
                        >
                            <Text className="text-center text-white text-sm font-semibold">진료기록 추가하기</Text>
                        </Pressable>
                    </View>
                </View>
                <View className='mt-8'>
                    <Text className="text-xl mb-6 font-bold text-neutral-900">{pet.name}을(를) 위한 AI 맞춤 리포트</Text>
                    {renderAiReport()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

