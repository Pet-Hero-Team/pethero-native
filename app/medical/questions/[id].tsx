import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native'; // Image 컴포넌트 추가

export default function QuestionsDetailScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                <View className="px-6 pt-3">
                    <View className="flex-row items-center justify-between">
                        <Pressable onPress={() => router.back()} hitSlop={12}>
                            <Ionicons name="chevron-back" size={28} color="#222" />
                        </Pressable>
                    </View>
                </View>
                <View className='pt-8'>
                    <View className="bg-white rounded-lg px-6 pb-8">
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 rounded-full bg-purple-200 justify-center items-center mr-3">

                                <Text className="text-purple-600 text-lg">🌙</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-neutral-900">뽀삐엄마</Text>
                                <Text className="text-sm text-neutral-500">15분전</Text>
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
                        </View>

                        <View className="mb-4">
                            <Text className="text-lg font-medium text-neutral-800 leading-9">지난주부터 구석에서 혼자 막 배를 긁길래 장난인줄 알았는데 자세히보니 배에 발진이 일어나있어요 혹시 어떻게 해야할까요?</Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-4">
                            <View className="flex-row items-center">
                                <Ionicons name="heart-outline" size={24} color="#262626" />
                                <Text className="text-sm text-neutral-800 ml-2">추천 6</Text>
                            </View>
                        </View>
                        <View className='flex-row items-center pt-4 justify-between'>
                            <View className='bg-neutral-100 py-2 px-3 rounded-lg'>
                                <Text className='text-sm font-semibold text-neutral-600'>피부 질환</Text>
                            </View>
                        </View>
                    </View>

                    <View className="border-t border-t-neutral-100 pt-6">
                        <Text className="text-xl font-bold text-neutral-800 px-6 mb-6">2개의 답변</Text>
                        <View className="bg-white border-b border-neutral-100">
                            <View className="flex-row items-center mb-4 px-6">
                                <View className="size-8 rounded-full bg-orange-200 justify-center items-center mr-3">
                                    <Text className="text-orange-600 text-lg">🧘‍♀️</Text>
                                </View>
                                <View className="flex-1">
                                    <View className='flex-row items-center'>
                                        <Text className="font-bold text-teal-800 mr-1">김성진 수의사</Text>
                                        <Ionicons name="checkmark-circle" size={12} color="#0d9488" />
                                    </View>

                                    <Text className="text-xs text-neutral-500 mt-1">4분전</Text>
                                </View>
                            </View>
                            <View className='px-6 pb-8'>
                                <Text className="text-lg font-medium text-neutral-800 leading-9">
                                    우선 피부 발진이 의심되는데요, 풀숲 진드기 혹은 여러 매게체로 인해서 피부발진이 의심됩니다 가까운 병원으로 내원하셔서 자세한 진찰을 받아보시는걸 추천드립니다
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="border-t border-t-neutral-100 pt-6">
                        <View className="bg-white border-b border-neutral-100">
                            <View className="flex-row items-center mb-4 px-6">
                                <View className="size-8 rounded-full bg-orange-200 justify-center items-center mr-3">
                                    <Text className="text-orange-600 text-lg">🧘‍♀️</Text>
                                </View>
                                <View className="flex-1">
                                    <View className='flex-row items-center'>
                                        <Text className="font-bold text-teal-800 mr-1">진수연 수의사</Text>
                                        <Ionicons name="checkmark-circle" size={12} color="#0d9488" />
                                    </View>

                                    <Text className="text-xs text-neutral-500 mt-1">8분전</Text>
                                </View>
                            </View>
                            <View className='px-6 pb-8'>
                                <Text className="text-lg font-medium text-neutral-800 leading-9">
                                    우선 피부 발진이 의심되는데요, 풀숲 진드기 혹은 여러 매게체로 인해서 피부발진이 의심됩니다 가까운 병원으로 내원하셔서 자세한 진찰을 받아보시는걸 추천드립니다
                                </Text>
                            </View>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}