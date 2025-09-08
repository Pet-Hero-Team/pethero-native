import { ShadowView } from '@/components/ShadowView';
import React from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

// --- 임시 데이터 ---
const DUMMY_PRODUCTS = [
    { id: '1', name: '튼튼 관절 영양제', price: 25000, image_url: 'https://lythjphzcucyhjobjbcq.supabase.co/storage/v1/object/public/rescues/dog_supplement.png', description: '슬개골과 관절 건강에 도움을 줍니다.' },
    { id: '2', name: '반짝 피부 오메가-3', price: 22000, image_url: 'https://lythjphzcucyhjobjbcq.supabase.co/storage/v1/object/public/rescues/dog_supplement.png', description: '윤기나는 피모를 만들어보세요.' },
    { id: '3', name: '튼튼 캥거루 뼈다귀', price: 8000, image_url: 'https://lythjphzcucyhjobjbcq.supabase.co/storage/v1/object/public/rescues/dog_running.png', description: '스트레스 해소와 치석 제거에 효과적입니다.' }
];

const ProductCard = ({ product }) => (
    <ShadowView className="bg-white rounded-xl p-4 mb-4">
        <Image source={{ uri: product.image_url }} className="w-full h-32 rounded-lg" resizeMode="cover" />
        <Text className="text-lg font-bold mt-3">{product.name}</Text>
        <Text className="text-neutral-500 mt-1">{product.description}</Text>
        <Text className="text-xl font-bold text-right mt-2">{product.price.toLocaleString()}원</Text>
    </ShadowView>
);

export default function ShoppingScreen() {
    const isLoading = false;
    const products = DUMMY_PRODUCTS;
    const recommendedProducts = [DUMMY_PRODUCTS[2]];

    if (isLoading) {
        return <SafeAreaView className="flex-1 justify-center items-center"><ActivityIndicator size="large" /></SafeAreaView>;
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-row items-center justify-center px-4 pb-4 pt-4 border-b border-gray-200 bg-white">
                <Text className="text-lg font-bold">맞춤 스토어</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View className="mb-8">
                    <Text className="text-xl font-bold text-neutral-800 mb-4">포메라니안 친구들이 많이 찾아요 👀</Text>
                    {recommendedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </View>

                <View className="w-full h-px bg-gray-200 my-4" />

                <View>
                    <Text className="text-xl font-bold text-neutral-800 mb-4">전체 상품 둘러보기</Text>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}