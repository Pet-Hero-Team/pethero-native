import { ShadowView } from '@/components/ShadowView';
import { FontAwesome6, Fontisto } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function MedicalScreen() {
    const [activeTab, setActiveTab] = useState<string | null>(null);


    return (
        <SafeAreaView className="flex-1 bg-teal-800">
            <ScrollView className='flex-1 bg-teal-800'>
                <View className='px-6 bg-teal-800 pb-16 pt-4'>
                    <FontAwesome6 name="shield-dog" size={28} color="white" />
                    <Text className="text-3xl font-bold text-white mt-3 shadow">내 애완동물의 건강을 {"\n"}한번에 해결해드릴게요.</Text>
                </View>
                <View className='bg-white rounded-t-3xl relative'>
                    <View className='mx-6'>
                        <ShadowView className='absolute bg-white rounded-full px-6 py-6 -top-7 w-full flex-1 flex-row items-center justify-between '>
                            <Text className='text-neutral-500 rounded-full'>증상이나 병원명으로 검색...</Text>
                            <Fontisto name="search" size={18} color="#737373" />
                        </ShadowView>
                    </View>
                    <View className="px-6 pt-20">
                        <View className="flex-row items-center">
                            <ShadowView className="rounded-3xl bg-white flex-1 mx-1 justify-between py-6 px-5">
                                <View>
                                    <Text className="text-xl  font-bold text-neutral-700 mb-2">질문하기</Text>
                                    <Text className="text-neutral-500 mb-4">수의사에게 물어보세요.</Text>
                                </View>
                                <Image
                                    source={require('@/assets/images/5.png')}
                                    className="size-20 self-end"
                                    resizeMode="contain"
                                />
                            </ShadowView>
                            <View className="w-3" />
                            <ShadowView className="rounded-3xl bg-white flex-1 mx-1 justify-between py-6 px-5">
                                <View>
                                    <Text className="text-xl  font-bold text-neutral-700 mb-2">병원찾기</Text>
                                    <Text className="text-neutral-500 mb-4">내 주변 병원을 찾아요.</Text>
                                </View>
                                <Image
                                    source={require('@/assets/images/4.png')}
                                    className="size-20 self-end"
                                    resizeMode="contain"
                                />
                            </ShadowView>
                        </View>
                    </View>


                    <View>
                        <View className='flex-row items-center border-b border-b-neutral-100 pb-4 pt-10 px-6'>
                            <Text className='text-neutral-800 font-bold text-lg'>최근 올라온 질문</Text>
                        </View>
                        <View className='border-b border-b-neutral-100 py-8'>
                            <View className='px-6'>
                                <Text className='text-neutral-800 font-bold text-xl pb-3'>고양이 뱃살에 발진이 일어났어요</Text>
                                <Text className='text-neutral-600 text-base leading-7'>지난주부터 구석에서 혼자 막 배를 긁길래 장난인줄 알았는데 {"\n"}자세히보니 배에 발진이 일어나있어요 혹시 어떻게 해야할까요?</Text>
                            </View>
                            <View className='flex-row items-center px-6 pt-4 justify-between'>
                                <View className='bg-neutral-100 py-2 px-3 rounded-lg'>
                                    <Text className='text-sm font-semibold text-neutral-600'>피부 질환</Text>
                                </View>
                                <Text className='text-sm text-neutral-600'>15분 전</Text>
                            </View>
                        </View>
                        <View className='border-b border-b-neutral-100 py-8'>
                            <View className='px-6'>
                                <Text className='text-neutral-800 font-bold text-xl pb-3'>고양이 뱃살에 발진이 일어났어요</Text>
                                <Text className='text-neutral-600 text-base leading-7'>지난주부터 구석에서 혼자 막 배를 긁길래 장난인줄 알았는데 {"\n"}자세히보니 배에 발진이 일어나있어요 혹시 어떻게 해야할까요?</Text>
                            </View>
                            <View className='flex-row items-center px-6 pt-4 justify-between'>
                                <View className='bg-neutral-100 py-2 px-3 rounded-lg'>
                                    <Text className='text-sm font-semibold text-neutral-600'>피부 질환</Text>
                                </View>
                                <Text className='text-sm text-neutral-600'>15분 전</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
