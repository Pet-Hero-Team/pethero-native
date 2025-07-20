import { Database } from '@/supabase/database.types';
import { supabase } from '@/supabase/supabase';
import { calculateDistance, UserLocation } from '@/utils/calculateDistance';
import { formatDistance } from '@/utils/formating';
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import ImageViewer from 'react-native-image-viewing';

type Rescue = Database['public']['Tables']['rescues']['Row'] & {
    rescues_images: Database['public']['Tables']['rescues_images']['Row'][];
    rescue_tags: { tag_name: string }[];
    distance?: number;
};

type RelatedRescue = {
    id: string;
    title: string;
    address: string;
    area: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
};

const fetchRescue = async (id: string, userLocation: UserLocation | null): Promise<Rescue | null> => {
    const { data, error } = await supabase
        .from('rescues')
        .select(`
            id,
            title,
            description,
            address,
            created_at,
            latitude,
            longitude,
            bounty,
            rescues_images (url),
            rescue_tag_assignments (rescue_tags (tag_name))
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Rescue query error:', JSON.stringify(error));
        throw new Error(`구조 요청 조회 실패: ${error.message}`);
    }

    if (!data) return null;

    const distance = userLocation && data.latitude && data.longitude
        ? calculateDistance(userLocation.latitude, userLocation.longitude, data.latitude, data.longitude)
        : null;

    return {
        ...data,
        rescues_images: data.rescues_images || [],
        rescue_tags: data.rescue_tag_assignments?.map((item: any) => item.rescue_tags) || [],
        distance,
    };
};

const fetchRelatedRescues = async (currentId: string): Promise<RelatedRescue[]> => {
    const { data, error } = await supabase
        .from('rescues')
        .select(`
            id,
            title,
            address,
            latitude,
            longitude,
            rescues_images (url)
        `)
        .neq('id', currentId)
        .limit(5);

    if (error) {
        console.error('Related rescues fetch error:', JSON.stringify(error));
        throw new Error(`관련 구조 요청 조회 실패: ${error.message}`);
    }

    return data.map((item) => ({
        id: item.id,
        title: item.title,
        address: item.address || '위치 정보 없음',
        area: item.address?.split(' ')[1] || '지역 미상',
        imageUrl: item.rescues_images?.[0]?.url || 'https://picsum.photos/700/700',
        latitude: item.latitude,
        longitude: item.longitude,
    }));
};

export default function RescuesDetailScreen() {
    const { id } = useLocalSearchParams();
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const imageScrollViewRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();
    const CARD_WIDTH = width * 0.8;
    const IMAGE_WIDTH = width;

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('위치 권한 필요', '위치 권한을 허용해야 거리 정보를 확인할 수 있습니다.');
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low,
            });
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        };
        getLocation();
    }, []);

    const { data: rescue, isLoading, error } = useQuery({
        queryKey: ['rescue', id, userLocation],
        queryFn: () => fetchRescue(id as string, userLocation),
    });

    const { data: relatedRescues } = useQuery({
        queryKey: ['relatedRescues', id],
        queryFn: () => fetchRelatedRescues(id as string),
    });

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

    const openModal = (index: number) => {
        setActiveImageIndex(index);
        setModalVisible(true);
    };

    if (isLoading) {
        return <Text className="text-neutral-600 text-center mt-8">로딩 중...</Text>;
    }

    if (error) {
        return (
            <View className="mt-8 px-6">
                <Text className="text-red-500 text-center">오류: {(error as Error).message}</Text>
                <Pressable
                    onPress={() => router.push('/home/rescue')}
                    className="mt-4 bg-orange-500 py-2 px-4 rounded-lg"
                >
                    <Text className="text-white text-center">목록으로 돌아가기</Text>
                </Pressable>
            </View>
        );
    }

    if (!rescue) {
        return <Text className="text-neutral-600 text-center mt-8">구조 요청을 찾을 수 없습니다.</Text>;
    }

    const images = (rescue.rescues_images.length > 0
        ? rescue.rescues_images.map((img) => ({ uri: img.url }))
        : [{ uri: 'https://picsum.photos/1000/1000' }]);

    const distance = rescue.distance != null ? rescue.distance : null;

    return (
        <>
            <ScrollView className="flex-1 bg-white relative" contentContainerStyle={{ paddingBottom: 100 }}>
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
                            <Pressable key={index} onPress={() => openModal(index)}>
                                <Image
                                    source={{ uri: image.uri }}
                                    className="h-[32rem] w-full"
                                    style={{ width: IMAGE_WIDTH }}
                                    resizeMode="cover"
                                    defaultSource={require('@/assets/images/9.png')}
                                />
                            </Pressable>
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
                                className={`h-2 w-2 mx-1 rounded-full ${activeImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </View>
                </View>
                <View className="px-6">
                    <View className="pt-8">
                        <View className="flex-row items-center">
                            <Fontisto name="map-marker-alt" size={14} color="#262626" />
                            <Text className="text text-neutral-800 ml-2 font-bold">{rescue.address || '위치 정보 없음'}</Text>
                            <Text className="mx-1 text-neutral-500 text-xs">•</Text>
                            <Text className="text-sm text-neutral-800">{formatDistance(distance)}</Text>
                        </View>
                        <Text className="text-2xl font-semibold text-neutral-800 mt-2" numberOfLines={2}>
                            {rescue.title}
                        </Text>
                        <Text className="font-semibold text-lg text-neutral-800 mt-2">
                            {rescue.bounty ? `${rescue.bounty.toLocaleString('ko-KR')}원` : '보상 없음'}
                        </Text>
                        <View className="flex-row flex-wrap mt-2">
                            {rescue.rescue_tags.map((tag, index) => (
                                <View key={index} className="px-3 py-1 bg-neutral-100 rounded-full mr-2 mb-2">
                                    <Text className="text-sm text-neutral-600">{tag.tag_name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View className="mt-4 border-b border-neutral-200 pb-8">
                        <Text className="text-neutral-700 leading-8">{rescue.description || '설명 없음'}</Text>
                    </View>
                    <View className="flex-row justify-between mt-8 bg-white">
                        <View className="items-center w-1/4">
                            <Ionicons name="bookmark-outline" size={26} color="#888" />
                            <Text className="text-xs text-gray-500 mt-2">북마크</Text>
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
                        snapToAlignment="start"
                        decelerationRate="fast"
                        ref={scrollViewRef}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentInset={{ right: width * 0.2 }}
                    >
                        {(relatedRescues || []).map((item, idx) => (
                            <Pressable
                                key={item.id}
                                onPress={() => router.push(`/map/rescues/${item.id}`)}
                                className="bg-white mr-4"
                                style={{ width: CARD_WIDTH }}
                            >
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    className="w-full h-44 rounded-lg"
                                    resizeMode="cover"
                                    defaultSource={require('@/assets/images/9.png')}
                                />
                                <View className="py-4">
                                    <Text className="text-lg text-neutral-800 font-bold mr-1" numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                                        <Text className="text-sm text-neutral-600 ml-1">{item.address}</Text>
                                    </View>
                                    <View className="flex-row items-center mt-2">
                                        <Text className="text-xs text-neutral-500">{item.area}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <View className="flex-row justify-center mt-4">
                        {(relatedRescues || []).map((_, index) => (
                            <View
                                key={index}
                                className={`h-2 w-2 mx-1 rounded-full ${activeIndex === index ? 'bg-neutral-800' : 'bg-neutral-300'}`}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>

            <ImageViewer
                images={images}
                imageIndex={activeImageIndex}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
                backgroundColor="rgba(0, 0, 0, 0.8)"
                doubleTapToZoom
                swipeToCloseEnabled
                FooterComponent={({ imageIndex }) => (
                    <View className="flex-row justify-center mb-10">
                        {images.map((_, index) => (
                            <View
                                key={index}
                                className={`h-2 w-2 mx-1 rounded-full ${imageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </View>
                )}
                HeaderComponent={() => (
                    <View className="flex-row justify-end pt-16 pr-4">
                        <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-white/40 rounded-full">
                            <Ionicons name="close" size={28} color="#222" />
                        </Pressable>
                    </View>
                )}
            />

            <View className="absolute bottom-10 flex items-center w-full">
                <View className="bg-orange-500 py-4 px-8 rounded-xl flex-row items-center justify-center">
                    <MaterialIcons name="message" size={24} color="white" />
                    <Text className="text-white text-lg font-bold ml-2">구조 요청자와 대화하기</Text>
                </View>
            </View>
        </>
    );
}