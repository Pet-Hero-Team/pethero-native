// app/medical/questions/[id].tsx

import { ShadowViewLight } from '@/components/ShadowViewLight';
import { AnswerSkeleton, QuestionDetailSkeleton, RelatedQuestionSkeleton } from '@/constants/skeletions';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { formatTimeAgo, getAnimalTypeLabel, getTreatmentLabel } from '@/utils/formating';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
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
interface Answer {
    id: string;
    vet_user_id: string;
    pet_question_id: string;
    content: string;
    created_at: string;
    profiles: { id: string; display_name: string; avatar_url: string };
}
const fetchQuestion = async (id: string) => {
    const { data, error } = await supabase.from('pet_questions').select(`id, user_id, title, description, animal_type, created_at, pet_question_images (url), pet_question_disease_tags (disease_tags (tag_name))`).eq('id', id).single();
    if (error) { throw new Error(`질문 조회 실패: ${error.message}`); }
    return { ...data, images: data.pet_question_images || [], disease_tag: data.pet_question_disease_tags?.[0]?.disease_tags || { tag_name: '미지정' } };
};
const fetchAnswers = async (questionId: string) => {
    const { data, error } = await supabase.from('pet_answers').select(`id, vet_user_id, pet_question_id, content, created_at, profiles!vet_user_id (id, display_name, avatar_url)`).eq('pet_question_id', questionId).order('created_at', { ascending: true });
    if (error) { console.error("답변 조회 실패:", error.message); throw new Error(`답변 조회 실패: ${error.message}`); }
    return data;
};
const fetchRelatedQuestions = async (diseaseTag: string, currentQuestionId: string) => {
    const { data, error } = await supabase.from('pet_questions').select(`id, title, description, animal_type, created_at, pet_question_images (url), pet_question_disease_tags!inner (disease_tags!inner (tag_name))`).eq('pet_question_disease_tags.disease_tags.tag_name', diseaseTag).neq('id', currentQuestionId).order('created_at', { ascending: false }).limit(5);
    if (error) { console.error("유사 질문 조회 실패:", error.message); throw new Error(`유사 질문 조회 실패: ${error.message}`); }
    return data.map((question: any) => ({ id: question.id, title: question.title, description: question.description || '설명 없음', animal_type: getAnimalTypeLabel(question.animal_type), created_at: question.created_at, image: question.pet_question_images?.[0]?.url || null, disease_tag: getTreatmentLabel(question.pet_question_disease_tags?.[0]?.disease_tags?.tag_name || '미지정') }));
};
const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('user_role').eq('id', userId).single();
    if (error) { console.error('Profile fetch error:', error.message); throw new Error(`프로필 조회 실패: ${error.message}`); }
    return data;
};


