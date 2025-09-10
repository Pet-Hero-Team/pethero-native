import { ShadowView } from '@/components/ShadowView';
import { supabase } from '@/supabase/supabase';
import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, Text, View } from 'react-native';

const PAGE_SIZE = 10; // 한 번에 불러올 상품 개수

// Supabase에서 상품 목록을 '페이지' 단위로 불러오는 함수
const fetchProducts = async ({ pageParam = 0 }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return { data, nextPage: data.length === PAGE_SIZE ? pageParam + 1 : undefined };
};

const ProductCard = ({ product }) => (
    <Pressable className="w-1/2 p-2">
        <ShadowView className="bg-white rounded-xl overflow-hidden">
            <Image
                source={{ uri: product.image_url || 'https://via.placeholder.com/150' }}
                className="w-full h-40"
                resizeMode="cover"
            />
            <View className="p-3">
                <Text className="text-sm text-neutral-500" numberOfLines={1}>{product.description}</Text>
                <Text className="text-base font-bold text-neutral-800 mt-1" numberOfLines={2}>{product.name}</Text>
                {/* TODO: 나중에 할인율, 별점 등의 데이터를 추가할 수 있습니다. */}
                <Text className="text-lg font-extrabold text-neutral-900 text-right mt-2">{product.price.toLocaleString()}원</Text>
            </View>
        </ShadowView>
    </Pressable>
);

export default function ShoppingScreen() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const products = data?.pages.flatMap(page => page.data) ?? [];

    const loadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    if (isLoading) {
        return <SafeAreaView className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></SafeAreaView>;
    }

    if (error) {
        return <SafeAreaView className="flex-1 justify-center items-center"><Text>오류가 발생했습니다: {error.message}</Text></SafeAreaView>;
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-row items-center justify-center px-4 pb-4 pt-4 border-b border-gray-200 bg-white">
                <Text className="text-lg font-bold">맞춤 스토어</Text>
            </View>

            <FlatList
                data={products}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={item => item.id}
                numColumns={2} // ⭐️ 2열 그리드 레이아웃 설정
                contentContainerStyle={{ padding: 6 }}
                onEndReached={loadMore} // ⭐️ 스크롤이 끝에 닿으면 다음 페이지 로드
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="large" className="my-4" /> : null}
            />
        </SafeAreaView>
    );
}