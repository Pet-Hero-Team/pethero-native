import { ShadowView } from '@/components/ShadowView';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function EventsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-row items-center justify-between px-4 pb-4 pt-4 ">
                <Pressable onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={28} color="#222" />
                </Pressable>
            </View>
            <ScrollView className='px-6 mt-8'>
                <Text className="text-2xl font-extrabold text-neutral-900">이벤트</Text>
                <View className="flex-row mt-8">
                    <ShadowView className="flex-1 bg-white rounded-xl flex-row justify-between items-center px-6 py-4">
                        <Image
                            source={require("@/assets/images/2.png")}
                            className="size-28"
                            resizeMode="contain"
                        />
                        <View>
                            <Text className="text-neutral-500 font-bold text-right mb-2">오픈런칭 기념</Text>
                            <Text className="text-xl font-bold text-neutral-800 text-right">드디어 기다리시던{"\n"}펫히어로가 출시했습니다</Text>
                        </View>
                    </ShadowView>
                </View>
                <View className="flex-row mt-4">
                    <ShadowView className="flex-1 bg-white rounded-xl flex-row justify-between items-center px-6 py-4">
                        <Image
                            source={require("@/assets/images/2.png")}
                            className="size-28"
                            resizeMode="contain"
                        />
                        <View>
                            <Text className="text-neutral-500 font-bold text-right mb-2">오픈런칭 기념</Text>
                            <Text className="text-xl font-bold text-neutral-800 text-right">드디어 기다리시던{"\n"}펫히어로가 출시했습니다</Text>
                        </View>
                    </ShadowView>
                </View>
                <View className="flex-row mt-4">
                    <ShadowView className="flex-1 bg-white rounded-xl flex-row justify-between items-center px-6 py-4">
                        <Image
                            source={require("@/assets/images/2.png")}
                            className="size-28"
                            resizeMode="contain"
                        />
                        <View>
                            <Text className="text-neutral-500 font-bold text-right mb-2">오픈런칭 기념</Text>
                            <Text className="text-xl font-bold text-neutral-800 text-right">드디어 기다리시던{"\n"}펫히어로가 출시했습니다</Text>
                        </View>
                    </ShadowView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
