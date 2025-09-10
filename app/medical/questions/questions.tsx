import SelectionModal from '@/components/SelectionModal';
import { ShadowViewLight } from '@/components/ShadowViewLight';
import { TREATMENT_OPTIONS } from '@/constants/pet';
import { supabase } from '@/supabase/supabase';
import { formatTimeAgo, getAnimalTypeLabel, getTreatmentLabel } from '@/utils/formating';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, Text, View } from 'react-native';

const PAGE_SIZE = 10;

// ⭐️⭐️⭐️ 새로운 DB 구조에 맞춰 필터링 기능이 포함된 최종 버전 ⭐️⭐️⭐️
const fetchQuestions = async ({ pageParam = 0, queryKey }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const [_key, { selectedTreatmentTag }] = queryKey;

    let query = supabase
        .from('pet_questions')
        .select(`
            id,
            title,
            description,
            animal_type,
            created_at,
            pet_question_images (url),
            pet_question_categories!inner (
                disease_categories!inner ( tag_value, name )
            )
        `);

    // 선택된 진료 항목 태그가 있다면, 해당 태그를 가진 질문만 필터링합니다.
    if (selectedTreatmentTag) {
        query = query.eq('pet_question_categories.disease_categories.tag_value', selectedTreatmentTag);
    }

    const { data, error } = await query
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
        disease_tag: getTreatmentLabel(question.pet_question_categories?.[0]?.disease_categories?.name || '미지정'),
    }));

    return {
        data: formattedData,
        nextPage: formattedData.length === PAGE_SIZE ? pageParam + 1 : undefined,
    };
};


const QuestionItem = ({ item }) => (
    <Link href={`/medical/questions/${item.id}`} key={item.id} asChild>
        <Pressable>
            <View className="border-b border-b-neutral-200 py-8 w-full bg-white">
                <View className="px-6">
                    <Text className="text-neutral-700 font-bold text-lg pb-1" numberOfLines={1}>{item.title}</Text>
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
        initialPageParam: 0,
    });

    const questions = data?.pages.flatMap(page => page.data) || [];

    const handleTreatmentSelect = (tag: string | null) => {
        setSelectedTreatmentTag(tag);
        setModalVisible(false);
    };

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#0d9488" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-4">
                <Text className="text-lg font-semibold text-red-500 text-center">오류: {(error as Error).message}</Text>
            </SafeAreaView>
        );
    }

    const buttonText = selectedTreatmentTag ? getTreatmentLabel(TREATMENT_OPTIONS.find(opt => opt.value === selectedTreatmentTag)?.label) : '증상 선택';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 bg-white pt-4">
                <View className="flex-row items-center justify-center relative h-14">
                    <Pressable onPress={() => router.back()} hitSlop={12} className="absolute left-0 top-0 bottom-0 justify-center">
                        <Ionicons name="chevron-back" size={28} color="#222" />
                    </Pressable>
                    <Text className="text-xl font-extrabold text-neutral-900">의료상담</Text>
                </View>
            </View>
            <View className='flex-row px-6 justify-between pt-2 pb-4 items-center bg-white'>
                <Text className="text-2xl font-extrabold text-neutral-900">{selectedTreatmentTag ? getTreatmentLabel(TREATMENT_OPTIONS.find(opt => opt.value === selectedTreatmentTag)?.label) : '방금 올라온 질문'}</Text>
                <Pressable onPress={toggleModal} className='bg-neutral-100 rounded-lg px-4 py-1 flex-row items-center'>
                    <Text className='text-sm text-neutral-800 mr-1'>{buttonText}</Text>
                    <FontAwesome6 name="chevron-down" size={8} color="#262626" />
                </Pressable>
            </View>

            <FlatList
                data={questions}
                renderItem={({ item }) => <ShadowViewLight><QuestionItem item={item} /></ShadowViewLight>}
                keyExtractor={(item) => item.id}
                className="flex-1 bg-neutral-100"
                onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-neutral-400">해당 증상에 대한 질문이 없습니다.</Text>
                    </View>
                }
                ListFooterComponent={isFetchingNextPage ? (
                    <View className="py-8">
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : null}
            />

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