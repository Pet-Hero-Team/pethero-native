import SelectionModal from '@/components/SelectionModal';
import { ShadowViewLight } from '@/components/ShadowViewLight';
import { TREATMENT_OPTIONS } from '@/constants/pet';
import { supabase } from '@/supabase/supabase';
import { formatTimeAgo, getAnimalTypeLabel, getTreatmentLabel } from '@/utils/formating';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

const PAGE_SIZE = 10;

const fetchQuestions = async ({ pageParam = 0, queryKey }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const selectedTreatmentTag = queryKey[1]?.selectedTreatmentTag;

    if (selectedTreatmentTag) {
        const { data: tagData, error: tagError } = await supabase
            .from('pet_question_disease_tags')
            .select(`
                pet_question_id,
                disease_tags!inner (tag_name)
            `)
            .eq('disease_tags.tag_name', selectedTreatmentTag);

        if (tagError) throw new Error(`태그 조회 실패: ${tagError.message}`);

        if (tagData.length === 0) {
            return {
                data: [],
                nextPage: undefined,
            };
        }

        const petQuestionIds = tagData.map(item => item.pet_question_id);

        const { data, error } = await supabase
            .from('pet_questions')
            .select(`
                id,
                title,
                description,
                animal_type,
                created_at,
                pet_question_images (url),
                pet_question_disease_tags!inner (disease_tags (tag_name))
            `)
            .in('id', petQuestionIds)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw new Error(`질문 조회 실패: ${error.message}`);

        const formattedData = data.map((question: any) => ({
            id: question.id,
            title: question.title,
            description: question.description || '설명 없음',
            animal_type: getAnimalTypeLabel(question.animal_type),
            created_at: question.created_at,
            image: question.pet_question_images?.[0]?.url || null,
            disease_tag: getTreatmentLabel(question.pet_question_disease_tags?.[0]?.disease_tags?.tag_name || '미지정'),
        }));

        return {
            data: formattedData,
            nextPage: formattedData.length === PAGE_SIZE ? pageParam + 1 : undefined,
        };

    } else {
        const { data, error } = await supabase
            .from('pet_questions')
            .select(`
                id,
                title,
                description,
                animal_type,
                created_at,
                pet_question_images (url),
                pet_question_disease_tags!inner (disease_tags (tag_name))
            `)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw new Error(`질문 조회 실패: ${error.message}`);

        const formattedData = data.map((question: any) => ({
            id: question.id,
            title: question.title,
            description: question.description || '설명 없음',
            animal_type: getAnimalTypeLabel(question.animal_type),
            created_at: question.created_at,
            image: question.pet_question_images?.[0]?.url || null,
            disease_tag: getTreatmentLabel(question.pet_question_disease_tags?.[0]?.disease_tags?.tag_name || '미지정'),
        }));

        return {
            data: formattedData,
            nextPage: formattedData.length === PAGE_SIZE ? pageParam + 1 : undefined,
        };
    }
};

const QuestionItem = ({ item }) => (
    <Link href={`/medical/questions/${item.id}`} key={item.id} asChild>
        <Pressable>
            <View className="border-b border-b-neutral-200 py-8 w-full bg-white">
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
        </Pressable>
    </Link>
);

export default function QuestionsScreen() {
    const { selectedTreatmentTag: initialTreatmentTag } = useLocalSearchParams<{ selectedTreatmentTag?: string }>();
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedTreatmentTag, setSelectedTreatmentTag] = useState<string | null>(initialTreatmentTag || null);
    const scrollViewRef = useRef<ScrollView>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error
    } = useInfiniteQuery({
        queryKey: ['questionsInfinite', { selectedTreatmentTag }],
        queryFn: fetchQuestions,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const questions = data?.pages.flatMap(page => page.data) || [];

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

    const handleTreatmentSelect = (tag: string | null) => {
        setSelectedTreatmentTag(tag);
        setModalVisible(false);
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-50 justify-center items-center">
                <ActivityIndicator size="large" color="#0d9488" />
                <Text className="mt-4 text-lg font-semibold text-gray-800">질문을 불러오는 중...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-50 justify-center items-center">
                <Text className="text-lg font-semibold text-red-500">오류: {(error as Error).message}</Text>
            </SafeAreaView>
        );
    }

    const buttonText = selectedTreatmentTag ? getTreatmentLabel(selectedTreatmentTag) : '증상 선택';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 bg-white">
                <View className="flex-row items-center justify-center relative">
                    <Pressable onPress={() => router.back()} hitSlop={12} className="absolute left-0">
                        <Ionicons name="chevron-back" size={28} color="#222" />
                    </Pressable>
                    <Text className="text-xl font-extrabold text-neutral-900 mt-8 mb-6 text-center">의료상담</Text>
                </View>
            </View>
            <View className='flex-row px-6 justify-between pt-2 pb-4 items-center'>
                <Text className="text-2xl font-extrabold text-neutral-900">{selectedTreatmentTag ? getTreatmentLabel(selectedTreatmentTag) : '방금 올라온 질문'}</Text>
                <Pressable onPress={toggleModal} className='bg-neutral-100 rounded-lg px-4 py-1 flex-row items-center'>
                    <Text className='text-sm text-neutral-800 mr-1'>{buttonText}</Text>
                    <FontAwesome6 name="chevron-down" size={6} color="#262626" />
                </Pressable>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1 bg-neutral-100"
                onMomentumScrollEnd={handleMomentumScrollEnd}
            >
                {questions.length === 0 ? (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-neutral-400">질문이 없습니다.</Text>
                    </View>
                ) : (
                    questions.map((item, index) => (
                        <ShadowViewLight key={item.id + index}>
                            <QuestionItem item={item} />
                        </ShadowViewLight>
                    ))
                )}
                {isFetchingNextPage && (
                    <View className="py-8">
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                )}
            </ScrollView>

            <SelectionModal
                isVisible={isModalVisible}
                onClose={toggleModal}
                title="진료 항목 선택"
                options={TREATMENT_OPTIONS}
                selectedOption={selectedTreatmentTag}
                onSelect={handleTreatmentSelect}
            />
        </SafeAreaView>
    );
}