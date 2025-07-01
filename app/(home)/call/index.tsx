import {
  Call,
  CallContent,
  RingingCallContent,
  StreamCall,
  useStreamVideoClient,
} from '@stream-io/video-react-native-sdk';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function CallScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const client = useStreamVideoClient();

  useEffect(() => {
    if (!callId) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.push('/');
      }
      return;
    }

    const fetchCall = async () => {
      try {
        const call = client.call('default', callId);
        await call.get();
        await call.join();
        setCall(call);
      } catch (error) {
        console.error('Failed to fetch or join call:', error);
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/');
        }
      }
    };

    fetchCall();

    return () => {
      if (call) {
        call.leave().catch((error) => console.error('Failed to leave call:', error));
      }
    };
  }, [callId, client]);

  // 통화 상태 모니터링 및 종료 시 라우팅
  useEffect(() => {
    if (!call) return;

    const handleCallEnded = () => {
      if (
        call.state.callingState === 'left' ||
        call.state.callingState === 'ended' ||
        call.state.callingState === 'disconnected'
      ) {
        call.leave().catch((error) => console.error('Failed to leave call:', error));
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push('/');
        }
      }
    };

    // call 상태 변화 감지
    call.on('call.ended', handleCallEnded);
    call.on('call.session_ended', handleCallEnded);

    return () => {
      call.off('call.ended', handleCallEnded);
      call.off('call.session_ended', handleCallEnded);
    };
  }, [call]);

  if (!call) {
    return <ActivityIndicator />;
  }

  return (
    <StreamCall call={call}>
      {call.state.callingState === 'ringing' ? (
        <RingingCallContent />
      ) : (
        <CallContent />
      )}
    </StreamCall>
  );
}