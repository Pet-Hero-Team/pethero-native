import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center">

                <Image
                    source={require("@/assets/images/6.png")}
                    className="size-44"
                    resizeMode="contain"
                />
                <View className="w-full px-10 mt-20">
                    <TouchableOpacity className="w-full py-4 bg-gray-200 rounded-xl mb-4 relative overflow-hidden">
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <MaterialIcons name="email" size={24} color="#1e1e1e" />
                        </View>

                        <Text className="text-lg font-medium text-neutral-900 text-center">
                            이메일로 계속하기
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity className="w-full py-4 bg-yellow-300 rounded-xl mb-4 relative overflow-hidden">
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <Image
                                source={require("@/assets/images/kakao.png")}
                                className="size-8"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-lg font-medium text-neutral-900 text-center">
                            카카오톡으로 계속하기
                        </Text>
                    </TouchableOpacity>


                    <TouchableOpacity className="w-full py-4 bg-black rounded-xl mb-8 relative overflow-hidden">
                        <View className="absolute left-4 top-0 bottom-0 justify-center">
                            <AntDesign name="apple1" size={22} color="white" />
                        </View>
                        <Text className="text-lg font-medium text-white text-center">
                            Apple로 계속하기
                        </Text>
                    </TouchableOpacity>
                </View>


                <View className="flex-row items-center px-10">
                    <View className="flex-1 h-px bg-neutral-200" />
                    <Text className="mx-4 text-base text-neutral-500 font-medium">
                        또는
                    </Text>
                    <View className="flex-1 h-px bg-neutral-200" />
                </View>
                <View className="mt-8">
                    <Text className='text-sm text-center text-neutral-500'>수의사이신가요?</Text>
                    <Text className='text-sm mt-6 text-center text-neutral-500'>계정을 잃어버리셨나요?</Text>
                    <Text className='text-sm mt-6 text-center text-neutral-500'>문의하기</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
