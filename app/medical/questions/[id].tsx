import { ShadowViewLight } from '@/components/ShadowViewLight';
import { AnswerSkeleton, QuestionDetailSkeleton, RelatedQuestionSkeleton } from '@/constants/skeletions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { formatTimeAgo, getAnimalTypeLabel, getTreatmentLabel } from '@/utils/formating';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface Question {
    id: string;
    user_id: string;
    title: string;
    description: string;
    animal_type: string;
    created_at: string;
    images: { url: string }[];
    disease_tag: { tag_name: string };
}

interface RelatedQuestion {
    id: string;
    title: string;
    description: string;
    animal_type: string;
    created_at: string;
    image: string | null;
    disease_tag: string;
}

const fetchRelatedQuestions = async (diseaseTag: string, currentQuestionId: string) => {
    const { data, error } = await supabase
        .from('pet_questions')
        .select(`
      id,
      title,
      description,
      animal_type,
      created_at,
      pet_question_images (url),
      pet_question_disease_tags (
        disease_tags (tag_name)
      )
    `)
        .eq('pet_question_disease_tags.disease_tags.tag_name', diseaseTag)
        .neq('id', currentQuestionId)
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) throw new Error(`유사 질문 조회 실패: ${error.message}`);

    return data.map((question: any) => ({
        id: question.id,
        title: question.title,
        description: question.description || '설명 없음',
        animal_type: getAnimalTypeLabel(question.animal_type),
        created_at: question.created_at,
        image: question.pet_question_images?.[0]?.url || null,
        disease_tag: getTreatmentLabel(question.pet_question_disease_tags?.[0]?.disease_tags?.tag_name || '미지정'),
    }));
};





