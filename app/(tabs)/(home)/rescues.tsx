import { ShadowViewLight } from '@/components/ShadowViewLight';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

export default function RestaurantListScreen() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="px-6 py-4">
                <View className="pb-4 flex-row items-center justify-center mb-4">
                    {isSearchVisible ? (
                        <View className="flex-1 flex-row items-center justify-center">
                            <View className="flex-1 flex-row items-center border rounded-full border-neutral-200 bg-white px-6 py-4">
                                <Ionicons name="search" size={18} color="black" />
                                <TextInput
                                    className="flex-1 pl-3"
                                    placeholder="제목 / 지역 등으로 검색해주세요"
                                    autoFocus
                                />
                                <Pressable
                                    onPress={() => setIsSearchVisible(false)}
                                >
                                    <Ionicons name="close" size={16} color="black" />
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-row items-center justify-between w-full">
                            <View className="flex-row items-center">
                                <Pressable onPress={() => router.back()} hitSlop={12}>
                                    <Ionicons name="chevron-back" size={28} color="#222" />
                                </Pressable>
                                <View className="flex-row ml-2">
                                    <View className="px-5 py-3 border rounded-full border-neutral-200 bg-white mr-1">
                                        <Text>최신순</Text>
                                    </View>
                                    <View className="px-5 py-3 border rounded-full border-neutral-200 bg-white mr-1">
                                        <Text>인기순</Text>
                                    </View>
                                    <View className="px-5 py-3 border rounded-full border-neutral-200 bg-white">
                                        <Text>거리순</Text>
                                    </View>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setIsSearchVisible(true)}
                                className="ml-4 bg-white rounded-full p-3"
                            >
                                <Ionicons name="search" size={18} color="black" />
                            </Pressable>
                        </View>
                    )}
                </View>
                <ShadowViewLight className="bg-white rounded-2xl mb-4">
                    <View className="w-full h-44 bg-gray-200 rounded-t-2xl overflow-hidden">
                        <Image
                            source={{ uri: 'https://picsum.photos/seed/puppy2/800/800' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <Pressable className="absolute top-3 right-3 bg-white p-2 rounded-full">
                            <Ionicons name="bookmark" size={20} color="#d5d5d5" />
                        </Pressable>
                    </View>
                    <View className="px-4 py-5">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg text-neutral-800 font-bold" numberOfLines={1}>반려동물 의료비 후원 캠페인</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="people" size={17} color="#888" />
                                <Text className="text-sm font-semibold ml-1 text-neutral-600">3</Text>
                            </View>
                        </View>
                        <Text className="font-semibold text-lg text-neutral-800">
                            200,000원
                        </Text>
                        <Text className="text-sm text-neutral-600 mt-2" numberOfLines={2}>
                            흰색 꼬리를 가진 고양이입니다. 실종된 지 3일이 지났습니다. 서울숲 근처에서 마지막으로 목격되었으며, 주변 CCTV에 포착된 모습이 있습니다.
                            겁이 많고 사람을 잘 따르지 않습니다. 장신구는 없으며, 목줄도 착용하지 않았습니다. 배에 작은 상처가 있고 체중은 약 3.5kg였다가 지금은 모르겠습니다
                            혹시라도 목격하신 분은 연락 부탁드립니다.
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <Fontisto name="map-marker-alt" size={12} color="#666666" />
                            <Text className="text-sm text-neutral-800 ml-2">부천시 중동로 19</Text>
                            <Text className="mx-1 text-neutral-500 text-xs">•</Text>
                            <Text className="text-sm text-neutral-800">332m</Text>
                        </View>
                    </View>
                </ShadowViewLight>
                <ShadowViewLight className="bg-white rounded-2xl mb-4">
                    <View className="w-full h-44 bg-gray-200 rounded-t-2xl overflow-hidden">
                        <Image
                            source={{ uri: 'https://picsum.photos/seed/puppy2/800/800' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <Pressable className="absolute top-3 right-3 bg-white p-2 rounded-full">
                            <Ionicons name="bookmark" size={20} color="#d5d5d5" />
                        </Pressable>
                    </View>
                    <View className="px-4 py-5">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg text-neutral-800 font-bold" numberOfLines={1}>반려동물 의료비 후원 캠페인</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="people" size={17} color="#888" />
                                <Text className="text-sm font-semibold ml-1 text-neutral-600">3</Text>
                            </View>
                        </View>
                        <Text className="font-semibold text-lg text-neutral-800">
                            200,000원
                        </Text>
                        <Text className="text-sm text-neutral-600 mt-2" numberOfLines={2}>
                            흰색 꼬리를 가진 고양이입니다. 실종된 지 3일이 지났습니다. 서울숲 근처에서 마지막으로 목격되었으며, 주변 CCTV에 포착된 모습이 있습니다.
                            겁이 많고 사람을 잘 따르지 않습니다. 장신구는 없으며, 목줄도 착용하지 않았습니다. 배에 작은 상처가 있고 체중은 약 3.5kg였다가 지금은 모르겠습니다
                            혹시라도 목격하신 분은 연락 부탁드립니다.
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <Fontisto name="map-marker-alt" size={12} color="#666666" />
                            <Text className="text-sm text-neutral-800 ml-2">부천시 중동로 19</Text>
                            <Text className="mx-1 text-neutral-500 text-xs">•</Text>
                            <Text className="text-sm text-neutral-800">332m</Text>
                        </View>
                    </View>
                </ShadowViewLight>
                <ShadowViewLight className="bg-white rounded-2xl mb-4">
                    <View className="w-full h-44 bg-gray-200 rounded-t-2xl overflow-hidden">
                        <Image
                            source={{ uri: 'https://picsum.photos/seed/puppy2/800/800' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <Pressable className="absolute top-3 right-3 bg-white p-2 rounded-full">
                            <Ionicons name="bookmark" size={20} color="#d5d5d5" />
                        </Pressable>
                    </View>
                    <View className="px-4 py-5">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-lg text-neutral-800 font-bold" numberOfLines={1}>반려동물 의료비 후원 캠페인</Text>
                            <View className="flex-row items-center">
                                <Ionicons name="people" size={17} color="#888" />
                                <Text className="text-sm font-semibold ml-1 text-neutral-600">3</Text>
                            </View>
                        </View>
                        <Text className="font-semibold text-lg text-neutral-800">
                            200,000원
                        </Text>
                        <Text className="text-sm text-neutral-600 mt-2" numberOfLines={2}>
                            흰색 꼬리를 가진 고양이입니다. 실종된 지 3일이 지났습니다. 서울숲 근처에서 마지막으로 목격되었으며, 주변 CCTV에 포착된 모습이 있습니다.
                            겁이 많고 사람을 잘 따르지 않습니다. 장신구는 없으며, 목줄도 착용하지 않았습니다. 배에 작은 상처가 있고 체중은 약 3.5kg였다가 지금은 모르겠습니다
                            혹시라도 목격하신 분은 연락 부탁드립니다.
                        </Text>
                        <View className="flex-row items-center mt-2">
                            <Fontisto name="map-marker-alt" size={12} color="#666666" />
                            <Text className="text-sm text-neutral-800 ml-2">부천시 중동로 19</Text>
                            <Text className="mx-1 text-neutral-500 text-xs">•</Text>
                            <Text className="text-sm text-neutral-800">332m</Text>
                        </View>
                    </View>
                </ShadowViewLight>
            </ScrollView>
        </SafeAreaView>
    );
}