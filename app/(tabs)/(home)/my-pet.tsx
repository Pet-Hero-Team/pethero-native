import { ShadowView } from '@/components/ShadowView';
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function MyPetScreen() {
    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-row items-center justify-between px-4 pb-4 pt-4 ">
                <Pressable onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={28} color="#222" />
                </Pressable>
                <Text className="text-neutral-500 text-sm">아무거나</Text>
            </View>
            <ScrollView className='px-6 pt-8'>
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-sm text-neutral-400 mb-1">강아지</Text>
                        <Text className="text-6xl font-bold text-neutral-900 leading-none">라이</Text>
                        <Text className="text-neutral-500 leading-6 mt-4">
                            2020년 10월 1일 목요일부터{"\n"}함께하고 있습니다🦴
                        </Text>
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
                        <Text className="text-5xl font-bold text-white pt-2">2</Text>
                        <Text className="text-sm text-white">25년6월 기준</Text>
                        <Pressable className="bg-orange-400 rounded-lg py-2 mt-6">
                            <Text className="text-center text-white text-sm font-semibold">모든기록 보기</Text>
                        </Pressable>
                    </View>

                    <View className="flex-1 relative bg-slate-800 rounded-xl justify-center p-6">
                        <FontAwesome6 className="absolute right-4 top-4" name="syringe" size={45} color="#334155" />
                        <Text className="text-base text-white font-semibold mb-1">건강검진</Text>
                        <Text className="text-5xl font-bold text-white pt-2">36</Text>
                        <Text className="text-sm text-left text-white mb-2">마지막 검진일로부터</Text>
                        <Pressable className="bg-slate-700 rounded-lg py-2 mt-4">
                            <Text className="text-center text-white text-sm font-semibold">검진기록 보기</Text>
                        </Pressable>
                    </View>
                </View>
                <View className='mt-8'>
                    <Text className="text-xl mb-6 font-bold text-neutral-900">추천</Text>
                    <View className="flex-row">
                        <ShadowView className="flex-1 bg-white rounded-xl flex-row justify-between items-center px-6 py-4">
                            <Image
                                source={require("@/assets/images/7.png")}
                                className="size-28"
                                resizeMode="contain"
                            />
                            <View>
                                <Text className="text-neutral-500 font-bold text-right mb-2">새로운 보험상품</Text>
                                <Text className="text-xl font-bold text-neutral-800 text-right">애완동물에 맞는{"\n"}보험을 추천해줄게요</Text>
                            </View>
                        </ShadowView>
                    </View>
                    <View className="flex-row mt-4">
                        <ShadowView className="flex-1 bg-white rounded-xl items-center flex-row justify-between items-center px-6 py-4">
                            <Image
                                source={require("@/assets/images/7.png")}
                                className="size-28"
                                resizeMode="contain"
                            />
                            <View>
                                <Text className="text-neutral-500 font-bold text-right mb-2">새로운 보험상품</Text>
                                <Text className="text-xl font-bold text-neutral-800 text-right">애완동물에 맞는{"\n"}보험을 추천해줄게요</Text>
                            </View>
                        </ShadowView>
                    </View>
                    <View className="flex-row mt-4">
                        <ShadowView className="flex-1 bg-white rounded-xl flex-row justify-between items-center px-6 py-4">
                            <Image
                                source={require("@/assets/images/7.png")}
                                className="size-28"
                                resizeMode="contain"
                            />
                            <View>
                                <Text className="text-neutral-500 font-bold text-right mb-2">새로운 보험상품</Text>
                                <Text className="text-xl font-bold text-neutral-800 text-right">애완동물에 맞는{"\n"}보험을 추천해줄게요</Text>
                            </View>
                        </ShadowView>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
