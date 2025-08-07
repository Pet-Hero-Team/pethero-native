import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, View } from 'react-native';

export default function SearchInput() {
    return (
        // 검색창 컴포넌트입니다.
        <View className="flex-row items-center bg-neutral-100 rounded-lg mx-6 my-8 px-3 py-4">
            <Ionicons name="search" size={20} color="#a3a3a3" />
            <TextInput
                placeholder="검색어를 입력해주세요."
                placeholderTextColor="#a3a3a3"
                className="flex-1 ml-3 text-base text-neutral-800"
            />
        </View>
    );
}
