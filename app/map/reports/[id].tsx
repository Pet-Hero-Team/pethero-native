import { Fontisto, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

const tags = ['겁이 많아요', '장신구가 있어요', '잡으려 하지마세요', '추가 태그', '더 긴 태그 예시'];

const rescueList = [
    {
        id: '1',
        title: '라이를 찾아주세요 (포메라니안)',
        gender: 'female',
        address: '경기도 부천시 부천로 1',
        price: 350000,
        distance: '362m',
        area: '부천',
        imageUrl: 'https://picsum.photos/700/700',
        latitude: 37.4989,
        longitude: 126.7833,
    },
    {
        id: '2',
        title: '골든리트리버를 잃어버렸습니다',
        gender: 'male',
        address: '경기도 부천시 부천로 151',
        price: 200000,
        distance: '1.2km',
        area: '부천',
        imageUrl: 'https://picsum.photos/700/700',
        latitude: 37.4845,
        longitude: 126.7827,
    },
];

const images = [
    'https://picsum.photos/1000/1000',
    'https://picsum.photos/1000/1001',
    'https://picsum.photos/1000/1002',
    'https://picsum.photos/1000/1003',
];

export default function ExhibitionDetailScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const imageScrollViewRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();
    const CARD_WIDTH = width * 1;
    const IMAGE_WIDTH = width;

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / CARD_WIDTH);
        setActiveIndex(index);
    };

    const handleImageScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / IMAGE_WIDTH);
        setActiveImageIndex(index);
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="overflow-hidden">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={IMAGE_WIDTH}
                    decelerationRate="fast"
                    ref={imageScrollViewRef}
                    onScroll={handleImageScroll}
                    scrollEventThrottle={16}
                >
                    {images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            className="h-[32rem] w-full"
                            style={{ width: IMAGE_WIDTH }}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>
                <View className="flex-row items-center justify-between px-4 pt-12 absolute top-0 w-full">
                    <Pressable onPress={() => router.back()} className="p-1 bg-white/60 rounded-full">
                        <Ionicons name="chevron-back" size={28} color="#222" />
                    </Pressable>
                </View>
                <View className="flex-row justify-center absolute bottom-4 w-full">
                    {images.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 w-2 mx-1 rounded-full ${activeImageIndex === index ? 'bg-white' : 'bg-white/50'
                                }`}
                        />
                    ))}
                </View>
            </View>
            <View className="px-6">
                <View className="pt-8">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row gap-2">
                            <Text className="px-2 py-1 bg-neutral-100 rounded text-sm text-neutral-700">포메라니안</Text>
                            <Text className="px-2 py-1 bg-neutral-100 rounded text-sm text-neutral-700">실종</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="people" size={17} color="#404040" />
                            <Text className="text-sm text-neutral-700 font-semibold">3</Text>
                        </View>
                    </View>
                    <Text className="text-2xl font-semibold text-neutral-800 mt-2" numberOfLines={2}>
                        흰색꼬리를 가진 고양이를 찾아주세요
                    </Text>
                    <View className="flex-row items-center border-b border-neutral-200 mt-4 pb-8">
                        <Text className="text-red-500 text-xl font-bold">현상금</Text>
                        <Text className="text-2xl text-neutral-800 ml-2 font-bold">450,000원</Text>
                    </View>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-6">
                    {tags.map((tag, idx) => (
                        <Pressable key={idx} className="bg-neutral-100 rounded-lg py-2 px-4 items-center">
                            <Text className="text-neutral-800 text-sm">{tag}</Text>
                        </Pressable>
                    ))}
                </View>
                <View className="py-2 mt-8">
                    <View className="flex-row items-center mb-4">
                        <Text className="text-neutral-500 font-semibold w-20">이름</Text>
                        <Text className="text-neutral-800 font-semibold text-lg">라이</Text>
                    </View>
                    <View className="flex-row items-center mb-4">
                        <Text className="text-neutral-500 font-semibold w-20">실종장소</Text>
                        <Text className="text-neutral-800 font-semibold text-lg">경기도 부천시 중동로 19</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-neutral-500 font-semibold w-20">실종일</Text>
                        <Text className="text-neutral-800 font-semibold text-lg">2025.04.30.(토)</Text>
                    </View>
                </View>
                <View className="mt-6 border-b border-neutral-200 pb-8">
                    <Text className="text-neutral-700 leading-8">
                        흰색 꼬리를 가진 고양이입니다. 실종된 지 3일이 지났습니다. 서울숲 근처에서 마지막으로 목격되었으며, 주변 CCTV에 포착된 모습이 있습니다.
                        겁이 많고 사람을 잘 따르지 않습니다. 장신구는 없으며, 목줄도 착용하지 않았습니다. 배에 작은 상처가 있고 체중은 약 3.5kg였다가 지금은 모르겠습니다
                        혹시라도 발견하신 분은 연락 부탁드립니다.
                    </Text>
                </View>
                <View className="flex-row justify-between mt-8 bg-white">
                    <View className="items-center w-1/4">
                        <Ionicons name="bookmark-outline" size={26} color="#888" />
                        <Text className="text-xs text-gray-500 mt-2">8</Text>
                    </View>
                    <View className="h-8 border-l border-gray-200" />
                    <View className="items-center w-1/4">
                        <Ionicons name="location-outline" size={26} color="#888" />
                        <Text className="text-xs text-gray-500 mt-2">위치</Text>
                    </View>
                    <View className="h-8 border-l border-gray-200" />
                    <View className="items-center w-1/4">
                        <Ionicons name="call-outline" size={26} color="#888" />
                        <Text className="text-xs text-gray-500 mt-2">전화</Text>
                    </View>
                    <View className="h-8 border-l border-gray-200" />
                    <View className="items-center w-1/4">
                        <Ionicons name="share-social-outline" size={26} color="#888" />
                        <Text className="text-xs text-gray-500 mt-2">공유</Text>
                    </View>
                </View>
            </View>
            <View className="px-6 mt-12 pb-12">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH}
                    decelerationRate="fast"
                    ref={scrollViewRef}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {rescueList.map((item, idx) => (
                        <Pressable
                            key={item.id}
                            onPress={() => router.push(`/map/reports/${item.id}`)}
                            className="bg-white mr-8"
                            style={{ width: 270 }}
                        >
                            <Image
                                source={{ uri: item.imageUrl }}
                                className="w-full h-44 rounded-lg"
                                resizeMode="cover"
                            />
                            <View className="py-4">
                                <Text className="text-lg text-neutral-800 font-bold mr-1" numberOfLines={1}>{item.title}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                                    <Text className="text-sm text-neutral-600 ml-1">{item.address}</Text>
                                </View>
                                <Text className="font-semibold text-lg text-neutral-800 mt-1">
                                    {item.price.toLocaleString('ko-KR')}원
                                </Text>
                                <View className="flex-row items-center mt-2">
                                    <Text className="text-xs text-neutral-500">{item.area}</Text>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
                <View className="flex-row justify-center mt-4">
                    {rescueList.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 w-2 mx-1 rounded-full ${activeIndex === index ? 'bg-neutral-800' : 'bg-neutral-300'}`}
                        />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}