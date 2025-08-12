
import CallModal from '@/components/CallModal';
import MapModal from '@/components/MapModal';
import { Database } from '@/supabase/database.types';
import { supabase } from '@/supabase/supabase';
import { Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import ImageViewer from 'react-native-image-viewing';
import Toast from 'react-native-toast-message';

type Report = Database['public']['Tables']['reports']['Row'] & {
    reports_images: Database['public']['Tables']['reports_images']['Row'][];
};

type RelatedReport = {
    id: string;
    title: string;
    address: string;
    area: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
};

// 제보 상세 정보 불러오기
const fetchReport = async (id: string): Promise<Report | null> => {
    const { data, error } = await supabase
        .from('reports')
        .select(`
            id,
            title,
            description,
            address,
            latitude,
            longitude,
            created_at,
            animal_type,
            sighting_type,
            reports_images (url)
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('Report fetch error:', error);
        throw new Error(`제보 조회 실패: ${error.message}`);
    }
    return data;
};

// 관련 제보 목록 불러오기
const fetchRelatedReports = async (currentId: string): Promise<RelatedReport[]> => {
    const { data, error } = await supabase
        .from('reports')
        .select(`
            id,
            title,
            address,
            latitude,
            longitude,
            reports_images (url)
        `)
        .neq('id', currentId)
        .limit(5);

    if (error) {
        console.error('Related reports fetch error:', error);
        throw new Error(`관련 제보 조회 실패: ${error.message}`);
    }

    return data.map((item) => ({
        id: item.id,
        title: item.title,
        address: item.address || '위치 정보 없음',
        area: item.address?.split(' ')[1] || '지역 미상',
        imageUrl: item.reports_images?.[0]?.url || 'https://picsum.photos/700/700',
        latitude: item.latitude,
        longitude: item.longitude,
    }));
};

export default function RescuesDetailScreen() {
    const { id } = useLocalSearchParams();
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const imageScrollViewRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();
    const CARD_WIDTH = width * 0.8;
    const IMAGE_WIDTH = width;

    const [isMapModalVisible, setMapModalVisible] = useState(false);
    const [isCallModalVisible, setCallModalVisible] = useState(false);
    const [generatedPhoneNumber, setGeneratedPhoneNumber] = useState('');

    const { data: report, isLoading, error } = useQuery({
        queryKey: ['report', id],
        queryFn: () => fetchReport(id as string),
    });

    const { data: relatedReports } = useQuery({
        queryKey: ['relatedReports', id],
        queryFn: () => fetchRelatedReports(id as string),
    });

    // [FIX#1] 모달 상태 관리 로직 수정: 하나의 모달을 열 때 다른 모달은 닫히도록 하여 충돌 및 중복 클릭 문제 해결
    const handleLocationPress = () => {
        setCallModalVisible(false);
        setMapModalVisible(true);
    };

    const handleCallPress = () => {
        const phone = `010-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`;
        setGeneratedPhoneNumber(phone);
        setMapModalVisible(false);
        setCallModalVisible(true);
    };

    const handleSharePress = async () => {
        if (Platform.OS === 'web') {
            Toast.show({
                type: 'info',
                text1: '웹 환경에서는 공유 기능을 지원하지 않습니다.',
            });
            return;
        }

        try {
            if (await Sharing.isAvailableAsync()) {
                const shareContent = {
                    message: `[실종동물 제보] ${report?.title || '제보'}를 공유합니다.`,
                    url: `https://your-app-url.com/reports/${id}`,
                    title: report?.title || '실종동물 제보',
                };
                await Sharing.shareAsync(shareContent.url, shareContent);
            } else {
                Toast.show({
                    type: 'error',
                    text1: '공유 기능을 사용할 수 없습니다.',
                });
            }
        } catch (e) {
            console.error('Sharing failed:', e);
            Toast.show({
                type: 'error',
                text1: '공유 중 오류가 발생했습니다.',
            });
        }
    };

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

    const openImageViewer = (index: number) => {
        setActiveImageIndex(index);
        setImageViewerVisible(true);
    };

    if (isLoading) {
        return <Text className="text-neutral-600 text-center mt-8">로딩 중...</Text>;
    }

    if (error) {
        return <Text className="text-red-500 text-center mt-8">오류: {(error as Error).message}</Text>;
    }

    if (!report) {
        return <Text className="text-neutral-600 text-center mt-8">제보를 찾을 수 없습니다.</Text>;
    }

    const images = (report.reports_images.length > 0
        ? report.reports_images.map((img) => ({ uri: img.url }))
        : [{ uri: 'https://picsum.photos/1000/1000' }]);

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
                            <Pressable key={index} onPress={() => openImageViewer(index)}>
                                <Image
                                    source={{ uri: image.uri }}
                                    className="h-[32rem] w-full"
                                    style={{ width: IMAGE_WIDTH }}
                                    resizeMode="cover"
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
                            <Text className="text text-neutral-800 ml-2 font-bold">{report.address}</Text>
                        </View>
                        <Text className="text-2xl font-semibold text-neutral-800 mt-2" numberOfLines={2}>
                            {report.title}
                        </Text>
                    </View>
                    <View className="mt-4 border-b border-neutral-200 pb-8">
                        <Text className="text-neutral-700 leading-8">{report.description || '설명 없음'}</Text>
                    </View>
                    <View className="flex-row justify-between mt-8 bg-white">
                        <View className="items-center w-1/4">
                            <Ionicons name="bookmark-outline" size={26} color="#888" />
                            <Text className="text-xs text-gray-500 mt-2">북마크</Text>
                        </View>
                        <View className="h-8 border-l border-gray-200" />
                        <Pressable className="items-center w-1/4" onPress={handleLocationPress}>
                            <Ionicons name="location-outline" size={26} color="#888" />
                            <Text className="text-xs text-gray-500 mt-2">위치</Text>
                        </Pressable>
                        <View className="h-8 border-l border-gray-200" />
                        <Pressable className="items-center w-1/4" onPress={handleCallPress}>
                            <Ionicons name="call-outline" size={26} color="#888" />
                            <Text className="text-xs text-gray-500 mt-2">전화</Text>
                        </Pressable>
                        <View className="h-8 border-l border-gray-200" />
                        <Pressable className="items-center w-1/4" onPress={handleSharePress}>
                            <Ionicons name="share-social-outline" size={26} color="#888" />
                            <Text className="text-xs text-gray-500 mt-2">공유</Text>
                        </Pressable>
                    </View>
                </View>
                <View className="px-6 mt-8 pb-36">
                    <Text className="text-xl font-bold text-neutral-800">관련 제보</Text>
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
                        contentOffset={{ x: 0, y: 0 }}
                    >
                        {(relatedReports || []).map((item) => (
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
                        {(relatedReports || []).map((_, index) => (
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
                visible={imageViewerVisible}
                onRequestClose={() => setImageViewerVisible(false)}
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
                        <Pressable onPress={() => setImageViewerVisible(false)} className="p-2 bg-white/40 rounded-full">
                            <Ionicons name="close" size={28} color="#222" />
                        </Pressable>
                    </View>
                )}
            />
            <MapModal
                isVisible={isMapModalVisible}
                onClose={() => setMapModalVisible(false)}
                reportLocation={report}
            />
            <CallModal
                isVisible={isCallModalVisible}
                onClose={() => setCallModalVisible(false)}
                phoneNumber={generatedPhoneNumber}
            />
            <View className="absolute bottom-10 flex items-center w-full">
                <View className="bg-orange-500 py-4 px-8 rounded-xl flex-row items-center justify-center">
                    <MaterialIcons name="message" size={24} color="white" />
                    <Text className="text-white text-lg font-bold ml-2">제보자와 대화하기</Text>
                </View>
            </View>
        </>
    );
}