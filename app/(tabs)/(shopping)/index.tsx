import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const PAGE_SIZE = 10;

const fetchProducts = async ({ pageParam = 0, queryKey }) => {
    const [_key, category] = queryKey;
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase.from('products').select('*');
    if (category !== 'all') {
        query = query.eq('category', category);
    }
    const { data, error } = await query.order('created_at', { ascending: false }).range(from, to);
    if (error) throw new Error(error.message);
    return { data, nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined };
};

const fetchRecommendedProducts = async (petId: string) => {
    if (!petId) return [];
    const { data, error } = await supabase.rpc('get_recommended_products_for_pet', { p_pet_id: petId });
    if (error) {
        console.error("추천 상품 조회 실패:", error.message);
        return [];
    }
    return data;
};

const fetchUserPet = async (userId: string) => {
    if (!userId) return null;
    const { data, error } = await supabase
        .from('pets')
        .select('id, breed_id, animal_breeds(breed_name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);
    if (error) {
        console.error("사용자 펫 정보 조회 실패:", error.message);
        return null;
    }
    return data?.[0] || null;
}

const ProductCard = ({ product, isHorizontal = false }) => (
    <Pressable className={isHorizontal ? 'w-40' : 'w-1/2 p-2'}>
        <View className="flex-1">
            <Image
                source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                className="w-full aspect-square rounded-lg bg-gray-100"
                resizeMode="cover"
            />
            <View className="pt-2 px-1">
                <Text className="text-sm font-medium text-neutral-800" numberOfLines={2}>{product.name}</Text>
                <Text className="text-base font-bold text-neutral-900 mt-1">{product.price.toLocaleString()}원</Text>
            </View>
        </View>
    </Pressable>
);

const CATEGORIES = [
    { key: 'all', label: '쇼핑홈' },
    { key: 'supplement', label: '영양제' },
    { key: 'food', label: '사료/간식' },
    { key: 'toy', label: '장난감/용품' },
];

export default function ShoppingScreen() {
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('all');

    const { data: userPet } = useQuery({
        queryKey: ['userPet', user?.id],
        queryFn: () => fetchUserPet(user?.id),
        enabled: !!user,
    });

    const { data: recommendedProducts = [], isLoading: isLoadingRecs } = useQuery({
        queryKey: ['recommendedProducts', userPet?.id],
        queryFn: () => fetchRecommendedProducts(userPet.id),
        enabled: !!userPet,
    });

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingAll,
        error,
    } = useInfiniteQuery({
        queryKey: ['products', activeCategory],
        queryFn: fetchProducts,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const products = data?.pages.flatMap(page => page.data) ?? [];

    // ⭐️ 1. ScrollView를 위한 무한 스크롤 핸들러
    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    if (isLoadingAll && !data) {
        return <SafeAreaView className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></SafeAreaView>;
    }

    if (error) {
        return <SafeAreaView className="flex-1 justify-center items-center"><Text>오류가 발생했습니다: {error.message}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 pt-4 bg-white">
                <View className="flex-row items-center justify-end space-x-4 mb-3">
                    <Ionicons name="search-outline" size={24} color="black" />
                    <Ionicons name="person-outline" size={24} color="black" />
                    <Ionicons name="cart-outline" size={26} color="black" />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
                    {CATEGORIES.map(category => (
                        <TouchableOpacity
                            key={category.key}
                            onPress={() => setActiveCategory(category.key)}
                            className="px-4 py-2 items-center justify-center"
                        >
                            <Text className={`text-lg ${activeCategory === category.key ? 'font-bold text-black' : 'font-medium text-neutral-500'}`}>
                                {category.label}
                            </Text>
                            {activeCategory === category.key && (
                                <View className="w-full h-0.5 bg-black mt-1" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ⭐️ 2. 메인 컨테이너를 FlatList에서 ScrollView로 변경 */}
            <ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ backgroundColor: '#f5f5f5' }}
            >
                {/* 맞춤 추천 섹션 */}
                {activeCategory === 'all' && (isLoadingRecs ? (
                    <ActivityIndicator className="my-8" />
                ) : recommendedProducts.length > 0 && (
                    <View className="mb-6 bg-white p-4">
                        <Text className="text-xl font-bold text-neutral-800 mb-3">{userPet?.animal_breeds?.breed_name || '비슷한 친구'}들이 많이 찾아요 👀</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {recommendedProducts.map(product => (
                                <ProductCard key={product.id} product={product} isHorizontal={true} />
                            ))}
                        </ScrollView>
                    </View>
                ))}

                <Text className="text-xl font-bold text-neutral-800 my-4 px-4">전체 상품</Text>

                {/* ⭐️ 3. '전체 상품'을 flexWrap을 이용한 그리드로 직접 렌더링 */}
                <View className="flex-row flex-wrap px-2">
                    {products.map(item => (
                        <ProductCard product={item} key={item.id} />
                    ))}
                </View>

                {isFetchingNextPage && <ActivityIndicator size="large" className="my-4" />}
            </ScrollView>
        </SafeAreaView>
    );
}