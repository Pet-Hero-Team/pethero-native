import { ShadowView } from '@/components/ShadowView';
import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function BirdDetailScreen() {
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <ScrollView>
                <View className="px-6 pt-3">
                    <View className="flex-row items-center justify-between">
                        <Pressable onPress={() => router.back()} hitSlop={12}>
                            <Ionicons name="chevron-back" size={28} color="#222" />
                        </Pressable>
                    </View>
                    <Text className="text-4xl font-extrabold text-neutral-900 mt-8">News</Text>
                    <View className="flex-row items-center justify-between mt-2">
                        <View className="flex-row items-center">
                            <Text className="text-neutral-700 font-semibold text-base">최신순</Text>
                            <Entypo name="chevron-small-down" size={22} color="#444" />
                        </View>
                        <View className="flex-row bg-neutral-100 rounded-full p-1">
                            <Pressable
                                onPress={() => setViewType('grid')}
                                className={viewType === 'grid'
                                    ? "bg-white rounded-full px-3 py-2 mr-1 flex-row items-center"
                                    : "rounded-full px-3 py-2 mr-1 flex-row items-center"}
                                accessibilityRole="button"
                                accessibilityLabel="그리드 보기"
                            >
                                <MaterialCommunityIcons
                                    name="view-grid"
                                    size={18}
                                    color={viewType === 'grid' ? "#222" : "#bbb"}
                                />
                            </Pressable>
                            <Pressable
                                onPress={() => setViewType('list')}
                                className={viewType === 'list'
                                    ? "bg-white rounded-full px-3 py-2 flex-row items-center"
                                    : "rounded-full px-3 py-2 flex-row items-center"}
                                accessibilityRole="button"
                                accessibilityLabel="리스트 보기"
                            >
                                <FontAwesome5
                                    name="columns"
                                    size={18}
                                    color={viewType === 'list' ? "#222" : "#bbb"}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View className="px-4 mb-6 mt-6">
                    <ShadowView className="bg-white rounded-3xl">
                        <View className="overflow-hidden rounded-3xl">
                            <Image
                                source={{ uri: 'https://picsum.photos/500/500' }}
                                className="w-full h-96"
                                resizeMode="cover"
                            />
                            <View className="p-5">
                                <Text className="text-teal-600 font-semibold mb-1">고양이</Text>
                                <Text className="text-neutral-900 font-extrabold text-2xl mb-2">고양이는 왜 꾹꾹이를 할까?</Text>
                                <Text className="text-neutral-500 text-base leading-6"
                                    numberOfLines={2}
                                    ellipsizeMode="tail">
                                    고양이가 앞발로 꾹꾹이를 하는 행동은 어릴 때 어미 젖을 먹던 습관에서 비롯된 것으로, 편안함과 애정의 표현입니다. 스트레스를 해소하거나, 자신의 영역임을 표시할 때도 보입니다.
                                </Text>
                            </View>
                        </View>
                    </ShadowView>
                    <ShadowView className="bg-white rounded-3xl mt-8">
                        <View className="overflow-hidden rounded-3xl">
                            <Image
                                source={{ uri: 'https://picsum.photos/500/500' }}
                                className="w-full h-96"
                                resizeMode="cover"
                            />
                            <View className="p-5">
                                <Text className="text-teal-600 font-semibold mb-1">강아지</Text>
                                <Text className="text-neutral-900 font-extrabold text-2xl mb-2">강아지 석고현상을 아시나요?</Text>
                                <Text className="text-neutral-500 text-base leading-6"
                                    numberOfLines={2}
                                    ellipsizeMode="tail">
                                    강아지 석고현상은 갑작스러운 놀람이나 불안으로 인해 몸이 순간적으로 굳는 현상입니다. 이는 일시적인 반응으로, 대부분 금방 정상으로 돌아오지만 반복된다면 환경을 점검해 주세요.
                                </Text>
                            </View>
                        </View>
                    </ShadowView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