export default function QuestionsDetailScreen() {
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const [isVet, setIsVet] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchProfile(user.id).then((profile) => {
                setIsVet(profile.user_role === 'vet');
            }).catch((error) => {
                console.error('Error fetching profile:', error);
            });
        }
    }, [user?.id]);

    const { data: question, isLoading: isQuestionLoading, error: questionError } = useQuery({
        queryKey: ['question', id],
        queryFn: () => fetchQuestion(id as string),
        enabled: !!id,
    });

    const { data: answers = [], isLoading: isAnswersLoading, error: answersError } = useQuery({
        queryKey: ['answers', id],
        queryFn: () => fetchAnswers(id as string),
        enabled: !!id,
    });

    const { data: relatedQuestions = [], isLoading: isRelatedLoading } = useQuery({
        queryKey: ['relatedQuestions', question?.disease_tag.tag_name, id],
        queryFn: () => fetchRelatedQuestions(question?.disease_tag.tag_name || '미지정', id as string),
        enabled: !!question && !!id,
    });

    const { showActionSheetWithOptions } = useActionSheet();

    const deleteQuestionMutation = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('pet_questions').delete().eq('id', id).eq('user_id', user?.id);
            if (error) throw error;
        },
        onSuccess: () => {
            Toast.show({ type: 'success', text1: '질문 삭제 성공' });
            router.back();
        },
        onError: (error) => {
            Toast.show({ type: 'error', text1: '질문 삭제 실패', text2: error.message });
        },
    });

    const handleMenuPress = () => {
        const options = ['수정', '삭제', '취소'];
        const destructiveButtonIndex = 1;
        const cancelButtonIndex = 2;

        showActionSheetWithOptions({ options, destructiveButtonIndex, cancelButtonIndex },
            (selectedIndex) => {
                switch (selectedIndex) {
                    case 0:
                        router.push(`/medical/questions/edit/${id}`);
                        break;
                    case destructiveButtonIndex:
                        deleteQuestionMutation.mutate();
                        break;
                    case cancelButtonIndex: break;
                }
            }
        );
    };

    const isOwner = question?.user_id === user?.id;

    if (isQuestionLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <ScrollView className="flex-1 pt-16">
                    <View className='bg-white'><QuestionDetailSkeleton /></View>
                    <ShadowViewLight className="bg-white">
                        <View className="pt-2 bg-white"><AnswerSkeleton /><AnswerSkeleton /></View>
                    </ShadowViewLight>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (questionError || !question) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-lg font-semibold text-gray-800">질문을 찾을 수 없습니다.</Text>
                <Pressable className="bg-teal-500 py-4 rounded-xl mt-4 px-6" onPress={() => router.replace('/(tabs)/(medical)')} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                    <Text className="text-white font-bold text-lg">질문 목록으로 돌아가기</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const seeMoreButtonText = `${getTreatmentLabel(question.disease_tag.tag_name)} 관련 더보기`;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView className="flex-1 bg-neutral-100">
                    <View className="px-6 pt-3 bg-white">
                        <View className="flex-row items-center justify-between">
                            <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={28} color="#222" /></Pressable>
                            {isOwner && (<TouchableOpacity onPress={handleMenuPress}><Ionicons name="ellipsis-horizontal" size={20} color="#999" /></TouchableOpacity>)}
                        </View>
                    </View>
                    <View className="pt-8 bg-white">
                        <View className="bg-white rounded-lg px-6 pb-8">
                            <View className="flex-row items-center mb-3">
                                <View className="w-10 h-10 rounded-full bg-purple-200 justify-center items-center mr-3"><Text className="text-purple-600 text-lg">🌙</Text></View>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-neutral-900">질문자</Text>
                                    <Text className="text-sm text-neutral-500">{formatTimeAgo(question.created_at)}</Text>
                                </View>
                                <Ionicons name="ellipsis-horizontal" size={20} color="#999" />
                            </View>
                            <View className="mb-4">
                                <Text className="text-xl font-bold text-neutral-800">{question.title}</Text>
                                <Text className="text-lg font-medium text-neutral-800 leading-9 mt-2">{question.description}</Text>
                            </View>
                            {question.images.length > 0 && (
                                <View className="mt-4"><View className="flex-row flex-wrap">
                                    {question.images.map((image, index) => (<View key={index} className="w-1/2 p-1"><Image source={{ uri: image.url }} className="w-full h-40 rounded-xl" resizeMode="cover" /></View>))}
                                </View></View>
                            )}
                            <View className="flex-row items-center pt-4">
                                <View className="bg-neutral-100 py-2 px-3 rounded-lg"><Text className="text-sm font-semibold text-neutral-600">{getAnimalTypeLabel(question.animal_type)}</Text></View>
                                <View className="bg-neutral-100 py-2 px-3 rounded-lg ml-2"><Text className="text-sm font-semibold text-neutral-600">{getTreatmentLabel(question.disease_tag.tag_name)}</Text></View>
                            </View>
                        </View>
                    </View>
                    <ShadowViewLight className="bg-white">
                        <View className="border-t border-t-neutral-100 pt-6 bg-white">
                            <Text className="text-xl font-bold text-neutral-800 px-6 mb-6">{answers.length}개의 답변</Text>
                            {isAnswersLoading ? (<View className="pt-2 bg-white"><AnswerSkeleton /><AnswerSkeleton /></View>) : answersError ? (<Text className="text-red-500 text-center">답변 로드 실패: {(answersError as Error).message}</Text>) : (
                                <>
                                    {answers.length === 0 ? (<Text className="text-neutral-600 text-center py-8">아직 답변 없습니다.</Text>) : (
                                        answers.map((answer) => (
                                            <View key={answer.id} className="bg-white border-b border-neutral-100">
                                                <View className="flex-row items-center mb-4 px-6">
                                                    <View className="size-8 rounded-full bg-orange-200 justify-center items-center mr-3"><Text className="text-orange-600 text-lg">🧘‍♀️</Text></View>
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center"><Text className="font-bold text-teal-800 mr-1">{answer.profiles.display_name} 수의사</Text><Ionicons name="checkmark-circle" size={12} color="#0d9488" /></View>
                                                        <Text className="text-xs text-neutral-500 mt-1">{formatTimeAgo(answer.created_at)}</Text>
                                                    </View>
                                                </View>
                                                <View className="px-6 pb-8"><Text className="text-lg font-medium text-neutral-800 leading-9">{answer.content}</Text></View>
                                            </View>
                                        ))
                                    )}
                                </>
                            )}
                        </View>
                    </ShadowViewLight>
                    <View className="mt-6 bg-white py-12">
                        <Text className="text-2xl font-semibold text-neutral-800 px-6">{getTreatmentLabel(question.disease_tag.tag_name)} 관련 유사 질문</Text>
                        {isRelatedLoading ? (<View>{Array.from({ length: 4 }).map((_, index) => (<RelatedQuestionSkeleton key={index} />))}</View>) : relatedQuestions.length === 0 ? (<View className="flex-1 justify-center items-center py-20"><Text className="text-neutral-600 text-center">유사 질문이 없습니다.</Text></View>) : (
                            relatedQuestions.map((item) => (
                                <Link href={`/medical/questions/${item.id}`} key={item.id} asChild>
                                    <Pressable>
                                        <View className="border-b border-b-neutral-100 py-8 w-full">
                                            <View className="px-6"><Text className="text-neutral-700 font-bold text-lg pb-1">{item.title}</Text><Text className="text-neutral-600 text-base leading-7" numberOfLines={2}>{item.description}</Text></View>
                                            <View className="flex-row items-center px-6 pt-4 justify-between">
                                                <View className="bg-neutral-100 py-2 px-3 rounded-lg"><Text className="text-sm font-semibold text-neutral-600">{item.disease_tag}</Text></View>
                                                <Text className="text-sm text-neutral-600">{formatTimeAgo(item.created_at)}</Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                </Link>
                            ))
                        )}
                        {relatedQuestions.length > 0 && (
                            <Link href={{ pathname: "/medical/questions/questions", params: { selectedTreatmentTag: question.disease_tag.tag_name } }} asChild>
                                <Pressable>
                                    <View className="py-5 w-full"><View className="flex-row items-center justify-center ml-2"><Text className="text-center text-base text-neutral-600 mr-1">{seeMoreButtonText}</Text><AntDesign name="right" size={12} color="#6c6c6c" /></View></View>
                                </Pressable>
                            </Link>
                        )}
                    </View>
                </ScrollView>

                {isVet && (
                    <Pressable onPress={() => router.push(`/medical/questions/answer/${id}`)}>
                        <View className="p-2 bg-white border-t border-gray-200">
                            <View className="flex-row items-center bg-gray-100 rounded-full p-2">
                                <Image source={{ uri: user?.user_metadata?.avatar_url || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full" />
                                <Text className="text-gray-500 ml-3 flex-1">댓글로 의견을 남겨보세요</Text>
                                <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                                    <Ionicons name="arrow-up" size={20} color="white" />
                                </View>
                            </View>
                        </View>
                    </Pressable>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}