import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function QuestionsScreen() {

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <ScrollView>
                <View className="px-6 pt-3">
                    <View className="flex-row items-center justify-between">
                        <Pressable onPress={() => router.back()} hitSlop={12}>
                            <Ionicons name="chevron-back" size={28} color="#222" />
                        </Pressable>
                    </View>
                    <Text className="text-4xl font-extrabold text-neutral-900 mt-8">질문들</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
