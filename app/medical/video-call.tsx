import { CallContent, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';

const CALL_ID = `pethero-call-${Math.random().toString(36).substring(2, 15)}`;

export default function QuestionsScreen() {
    const [call, setCall] = useState(null);
    const [error, setError] = useState(null);
    const client = useStreamVideoClient();

    useEffect(() => {
        if (!client) {
            console.error('StreamVideoClient is not initialized');
            setError('클라이언트 초기화 실패');
            return;
        }

        console.log('Initializing call with ID:', CALL_ID);
        const call = client.call('default', CALL_ID);

        call
            .join({ create: true })
            .then(() => {
                console.log('Successfully joined call:', CALL_ID);
                setCall(call);
            })
            .catch((err) => {
                console.error('Failed to join call:', err);
                setError(`통화 연결 실패: ${err.message}`);
            });

        // Cleanup on unmount
        return () => {
            if (call) {
                call.leave().catch((err) => console.error('Failed to leave call:', err));
            }
        };
    }, [client]);

    return (
        <SafeAreaView className="flex-1 bg-neutral-50">
            <View className="flex-1">

                {error ? (
                    <Text className="text-lg text-red-600 mt-4 px-6">통화 연결 실패: {error}</Text>
                ) : call ? (
                    <StreamCall call={call}>
                        <View className="flex-1 w-full h-full mt-4">
                            <CallContent
                                layout="grid"
                                style={{ width: '100%', height: '100%' }}
                                onHangupCallHandler={() => {
                                    call.leave().catch((err) => console.error('Failed to leave call:', err));
                                    router.back();
                                }}
                            />
                        </View>
                    </StreamCall>
                ) : (
                    <Text className="text-lg text-neutral-600 mt-4 px-6">통화 연결 중...</Text>
                )}
            </View>
        </SafeAreaView>
    );
}