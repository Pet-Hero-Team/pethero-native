import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';

const tags = ['겁이 많아요', '장신구가 있어요', '잡으려 하지마세요', '추가 태그', '더 긴 태그 예시'];

const rescueList = [
    {
        id: '1',
        title: '불독을 발견했습니다',
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
        title: '주인없는 고양이를 발견했습니다',
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

export default function RescuesDetailScreen() {
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
        <>
            <ScrollView className="flex-1 bg-white relative">
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


                        <View className="flex-row items-center">
                            <Fontisto name="map-marker-alt" size={14} color="#262626" />
                            <Text className="text text-neutral-800 ml-2 font-bold">부천시 중동로 19</Text>
                        </View>
                        <Text className="text-2xl font-semibold text-neutral-800 mt-2" numberOfLines={2}>
                            흰색꼬리를 가진 고양이를 발견했었습니다.
                        </Text>
                    </View>

                    <View className="mt-4 border-b border-neutral-200 pb-8">
                        <Text className="text-neutral-700 leading-8">
                            흰색 꼬리를 가진 고양이를 발견했었습니다. 서울숲근방에서 발견했으며 이 고양이는 매우 겁이 많고, 사람을 잘 따르지 않습니다. 혹시 이 고양이를 잃어버리신 분이 계시다면 연락 부탁드립니다.
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
                <View className="px-6 mt-8 pb-36">
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
                                onPress={() => router.push(`/map/rescues/${item.id}`)}
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

            <View className='absolute bottom-10 flex items-center w-full'>
                <View className='bg-orange-500 py-4 px-8 rounded-xl flex-row items-center justify-center'>
                    <MaterialIcons name="message" size={24} color="white" />
                    <Text className='text-white text-lg font-bold ml-2'>제보자와 대화하기</Text>
                </View>
            </View>
        </>
    );
}