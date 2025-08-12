import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import ModalContainer from './ModalContainer';

interface DeletePostModalProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirmDelete: () => void;
}

export default function DeletePostModal({ isVisible, onClose, onConfirmDelete }: DeletePostModalProps) {
    return (
        <ModalContainer isVisible={isVisible} onClose={onClose}>
            <View className="p-6 items-center">
                <View className="w-20 h-20 rounded-full bg-red-100 justify-center items-center mb-4">
                    <Ionicons name="trash-outline" size={48} color="#EF4444" />
                </View>
                <Text className="text-xl font-bold text-neutral-800 mb-2">게시글 삭제</Text>
                <Text className="text-sm text-neutral-500 text-center leading-5 mb-8">
                    정말 이 게시글을 삭제하시겠습니까? {"\n"}
                    삭제된 게시글은 복구할 수 없습니다.
                </Text>
                <View className="w-full">
                    <Pressable className="py-3 rounded-xl items-center bg-neutral-100" onPress={onClose}>
                        <Text className="text-base font-bold text-neutral-800">취소</Text>
                    </Pressable>
                    <Pressable className="py-3 rounded-xl items-center mt-3 bg-red-500" onPress={onConfirmDelete}>
                        <Text className="text-base font-bold text-white">삭제</Text>
                    </Pressable>
                </View>
            </View>
        </ModalContainer>
    );
}