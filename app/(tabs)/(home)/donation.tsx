import { ShadowView } from '@/components/ShadowView';
import { ShadowViewLight } from '@/components/ShadowViewLight';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

const newsList = [
    {
        id: 1,
        title: '덕분에 고양이를 살릴수있었어요',
        content: '안녕하세요. 고등학교를 입학하는 두 학생이 추첨을 하다보니 집과 떨어진 학교로 배정되었습니다. 매일 대중교통을 이용하는 아이들의 몸이 힘든 것도 있지만, 적잖은 교통비를 조금 지원해주고 싶었습니다. 집 가까운 학교가 아니어서 집안의 부담도 염려되기도 했죠. 그래서 아이들의 교통비에 조금 보태주고 싶었습니다.',
        period: '3일 전',
    },
    {
        id: 2,
        title: '유기동물 보호소를 설립했습니다',
        content: '안녕하세요. 고등학교를 입학하는 두 학생이 추첨을 하다보니 집과 떨어진 학교로 배정되었습니다. 매일 대중교통을 이용하는 아이들의 몸이 힘든 것도 있지만, 적잖은 교통비를 조금 지원해주고 싶었습니다. 집 가까운 학교가 아니어서 집안의 부담도 염려되기도 했죠. 그래서 아이들의 교통비에 조금 보태주고 싶었습니다.',
        period: '5일 전',
    },
    {
        id: 3,
        title: '토끼 키우기에 관한 꿀팁 10가지',
        content: '안녕하세요. 고등학교를 입학하는 두 학생이 추첨을 하다보니 집과 떨어진 학교로 배정되었습니다. 매일 대중교통을 이용하는 아이들의 몸이 힘든 것도 있지만, 적잖은 교통비를 조금 지원해주고 싶었습니다. 집 가까운 학교가 아니어서 집안의 부담도 염려되기도 했죠. 그래서 아이들의 교통비에 조금 보태주고 싶었습니다.',
        period: '8일 전',
    },
];

const products = [
    {
        id: 1,
        rank: 1,
        image: 'https://picsum.photos/seed/puppy1/400/400',
        title: '유기견 보호소 사료 지원 프로젝트',
        percent: 43,
        review: 4864,
        satisfaction: 95,
    },
    {
        id: 2,
        rank: 2,
        image: 'https://picsum.photos/seed/puppy2/400/400',
        title: '반려동물 의료비 후원 캠페인',
        percent: 76,
        review: 200,
        satisfaction: 90,
    },
    {
        id: 3,
        rank: 3,
        image: 'https://picsum.photos/seed/puppy3/400/400',
        title: '유기동물 입양센터 환경 개선',
        percent: 13,
        review: 150,
        satisfaction: 98,
    },
    {
        id: 4,
        rank: 4,
        image: 'https://picsum.photos/seed/puppy4/400/400',
        title: '길고양이 겨울집 만들기',
        percent: 120,
        review: 320,
        satisfaction: 97,
    },
];

const donationHistory = [
    {
        id: 1,
        title: '수의성모병원',
        description: '25년 03월 01일, 유기동물 보호소에 기부',
    },
    {
        id: 2,
        title: '지역사회 동물보호센터',
        description: '25년 03월 01일, 유기동물 보호소에 기부',
    },
    {
        id: 3,
        title: '부천 sky 동물병원',
        description: '25년 03월 01일, 유기동물 보호소에 기부',
    },
    {
        id: 4,
        title: '길거리지킴이',
        description: '25년 03월 01일, 유기동물 보호소에 기부',
    },
];

const windowWidth = Dimensions.get('window').width;
const CARD_WIDTH = (windowWidth - 32 - 26) / 2;
const CARD_WIDTH2 = windowWidth * 0.80;

