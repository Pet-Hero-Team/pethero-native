import { ShadowView } from '@/components/ShadowView';
import { ReportItemSkeleton } from '@/constants/skeletions';
import { supabase } from '@/supabase/supabase';
import { calculateDistance, UserLocation } from '@/utils/calculateDistance';
import { formatDistance } from '@/utils/formating';
import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import * as Location from 'expo-location';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PAGE_SIZE = 10;
const MAX_DISTANCE_KM = 5;

interface Report {
    id: string;
    title: string;
    description: string;
    address: string;
    created_at: string;
    distance: number | null;
    image: string | null;
}

const fetchReports = async ({ pageParam = 0, sortBy = 'created_at', userLocation = null }: {
    pageParam: number;
    sortBy: string;
    userLocation: UserLocation | null;
}): Promise<Report[]> => {

    const params = userLocation ? {
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
        radius_meters: MAX_DISTANCE_KM * 1000 // 5km를 미터(m) 단위로 변환하여 추가
    } : {};

    let query;
    if (userLocation && sortBy === 'distance') {
        query = supabase.rpc('get_reports_in_radius', params);
    } else {
        query = supabase.from('reports').select(`
            id,
            title,
            description,
            address,
            created_at,
            latitude,
            longitude,
            reports_images:reports_images!left(url)
        `);
    }

    query = query.order(sortBy === 'distance' && userLocation ? 'distance' : 'created_at', { ascending: sortBy === 'distance' })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);

    const { data, error } = await query;
    if (error) {
        console.error('Query error:', JSON.stringify(error));
        console.warn('Falling back to direct query due to RPC failure');
        query = supabase.from('reports').select(`
            id,
            title,
            description,
            address,
            created_at,
            latitude,
            longitude,
            reports_images:reports_images!left(url)
        `).order('created_at', { ascending: false })
            .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1);
        const { data: fallbackData, error: fallbackError } = await query;
        if (fallbackError) {
            console.error('Fallback query error:', JSON.stringify(fallbackError));
            throw new Error(`제보 조회 실패: ${fallbackError.message}`);
        }
        return processReports(fallbackData, userLocation, sortBy);
    }

    return processReports(data, userLocation, sortBy);
};

const processReports = (data: any[], userLocation: UserLocation | null, sortBy: string): Report[] => {
    const uniqueReports = new Map<string, Report>();
    data.forEach(report => {
        if (!uniqueReports.has(report.id)) {
            const image = userLocation && report.image_url
                ? report.image_url
                : report.reports_images?.[0]?.url || null;
            const distance = userLocation && report.latitude && report.longitude
                ? calculateDistance(userLocation.latitude, userLocation.longitude, report.latitude, report.longitude)
                : userLocation && report.distance != null
                    ? report.distance
                    : null;
            if (!userLocation || distance == null || distance <= MAX_DISTANCE_KM) {
                uniqueReports.set(report.id, {
                    id: report.id,
                    title: report.title,
                    description: report.description || '설명 없음',
                    address: report.address || '위치 정보 없음',
                    created_at: report.created_at,
                    distance: distance != null ? Math.round(distance * 1000) : null,
                    image,
                });
            }
        }
    });

    let reports = Array.from(uniqueReports.values());
    if (sortBy === 'distance' && userLocation) {
        reports = reports.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
        reports = reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return reports;
};

const formatTimeAgo = (date: string): string => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
};

interface ReportItemProps {
    item: Report;
}

