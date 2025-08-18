import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function VetIndexScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6">
                <View className="flex-row justify-end mt-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="close" size={24} color="#51555c" />
                    </TouchableOpacity>
                </View>
                <Text className="text-2xl font-semibold mt-4">수의사님 반갑습니다</Text>
                <Text className="text-red-600 mt-6">* 이미 전화번호로 가입한 일반 유저의 경우 수의사 회원가입 시, 일반유저에서 수의사로 자동 전환됩니다.</Text>
                <Text className="text-red-600 mt-4">* 애플/카카오로 시작한 유저는 해당사안이 없습니다</Text>
                <View className="w-full px-4 mt-10">
                    <Link href="/auth/vet-signin" asChild>
                        <TouchableOpacity className="w-full py-4 bg-blue-500 rounded-xl mb-4">
                            <Text className="text-lg font-medium text-white text-center">
                                수의사 로그인
                            </Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/auth/vet-signup" asChild>
                        <TouchableOpacity className="w-full py-4 bg-gray-200 rounded-xl">
                            <Text className="text-lg font-medium text-neutral-900 text-center">
                                수의사 회원가입
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}