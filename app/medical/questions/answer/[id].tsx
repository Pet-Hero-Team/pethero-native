// app/medical/questions/answer/[id].tsx

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function AnswerScreen() {
    const { user } = useAuth();
    const { id: questionId } = useLocalSearchParams();
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const addAnswerMutation = useMutation({
        mutationFn: async (newContent: string) => {
            if (!user?.id) throw new Error('로그인이 필요합니다.');
            if (!questionId) throw new Error('질문 ID가 없습니다.');

            const { data, error } = await supabase
                .from('pet_answers')
                .insert({
                    vet_user_id: user.id,
                    pet_question_id: questionId,
                    content: newContent,
                    created_at: new Date().toISOString(),
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['answers', questionId] });
            Toast.show({ type: 'success', text1: '답변이 성공적으로 등록되었습니다.' });
            router.back();
        },
        onError: (error) => {
            Toast.show({ type: 'error', text1: '답변 등록 실패', text2: error.message });
        },
    });

    const handleAddAnswer = () => {
        if (!content.trim()) return;
        Keyboard.dismiss();
        addAnswerMutation.mutate(content);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </Pressable>
                    <TouchableOpacity
                        onPress={handleAddAnswer}
                        disabled={!content.trim() || addAnswerMutation.isPending}
                    >
                        <Text className={`text-lg font-bold ${!content.trim() || addAnswerMutation.isPending ? 'text-gray-400' : 'text-teal-500'}`}>
                            {addAnswerMutation.isPending ? '등록 중...' : '남기기'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="p-4 flex-1">
                    <TextInput
                        className="text-lg text-neutral-800 flex-1"
                        placeholder="수의사로서 전문적인 의견을 남겨주세요."
                        value={content}
                        onChangeText={setContent}
                        multiline
                        autoFocus
                        style={{ textAlignVertical: 'top' }}
                    />
                </View>

                <View className="p-4 border-t border-gray-200">
                    <Text className="text-xs text-gray-500">광고, 비난, 도배성 글을 남기면 영구적으로 활동이 제한될 수 있습니다. 건강한 커뮤니티 문화를 함께 만들어가요.</Text>
                    <Text className="text-xs text-gray-500 mt-2">자세한 내용은 커뮤니티 이용규칙을 참고해주세요.</Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}