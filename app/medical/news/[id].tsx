import { ShadowView } from '@/components/ShadowView';
import { supabase } from '@/supabase/supabase';
import { formatTimeAgo } from '@/utils/formating';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

const fetchNewsDetail = async (id: string) => {
    const { data, error } = await supabase
        .from('pet_news')
        .select('id, created_at, title, content, main_image_url')
        .eq('id', id)
        .single();

    if (error) {
        console.error('뉴스 상세 데이터 조회 실패:', error);
        throw new Error('뉴스 상세 정보를 불러오는 데 실패했습니다.');
    }
    return data;
};

const fetchRelatedNews = async () => {
    const { data, error } = await supabase
        .from('pet_news')
        .select('id, title, created_at, main_image_url')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('관련 뉴스 데이터 조회 실패:', error);
        return [];
    }
    return data;
};

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams();

    const { data: newsDetail, isLoading, error } = useQuery({
        queryKey: ['newsDetail', id],
        queryFn: () => fetchNewsDetail(id as string),
        enabled: !!id,
    });

    const { data: relatedNews = [] } = useQuery({
        queryKey: ['relatedNews'],
        queryFn: fetchRelatedNews,
    });

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#0d9488" />
                <Text className="mt-4 text-lg font-semibold text-gray-800">뉴스 상세 정보를 불러오는 중...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <Text className="text-lg font-semibold text-red-500">오류: {(error as Error).message}</Text>
            </SafeAreaView>
        );
    }

    if (!newsDetail) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white">
                <Text className="text-lg font-semibold text-gray-800">뉴스를 찾을 수 없습니다.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 pb-4 pt-4 ">
                <Pressable onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={28} color="#222" />
                </Pressable>
            </View>
            <ScrollView>
                <View className="px-6">
                    <Text className="text-2xl font-extrabold text-neutral-900 mt-8">{newsDetail.title}</Text>
                    <Text className="text-neutral-500 mt-2">{formatTimeAgo(newsDetail.created_at)}</Text>
                </View>
                <View className='mt-8 px-6'>
                    {newsDetail.main_image_url && (
                        <Image
                            source={{ uri: newsDetail.main_image_url }}
                            className="w-full h-96 rounded-xl overflow-hidden"
                            resizeMode="cover"
                        />
                    )}
                </View>
                <ShadowView className='bg-white px-6 pt-10 pb-10' >
                    <Text style={{ fontSize: 16 }} className='leading-8 font-medium text-neutral-800'>
                        {newsDetail.content}
                    </Text>
                </ShadowView>
                <View className='w-full bg-neutral-100 h-6'></View>
                <View className="bg-white pt-12 ">
                    <View className='px-6 mb-12'>
                        <Text className="text-2xl font-extrabold text-neutral-900 mb-8">관련 소식</Text>
                        {relatedNews.map((item, idx) => (
                            <Link href={`/medical/news/${item.id}`} key={item.id} asChild>
                                <Pressable>
                                    <View
                                        className={`flex-row items-center justify-between ${idx < relatedNews.length - 1 ? 'mb-6' : ''}`}
                                    >
                                        <View className="flex-1 pr-8">
                                            <Text className="text-neutral-700 font-semibold text-lg mb-2 leading-6" numberOfLines={2}>
                                                {item.title}
                                            </Text>
                                            <Text className="text-neutral-500 text-sm">
                                                {formatTimeAgo(item.created_at)}
                                            </Text>
                                        </View>
                                        <Image
                                            source={{ uri: item.main_image_url }}
                                            className="size-24 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    </View>
                                </Pressable>
                            </Link>
                        ))}
                    </View>
                    <Link href={"/medical/news/news"} asChild>
                        <Pressable>
                            <View className='border-t border-t-neutral-100 pt-6 pb-3 w-full'>
                                <View className='flex-row items-center justify-center ml-2'>
                                    <Text className='text-center text-base text-neutral-600 mr-1'>더보기</Text>
                                    <AntDesign name="right" size={12} color="#6c6c6c" />
                                </View>
                            </View>
                        </Pressable>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}