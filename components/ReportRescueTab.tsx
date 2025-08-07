import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// ReportRescueTab 컴포넌트는 부모로부터 데이터를 props로 받습니다.
export default function ReportRescueTab({ popularSearches, recommendedRegions }) {
    return (
        <ScrollView className="flex-1 px-6">
            <View className="flex-row items-center bg-neutral-100 rounded-lg my-8 px-3 py-4">
                <Ionicons name="search" size={20} color="#a3a3a3" />
                <TextInput
                    placeholder="검색어를 입력해주세요."
                    placeholderTextColor="#a3a3a3"
                    className="flex-1 ml-3 text-base text-neutral-800"
                />
            </View>
            <View>
                <Text className="text-xl font-bold mb-4">추천 검색어</Text>
                <View className="flex-row flex-wrap">
                    {popularSearches.map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            className="bg-neutral-100 rounded-full py-2 px-4 mb-3 mr-2"
                        >
                            {/* 모든 텍스트는 <Text> 컴포넌트 안에 있어야 합니다. */}
                            <Text className="text-sm text-neutral-600">{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            {/* 추천 지역 섹션 */}
            <View className="mt-8 pb-4">
                <Text className="text-xl font-bold mb-4">추천 지역</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {recommendedRegions.map((region) => (
                        <TouchableOpacity key={region.name} className="items-center mr-4">
                            <View
                                style={{ backgroundColor: region.color }}
                                className="w-20 h-20 rounded-full items-center justify-center"
                            />
                            {/* 모든 텍스트는 <Text> 컴포넌트 안에 있어야 합니다. */}
                            <Text className="text-base text-neutral-800 mt-2">
                                {region.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            {/* 하단 광고 영역 */}
            <View className="bg-gray-200 h-36 w-full rounded-lg mt-16 items-center justify-center">
                {/* 모든 텍스트는 <Text> 컴포넌트 안에 있어야 합니다. */}
                <Text className="text-gray-400">광고 영역</Text>
            </View>
        </ScrollView>
    );
}
