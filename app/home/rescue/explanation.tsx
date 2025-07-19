import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function ExplanationScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 bg-white px-5 justify-between">

                <View className="pt-10">
                    <View className="flex-row justify-end mb-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-2"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={24} color="#51555c" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-orange-500 text-2xl font-bold mb-2">정말 유감이에요😢</Text>
                    <Text className="text-3xl font-black tracking-tight text-gray-800 mb-8 leading-snug">
                        몇 가지 질문에 답해주시면 {"\n"}
                        꼭 찾을 수 있도록 도와드릴게요!
                    </Text>
                </View>


                <View className="flex-1 items-center justify-center relative">
                    <View className="absolute bg-orange-50 rounded-full w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 0 }} />
                    <Image
                        source={require("@/assets/images/9.png")}
                        className="w-52 h-52"
                        resizeMode="contain"
                        style={{ zIndex: 1 }}
                    />
                </View>


                <View className="pb-6">
                    <TouchableOpacity
                        className="bg-orange-500 py-4 rounded-xl"
                        onPress={() => router.push('/home/rescue/rescue')}
                    >
                        <Text className="text-white text-base font-bold text-center">시작하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}