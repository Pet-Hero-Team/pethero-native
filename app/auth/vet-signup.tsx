
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { signUpVet } from '../../utils/auth';

export default function VetSignUpScreen() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [hospitalId, setHospitalId] = useState<string>('');
    const [licenseNumber, setLicenseNumber] = useState<string>('');

    const handleSignUp = async () => {
        try {
            await signUpVet({
                email,
                password,
                username,
                full_name: fullName,
                hospital_id: hospitalId,
                license_number: licenseNumber,
            });
            router.replace('/(tabs)/(home)');
        } catch (error) {
            console.error('수의사 회원가입 에러:', (error as Error).message);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 p-4">
                <Text className="text-2xl font-bold mb-4">수의사 회원가입</Text>
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="이메일"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="비밀번호"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="사용자 이름"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="성명"
                    value={fullName}
                    onChangeText={setFullName}
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="병원 ID"
                    value={hospitalId}
                    onChangeText={setHospitalId}
                />
                <TextInput
                    className="border p-2 mb-2 rounded"
                    placeholder="면허 번호"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                />
                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded"
                    onPress={handleSignUp}
                >
                    <Text className="text-white text-center">회원가입</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}