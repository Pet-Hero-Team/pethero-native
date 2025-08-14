import { supabase } from '@/supabase/supabase';
import { formatTimeAgo } from '@/utils/formating';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const PAGE_SIZE = 10;

const fetchNews = async ({ pageParam = 0 }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
        .from('pet_news')
        .select('id, title, created_at, type, main_image_url')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('뉴스 데이터 조회 실패:', error);
        throw new Error('뉴스 데이터 조회에 실패했습니다.');
    }

    return {
        data,
        nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined,
    };
};

const NewsItem = ({ item }) => (
    <Link href={`/medical/news/${item.id}`} key={item.id} asChild>
        <Pressable className='w-full'>
            <View className="flex-row items-center justify-between py-6 px-6 border-b border-neutral-100">
                <View className="flex-1 pr-6">
                    <View className="bg-neutral-100 py-1 px-2 rounded-lg self-start mb-2">
                        <Text className="text-xs font-semibold text-neutral-600">{item.type}</Text>
                    </View>
                    <Text className="text-neutral-700 font-bold text-lg mb-1 leading-6" numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text className="text-neutral-500 text-sm">
                        {formatTimeAgo(item.created_at)}
                    </Text>
                </View>
                {item.main_image_url && (
                    <Image
                        source={{ uri: item.main_image_url }}
                        className="size-24 rounded-lg"
                        resizeMode="cover"
                    />
                )}
            </View>
        </Pressable>
    </Link>
);

const NewsListSkeleton = () => {
    return (
        <SkeletonPlaceholder
            backgroundColor="#e5e7eb"
            highlightColor="#f3f4f6"
            speed={1000}
        >
            {Array.from({ length: 5 }).map((_, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 24, paddingHorizontal: 24, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                    <View style={{ flex: 1, marginRight: 24 }}>
                        <View style={{ width: 60, height: 20, borderRadius: 8, marginBottom: 8 }} />
                        <View style={{ width: '100%', height: 20, borderRadius: 4, marginBottom: 8 }} />
                        <View style={{ width: '60%', height: 12, borderRadius: 4 }} />
                    </View>
                    <View style={{ width: 96, height: 96, borderRadius: 8 }} />
                </View>
            ))}
        </SkeletonPlaceholder>
    );
};

export default function NewsScreen() {
    const scrollViewRef = useRef<ScrollView>(null);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['newsInfinite'],
        queryFn: fetchNews,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const news = data?.pages.flatMap(page => page.data) || [];

    const handleScroll = useCallback(() => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

    const handleMomentumScrollEnd = useCallback((event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
        if (isCloseToBottom) {
            handleScroll();
        }
    }, [handleScroll]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="px-6 bg-white">
                    <View className="flex-row items-center justify-center relative">
                        <Pressable onPress={() => router.back()} hitSlop={12} className="absolute left-0">
                            <Ionicons name="chevron-back" size={28} color="#222" />
                        </Pressable>
                        <Text className="text-xl font-extrabold text-neutral-900 mt-8 mb-6 text-center">애완 소식지</Text>
                    </View>
                </View>
                <NewsListSkeleton />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-lg font-semibold text-red-500">오류: {(error as Error).message}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 bg-white">
                <View className="flex-row items-center justify-center relative">
                    <Pressable onPress={() => router.back()} hitSlop={12} className="absolute left-0">
                        <Ionicons name="chevron-back" size={28} color="#222" />
                    </Pressable>
                    <Text className="text-xl font-extrabold text-neutral-900 mt-8 mb-6 text-center">애완 소식지</Text>
                </View>
            </View>
            <ScrollView
                ref={scrollViewRef}
                className="flex-1 bg-white"
                onMomentumScrollEnd={handleMomentumScrollEnd}
            >
                {news.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-lg font-semibold text-gray-800">소식이 없습니다.</Text>
                    </View>
                ) : (
                    news.map((item) => (
                        <NewsItem item={item} key={item.id} />
                    ))
                )}
                {isFetchingNextPage && (
                    <View className="py-8">
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}