const ReportItem: React.FC<ReportItemProps> = ({ item }) => {
    return (
        <Pressable onPress={() => router.push(`/map/reports/${item.id}`)}>
            <View className="flex-row justify-between px-6 mt-8">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-neutral-800">{item.title}</Text>
                    <Text className="leading-6 text-neutral-500 mt-1 text-sm" numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View className='flex-row items-center mt-2'>
                        <Text className="text-xs text-neutral-400">{formatTimeAgo(item.created_at)}</Text>
                        <Text className="text-xs text-neutral-400 ml-1">· {formatDistance(item.distance)}</Text>
                    </View>
                    <View className="flex-row items-center mt-4 space-x-2">
                        <View className="flex-row items-center bg-neutral-100 px-2 py-1 rounded-md">
                            <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                            <Text className="text-xs text-neutral-600 ml-1">{item.address}</Text>
                        </View>
                    </View>
                </View>
                <Image
                    source={{ uri: item.image || 'https://picsum.photos/seed/puppy4/400/400' }}
                    className="size-28 rounded-2xl ml-4"
                    resizeMode="cover"
                />
            </View>
        </Pressable>
    );
};


const tabs = [
    { id: 'latest', label: '최신순' },
    { id: 'distance', label: '거리순' },
];

export default function ReportsScreen() {
    const [activeTab, setActiveTab] = useState<string>('latest');
    const [scrolled, setScrolled] = useState<boolean>(false);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const topSectionRef = useRef<View>(null);
    const [topSectionHeight, setTopSectionHeight] = useState<number>(0);

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('위치 권한 필요', '위치 권한을 허용해야 근처 제보를 확인할 수 있습니다.');
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

    const { data, fetchNextPage, hasNextPage, isLoading, error, refetch } = useInfiniteQuery<Report[], Error>({
        queryKey: ['reports', activeTab, userLocation],
        queryFn: ({ pageParam }) => fetchReports({ pageParam, sortBy: activeTab, userLocation }),
        getNextPageParam: (lastPage) => (lastPage.length === PAGE_SIZE ? lastPage.length : undefined),
        initialPageParam: 0,
    });

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrolled(offsetY > topSectionHeight);
        if (offsetY + event.nativeEvent.layoutMeasurement.height >= event.nativeEvent.contentSize.height - 50 && hasNextPage) {
            fetchNextPage();
        }
    };

    const handleLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        setTopSectionHeight(height);
    };

    const reports = data?.pages.flat() || [];

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <View className={`px-6 py-3 transition-colors duration-100 ${scrolled ? 'bg-white' : 'bg-slate-100'}`}>
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Ionicons name="chevron-back" size={28} color="#222" />
                    </Pressable>
                    <Link href="/home/report/report">
                        <MaterialCommunityIcons name="pencil-box-multiple-outline" size={30} color="#222" />
                    </Link>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View
                    className="bg-slate-100 pt-8 pb-14 px-9 flex-row items-center"
                    onLayout={handleLayout}
                    ref={topSectionRef}
                >
                    <Image
                        source={require('@/assets/images/2.png')}
                        className="size-16"
                        resizeMode="contain"
                    />
                    <View className="ml-6 flex-1">
                        <Text className="text-lg text-orange-500 font-bold">실제 유저가 올린</Text>
                        <Text className="text-2xl font-bold">실시간 목격현황을 확인하세요</Text>
                    </View>
                </View>

                <ShadowView className="bg-white flex-1 rounded-3xl pb-12">
                    <View className="flex-row justify-between mt-3">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                className="flex-1 py-3 items-center"
                            >
                                <Text className={`text-base ${activeTab === tab.id ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                                    {tab.label}
                                </Text>
                                {activeTab === tab.id && (
                                    <View className="w-6 h-0.5 bg-neutral-800 mt-1" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    {isLoading ? (
                        <View>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <ReportItemSkeleton key={index} />
                            ))}
                        </View>
                    ) : error ? (
                        <View className="mt-8 px-6">
                            <Text className="text-red-500 text-center">오류: {error.message}</Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-4 bg-orange-500 py-2 px-4 rounded-lg"
                            >
                                <Text className="text-white text-center">재시도</Text>
                            </TouchableOpacity>
                        </View>
                    ) : reports.length === 0 ? (
                        <Text className="text-neutral-600 text-center mt-8">근처 제보가 없습니다.</Text>
                    ) : (
                        reports.map((item) => <ReportItem key={item.id} item={item} />)
                    )}
                </ShadowView>
            </ScrollView>
        </SafeAreaView>
    );
}