export default function QuestionsDetailScreen() {
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { data: relatedQuestions = [], isLoading: isRelatedLoading } = useQuery({
        queryKey: ['relatedQuestions', question?.disease_tag.tag_name, id],
        queryFn: () => fetchRelatedQuestions(question?.disease_tag.tag_name || '미지정', id as string),
        enabled: !!question && !!id,
    });


    useEffect(() => {
        const fetchQuestion = async () => {
            if (!user) {
                Toast.show({
                    type: 'error',
                    text1: '오류',
                    text2: '로그인이 필요합니다.',
                    position: 'top',
                    visibilityTime: 3000,
                });
                router.replace('/auth/signin');
                return;
            }

            try {
                setIsLoading(true);
                const { data, error } = await supabase
                    .from('pet_questions')
                    .select(`
                    id,
                    user_id,
                    title,
                    description,
                    animal_type,
                    created_at,
                    pet_question_images (url),
                    pet_question_disease_tags (
                        disease_tags (tag_name)
                    )
                `)
                    .eq('id', id)
                    .single(); // ✅ user_id 조건 제거

                if (error || !data) {
                    console.error(`Question fetch error: ${JSON.stringify(error)}`);
                    Toast.show({
                        type: 'error',
                        text1: '오류',
                        text2: '질문 데이터를 불러오지 못했습니다.',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                    return;
                }

                const formattedQuestion: Question = {
                    ...data,
                    images: data.pet_question_images || [],
                    disease_tag: data.pet_question_disease_tags?.[0]?.disease_tags || { tag_name: '미지정' },
                };
                setQuestion(formattedQuestion);
                console.log('Raw data:', JSON.stringify(data.pet_question_disease_tags));
            } catch (error) {
                console.error('Error fetching question:', error);
                Toast.show({
                    type: 'error',
                    text1: '오류',
                    text2: '데이터 로딩 중 오류가 발생했습니다.',
                    position: 'top',
                    visibilityTime: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (id && user) {
            fetchQuestion();
        }
    }, [id, user]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView className="flex-1 pt-16">
                    <View className='bg-white'>
                        <QuestionDetailSkeleton />
                    </View>
                    <ShadowViewLight className="bg-white">
                        <View className="pt-2 bg-white">
                            <AnswerSkeleton />
                            <AnswerSkeleton />
                        </View>
                    </ShadowViewLight>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (!question) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-lg font-semibold text-gray-800">질문을 찾을 수 없습니다.</Text>
                <Pressable
                    className="bg-teal-500 py-4 rounded-xl mt-4 px-6"
                    onPress={() => router.replace('/(tabs)/(medical)')}
                    style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                    <Text className="text-white font-bold text-lg">질문 목록으로 돌아가기</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 bg-neutral-100">
                <View className="px-6 pt-3 bg-white">
                    <View className="flex-row items-center justify-between">
                        <Pressable onPress={() => router.back()} hitSlop={12}>
                            <Ionicons name="chevron-back" size={28} color="#222" />
                        </Pressable>
                    </View>
                </View>
                <View className="pt-8 bg-white">
                    <View className="bg-white rounded-lg px-6 pb-8">
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 rounded-full bg-purple-200 justify-center items-center mr-3">
                                <Text className="text-purple-600 text-lg">🌙</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-neutral-900">질문자</Text>
                                <Text className="text-sm text-neutral-500">
                                    {formatTimeAgo(question.created_at)}
                                </Text>
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
                        </View>

                        <View className="mb-4">
                            <Text className="text-xl font-bold text-neutral-800">{question.title}</Text>
                            <Text className="text-lg font-medium text-neutral-800 leading-9 mt-2">
                                {question.description}
                            </Text>
                        </View>

                        {question.images.length > 0 && (
                            <View className="mt-4">
                                <View className="flex-row flex-wrap">
                                    {question.images.map((image, index) => (
                                        <View key={index} className="w-1/2 p-1">
                                            <Image
                                                source={{ uri: image.url, cache: 'force-cache' }}
                                                className="w-full h-40 rounded-xl"
                                                resizeMode="cover"
                                                onError={() => console.warn(`Failed to load image: ${image.url}`)}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        <View className="flex-row items-center pt-4">
                            <View className="bg-neutral-100 py-2 px-3 rounded-lg">
                                <Text className="text-sm font-semibold text-neutral-600">
                                    {getAnimalTypeLabel(question.animal_type)}
                                </Text>
                            </View>
                            <View className="bg-neutral-100 py-2 px-3 rounded-lg ml-2">
                                <Text className="text-sm font-semibold text-neutral-600">
                                    {getTreatmentLabel(question.disease_tag.tag_name)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <ShadowViewLight className="bg-white">
                    <View className="border-t border-t-neutral-100 pt-6 bg-white">
                        <Text className="text-xl font-bold text-neutral-800 px-6 mb-6">2개의 답변</Text>
                        <View className="bg-white border-b border-neutral-100">
                            <View className="flex-row items-center mb-4 px-6">
                                <View className="size-8 rounded-full bg-orange-200 justify-center items-center mr-3">
                                    <Text className="text-orange-600 text-lg">🧘‍♀️</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="font-bold text-teal-800 mr-1">김성진 수의사</Text>
                                        <Ionicons name="checkmark-circle" size={12} color="#0d9488" />
                                    </View>
                                    <Text className="text-xs text-neutral-500 mt-1">{formatTimeAgo(new Date().toISOString())}</Text>
                                </View>
                            </View>
                            <View className="px-6 pb-8">
                                <Text className="text-lg font-medium text-neutral-800 leading-9">
                                    우선 피부 발진이 의심되는데요, 풀숲 진드기 혹은 여러 매개체로 인해서 피부발진이 의심됩니다 가까운 병원으로 내원하셔서 자세한 진찰을 받아보시는걸 추천드립니다
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="border-t border-t-neutral-100 pt-6 bg-white">
                        <View className="bg-white">
                            <View className="flex-row items-center mb-4 px-6">
                                <View className="size-8 rounded-full bg-orange-200 justify-center items-center mr-3">
                                    <Text className="text-orange-600 text-lg">🧘‍♀️</Text>
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Text className="font-bold text-teal-800 mr-1">진수연 수의사</Text>
                                        <Ionicons name="checkmark-circle" size={12} color="#0d9488" />
                                    </View>
                                    <Text className="text-xs text-neutral-500 mt-1">{formatTimeAgo(new Date(new Date().getTime() - 4 * 60 * 1000).toISOString())}</Text>
                                </View>
                            </View>
                            <View className="px-6 pb-8">
                                <Text className="text-lg font-medium text-neutral-800 leading-9">
                                    우선 피부 발진이 의심되는데요, 풀숲 진드기 혹은 여러 매개체로 인해서 피부발진이 의심됩니다 가까운 병원으로 내원하셔서 자세한 진찰을 받아보시는걸 추천드립니다
                                </Text>
                            </View>
                        </View>
                    </View>
                </ShadowViewLight>
                <View className="mt-6 bg-white py-12">
                    <Text className="text-2xl font-semibold text-neutral-800 px-6">
                        {getTreatmentLabel(question.disease_tag.tag_name)} 관련 유사 질문
                    </Text>
                    {isRelatedLoading ? (
                        <View>
                            {Array.from({ length: 4 }).map((_, index) => (
                                <RelatedQuestionSkeleton key={index} />
                            ))}
                        </View>
                    ) : relatedQuestions.length === 0 ? (
                        <Text className="text-neutral-600 text-center">유사 질문이 없습니다.</Text>
                    ) : (
                        relatedQuestions.map((item) => (
                            <Link href={`/medical/questions/${item.id}`} key={item.id}>
                                <View className="border-b border-b-neutral-100 py-8 w-full">
                                    <View className="px-6">
                                        <Text className="text-neutral-700 font-bold text-lg pb-1">{item.title}</Text>
                                        <Text className="text-neutral-600 text-base leading-7" numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center px-6 pt-4 justify-between">
                                        <View className="bg-neutral-100 py-2 px-3 rounded-lg">
                                            <Text className="text-sm font-semibold text-neutral-600">{item.disease_tag}</Text>
                                        </View>
                                        <Text className="text-sm text-neutral-600">{formatTimeAgo(item.created_at)}</Text>
                                    </View>
                                </View>
                            </Link>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}