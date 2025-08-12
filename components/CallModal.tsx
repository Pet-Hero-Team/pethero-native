
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import ModalContainer from './ModalContainer';

interface CallModalProps {
    isVisible: boolean;
    onClose: () => void;
    phoneNumber: string;
}

export default function CallModal({ isVisible, onClose, phoneNumber }: CallModalProps) {
    const handleCopyPhoneNumber = async () => {
        if (phoneNumber) {
            await Clipboard.setStringAsync(phoneNumber);
            Toast.show({
                type: 'info',
                text1: '전화번호가 복사되었습니다.',
            });
        }
    };

    const handleCallPhone = () => {
        if (phoneNumber) {
            const url = `tel:${phoneNumber}`;
            Linking.openURL(url).catch(err => {
                console.error('Failed to open phone dialer:', err);
                Toast.show({
                    type: 'error',
                    text1: '전화 앱을 열 수 없습니다.',
                });
            });
        }
    };

    return (
        <ModalContainer isVisible={isVisible} onClose={onClose}>
            <View className="items-center px-8 pb-8 pt-4">
                <Text className="text-xl text-neutral-800 font-bold mb-3">전화번호</Text>
                <Text className="text-3xl text-orange-500 font-bold mb-4">{phoneNumber}</Text>
                <View className='flex-row items-center pb-8'>
                    <AntDesign name="infocirlceo" size={12} color="#a3a3a3" />
                    <Text className='text-neutral-400 text-sm ml-1'>
                        이 번호는 일회성번호로 안심하고 전화하셔도 됩니다.
                    </Text>
                </View>
                <Pressable
                    className="bg-orange-500 py-4 px-8 rounded-xl flex-row items-center justify-center w-full"
                    onPress={handleCallPhone}
                >
                    <MaterialIcons name="call" size={24} color="white" />
                    <Text className="text-white text-lg font-bold ml-2">전화 걸기</Text>
                </Pressable>
                <Pressable
                    className="mt-4 flex-row items-center justify-center"
                    onPress={handleCopyPhoneNumber}>
                    <Text className="text-gray-500 text-sm" style={{ textDecorationLine: 'underline' }}>
                        전화번호 복사하기
                    </Text>
                </Pressable>
            </View>
        </ModalContainer>
    );
}