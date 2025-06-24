import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';

type SearchInputProps = {
    searchQuery: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    autoFocus?: boolean;
};

export default function SearchInput({
    searchQuery,
    onChangeText,
    onSubmit,
    onClear,
    autoFocus = false,
}: SearchInputProps) {
    const navigation = useNavigation();

    return (
        <View className="flex-row items-center pt-2 mx-6">
            <Pressable onPress={() => navigation.goBack()}>
                <Feather name="chevron-left" size={28} color="#525252" />
            </Pressable>
            <View className="flex-1 flex-row items-center text-neutral-400 justify-between ml-4 bg-neutral-100 rounded-lg pl-6 pr-4 py-4">
                <TextInput
                    className="flex-1 text-base font-bold text-neutral-700"
                    placeholder="구조, 발견, 모임을 검색해보세요."
                    value={searchQuery}
                    onChangeText={onChangeText}
                    autoFocus={autoFocus}
                    placeholderTextColor="#c7c7c7"
                    returnKeyType="search"
                    onSubmitEditing={onSubmit}
                />
                <Pressable onPress={searchQuery.trim() ? onClear : onSubmit}>
                    {searchQuery.trim() ? (
                        <Ionicons name="close-circle" size={20} color="#a3a3a3" className="mr-2" />
                    ) : (
                        <Fontisto name="search" size={18} color="#525252" className="mr-2" />
                    )}
                </Pressable>
            </View>
        </View>
    );
}