export default function DonationScreen() {
    const [selectedCategory, setSelectedCategory] = useState('식품');
    const [selectedSub, setSelectedSub] = useState('전체');
    const [activeTab, setActiveTab] = useState<string | null>(null);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 pb-4 pt-4 ">
                <Pressable onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={28} color="#222" />
                </Pressable>
                <Ionicons name="settings-outline" size={22} color="#222" />
            </View>
            <ScrollView className='bg-neutral-100'>
                <ShadowViewLight className='px-6 bg-white pb-12'>
                    <Text className='text-neutral-800 text-3xl font-bold pt-8'>동전기부</Text>
                    <Text className='text-neutral-500 pt-2'>작은 행동으로 세상을 바꿉니다.</Text>
                    <View className="flex-row flex-wrap justify-between pt-6">
                        {products.map((item, idx) => (
                            <View
                                key={item.id}
                                style={{ width: CARD_WIDTH }}
                                className="bg-white rounded-2xl shadow-sm mb-6"
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    className="w-full h-44 rounded-lg"
                                    resizeMode="cover"
                                />
                                <View className='py-2'>
                                    <Text className="text-neutral-900 font-medium text-sm mb-1" numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <View className="w-full h-1 bg-neutral-100 rounded-full mb-1 mt-1 overflow-hidden">
                                        <View
                                            style={{ width: `${item.percent}%` }}
                                            className="h-1 bg-orange-500 rounded-full"
                                        />
                                    </View>
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-orange-500 font-bold text-lg">{item.percent}%</Text>
                                        <View className='flex-row items-center'>
                                            <Ionicons name="people" size={12} color="#757575" className='mr-1' />
                                            <Text className="text-neutral-400 text-xs">참여 {item.review.toLocaleString()}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                        <View className='w-full bg-neutral-100 py-4 rounded-xl'>
                            <Text className='text-center text-neutral-800 font-bold'>더보기</Text>
                        </View>
                    </View>
                </ShadowViewLight>
                <ShadowViewLight className='px-6 mt-8 pt-16 bg-white'>
                    <Text className='text-neutral-800 text-3xl font-bold'>기부 후기</Text>
                    <Text className='text-neutral-500 pt-2'>기부를 받았던 분들의 감사 인사입니다.</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH2}
                        contentContainerStyle={{ gap: 16 }}
                        decelerationRate="fast"
                        className='mt-6 bg-white'
                    >
                        {newsList.map((item, idx) => (
                            <ShadowView key={item.id} style={{ width: CARD_WIDTH2 }} className={`rounded-2xl bg-white`}>
                                <View className='bg-orange-500 rounded-t-lg py-4 relative px-4'>
                                    <Text className="text-white font-bold text-xl mb-1 mt-3">{item.title}</Text>
                                    <Fontisto name="quote-a-left" size={24} color="#ff974e" className='absolute bottom-2 right-4' />
                                </View>
                                <View className='border border-neutral-200 p-4 rounded-b-2xl'>
                                    <Text numberOfLines={3} className='leading-8 text-neutral-600'>{item.content}</Text>
                                </View>
                            </ShadowView>
                        ))}
                    </ScrollView>
                </ShadowViewLight>

                <View className="px-6 pt-4 pb-16 bg-white">
                    <View className='pt-6'>
                        {donationHistory.map((item, idx) => (
                            <View key={item.id} className="flex-row relative">
                                <View className="items-center mr-4">
                                    <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
                                        <Text className="text-orange-500 font-bold">{idx + 1}</Text>
                                    </View>
                                    {idx !== donationHistory.length - 1 && (
                                        <View
                                            style={{
                                                width: 1,
                                                height: 55,
                                                backgroundColor: '#e5e5e5',
                                            }}
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text className="text-neutral-900 font-bold text-lg mb-1">{item.title}</Text>
                                    <Text className="text-neutral-500">{item.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
                <View className=" rounded-xl px-6 py-6 mt-6">
                    <Text className="text-neutral-800 text-lg font-bold mb-3">유의사항</Text>
                    <View className="flex-row items-start mb-2">
                        <Text className="text-neutral-400 mr-2 mt-1">•</Text>
                        <Text className="text-neutral-700">
                            기부에대한 정보는 기부자가 입력한 정보로 변동될 수 있습니다.
                        </Text>
                    </View>
                    <View className="flex-row items-start">
                        <Text className="text-neutral-400 mr-2 mt-1">•</Text>
                        <Text className="text-neutral-700">
                            펫히어로는(주)는 통신판매 중개자로 통신판매의 당사자가 아닙니다. 따라서 판매자가 등록한 기부정보, 거래에 대한 일체의 책임을 지지 않습니다.
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
