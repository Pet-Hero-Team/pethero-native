import { ShadowViewLight } from '@/components/ShadowViewLight';
import { RescueItemSkeleton } from '@/constants/skeletions';
import { supabase } from '@/supabase/supabase';
import { UserLocation } from '@/utils/calculateDistance';
import { formatDistance } from '@/utils/formating';
import { Fontisto, Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

const PAGE_SIZE = 10;

interface Rescue {
    id: string;
    title: string;
    description: string;
    address: string;
    created_at: string;
    distance: number | null;
    image: string | null;
    bounty: number | null;
}

const fetchRescues = async ({ pageParam = 0, sortBy = 'created_at', userLocation = null, searchQuery = '' }: {
    pageParam: number;
    sortBy: string;
    userLocation: UserLocation | null;
    searchQuery: string;
}): Promise<Rescue[]> => {
    if (!userLocation && sortBy === 'distance') {
        sortBy = 'created_at';
    }

    let query = supabase.rpc('get_rescues_with_distance', {
        user_latitude: userLocation?.latitude,
        user_longitude: userLocation?.longitude,
    });

    if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
    }

    query = query.order(sortBy === 'distance' ? 'distance' : 'created_at', { ascending: sortBy === 'distance' })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) {
        throw new Error(`구조 요청 조회 실패: ${error.message}`);
    }

    return processRescues(data, userLocation, sortBy);
};

