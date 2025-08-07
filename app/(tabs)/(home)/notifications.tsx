import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationScreen() {
    // 탭 상태를 관리합니다.
    const [activeTab, setActiveTab] = useState('모두');

    // 상단 탭 메뉴 목록입니다.
    const tabs = ['모두', '게시글', '의료', '채팅방', '이벤트/혜택'];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-5 pt-2 pb-4 bg-white border-b border-neutral-200">
                <TouchableOpacity onPress={() => router.back()} className="p-1">
                    <Ionicons name="chevron-back" size={28} color="black" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold">알림</Text>
                <TouchableOpacity>
                    <Text className="text-base text-neutral-500">이용기록</Text>
                </TouchableOpacity>
            </View>

            <View className="h-12 bg-white border-b border-neutral-200">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            // 고정 너비 대신 텍스트에 맞는 패딩을 사용하여 유동적으로 만듭니다.
                            className="px-4 justify-center items-center relative"
                        >
                            <Text className={`text-base ${activeTab === tab ? 'font-bold text-black' : 'text-neutral-500'}`}>
                                {tab}
                            </Text>
                            {/* 활성 탭 밑줄 표시. 탭 텍스트 너비에 맞춥니다. */}
                            {activeTab === tab && (
                                <View className="h-0.5 bg-black absolute bottom-0 w-full" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 알림이 없을 때 표시되는 기본 콘텐츠 섹션 */}
            <View className="flex-1 items-center justify-center bg-neutral-100 p-5">
                <MaterialIcons name="pets" size={60} color="#d4d4d4" />
                <Text className="text-lg text-neutral-500 mt-5 text-center leading-7">
                    이용중인 서비스와 새로운 알림이{'\n'}이곳에 등록됩니다.
                </Text>
            </View>
        </SafeAreaView>
    );
}
