import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center">

                <Image
                    source={require("@/assets/images/6.png")}
                    className="size-44"
                    resizeMode="contain"
                />
                <View className="w-full px-10 mt-36">
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
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={5}
                    style={styles.button}
                    onPress={async () => {
                        try {
                            const credential = await AppleAuthentication.signInAsync({
                                requestedScopes: [
                                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                                ],
                            });
                            // signed in
                        } catch (e) {
                            if (e.code === 'ERR_REQUEST_CANCELED') {
                                // handle that the user canceled the sign-in flow
                            } else {
                                // handle other errors
                            }
                        }
                    }}
                />
                <View className="mt-4 flex-row items-center justify-center">
                    <Text className="text-sm text-neutral-500 px-4">계정찾기</Text>
                    <View className="w-px h-4 bg-neutral-200" />
                    <Text className="text-sm text-neutral-500 px-4">수의사이신가요?</Text>
                </View>

            </View>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: 200,
        height: 44,
    },
});