const processRescues = (data: any[], userLocation: UserLocation | null, sortBy: string): Rescue[] => {
    const uniqueRescues = new Map<string, Rescue>();
    data.forEach(rescue => {
        if (!uniqueRescues.has(rescue.id)) {
            const image = rescue.image_url || rescue.rescues_images?.[0]?.url || null;
            const distance = userLocation && rescue.distance != null ? rescue.distance * 1000 : null;
            console.log('Rescue ID:', rescue.id);
            console.log('Raw distance (km):', rescue.distance);
            console.log('Converted distance (m):', distance);
            console.log('User Location:', userLocation);
            console.log('Rescue Coordinates:', { latitude: rescue.latitude, longitude: rescue.longitude });
            uniqueRescues.set(rescue.id, {
                id: rescue.id,
                title: rescue.title,
                description: rescue.description || '설명 없음',
                address: rescue.address || '위치 정보 없음',
                created_at: rescue.created_at,
                distance,
                image,
                bounty: rescue.bounty || null,
            });
        }
    });

    let rescues = Array.from(uniqueRescues.values());
    if (sortBy === 'distance' && userLocation) {
        rescues = rescues.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else {
        rescues = rescues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return rescues;
};

interface RescueItemProps {
    item: Rescue;
}

const RescueItem: React.FC<RescueItemProps> = ({ item }) => {
    return (
        <Pressable onPress={() => router.push(`/map/rescues/${item.id}`)}>
            <ShadowViewLight className="bg-white rounded-2xl mb-4">
                <View className="w-full h-44 bg-gray-200 rounded-t-2xl overflow-hidden">
                    <Image
                        source={{ uri: item.image || 'https://picsum.photos/seed/puppy2/800/800' }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                    <Pressable className="absolute top-3 right-3 bg-white p-2 rounded-full">
                        <Ionicons name="bookmark" size={20} color="#d5d5d5" />
                    </Pressable>
                </View>
                <View className="px-4 py-5">
                    <Text className="text-lg text-neutral-800 font-bold" numberOfLines={1}>{item.title}</Text>
                    <Text className="font-semibold text-lg text-neutral-800">
                        {item.bounty ? `${item.bounty.toLocaleString()}원` : '보상 없음'}
                    </Text>
                    <Text className="text-sm text-neutral-600 mt-2" numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View className="flex-row items-center mt-2">
                        <Fontisto name="map-marker-alt" size={12} color="#666666" />
                        <Text className="text-sm text-neutral-800 ml-2">{item.address}</Text>
                        <Text className="mx-1 text-neutral-500 text-xs">•</Text>
                        <Text className="text-sm text-neutral-800">{formatDistance(item.distance)}</Text>
                    </View>
                </View>
            </ShadowViewLight>
        </Pressable>
    );
};

const tabs = [
    { id: 'created_at', label: '최신순' },
    { id: 'distance', label: '거리순' },
];

export default function RescuesScreen() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<string>('created_at');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isSkeletonVisible, setIsSkeletonVisible] = useState(true);

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

    const { data, fetchNextPage, hasNextPage, isLoading, error, refetch } = useInfiniteQuery<Rescue[], Error>({
        queryKey: ['rescues', activeTab, userLocation, searchQuery],
        queryFn: ({ pageParam }) => fetchRescues({ pageParam, sortBy: activeTab, userLocation, searchQuery }),
        getNextPageParam: (lastPage) => (lastPage.length === PAGE_SIZE ? lastPage.length : undefined),
        initialPageParam: 0,
        enabled: activeTab !== 'distance' || !!userLocation,
    });

    useEffect(() => {
        if (userLocation && activeTab === 'distance') {
            refetch();
        }
    }, [userLocation, activeTab, refetch]);

    useEffect(() => {
        if (isLoading) {
            setIsSkeletonVisible(true);
            const timer = setTimeout(() => {
                setIsSkeletonVisible(false);
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setIsSkeletonVisible(false);
        }
    }, [isLoading]);

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY + event.nativeEvent.layoutMeasurement.height >= event.nativeEvent.contentSize.height - 50 && hasNextPage) {
            fetchNextPage();
        }
    };

    const rescues = data?.pages.flat() || [];

    return (
        <SafeAreaView className="flex-1">
            <ScrollView
                className="px-6 py-4"
                contentContainerStyle={{ paddingBottom: 80 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View className="pb-4 flex-row items-center justify-center mb-4">
                    {isSearchVisible ? (
                        <View className="flex-1 flex-row items-center justify-center">
                            <View className="flex-1 flex-row items-center border rounded-full border-neutral-200 bg-white px-6 py-4">
                                <Ionicons name="search" size={18} color="black" />
                                <TextInput
                                    className="flex-1 pl-3"
                                    placeholder="제목 / 지역 등으로 검색해주세요"
                                    autoFocus
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                <Pressable onPress={() => setIsSearchVisible(false)}>
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
                                    {tabs.map((tab) => (
                                        <Pressable
                                            key={tab.id}
                                            onPress={() => setActiveTab(tab.id)}
                                            className={`px-5 py-3 border rounded-full border-neutral-200 bg-white mr-1 ${activeTab === tab.id ? 'bg-neutral-100' : ''}`}
                                            disabled={tab.id === 'distance' && !userLocation}
                                        >
                                            <Text className={activeTab === tab.id ? 'font-semibold' : ''}>{tab.label}</Text>
                                        </Pressable>
                                    ))}
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
                {(isLoading || isSkeletonVisible) ? (
                    <View>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <RescueItemSkeleton key={index} />
                        ))}
                    </View>
                ) : error ? (
                    <View className="mt-8 px-6">
                        <Text className="text-red-500 text-center">오류: {error.message}</Text>
                        <Pressable
                            onPress={() => refetch()}
                            className="mt-4 bg-orange-500 py-2 px-4 rounded-lg"
                        >
                            <Text className="text-white text-center">재시도</Text>
                        </Pressable>
                    </View>
                ) : rescues.length === 0 ? (
                    <Text className="text-neutral-600 text-center mt-8">구조 요청이 없습니다.</Text>
                ) : (
                    rescues.map((item) => <RescueItem key={item.id} item={item} />)
                )}
            </ScrollView>
            <Pressable
                onPress={() => router.push('/home/rescue/explanation')}
                className="absolute bottom-5 right-5 bg-orange-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
                <Ionicons name="add" size={24} color="white" />
            </Pressable>
        </SafeAreaView>
    );
}


