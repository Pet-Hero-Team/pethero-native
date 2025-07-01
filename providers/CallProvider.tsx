import { useCalls } from '@stream-io/video-react-native-sdk';
import { router, useSegments } from 'expo-router';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CallProvider({ children }: PropsWithChildren) {
  const calls = useCalls();
  const call = calls[0];
  const { top } = useSafeAreaInsets();
  const segments = useSegments();
  const isOnCallScreen = segments[1] === 'call';

  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    console.log('Call state:', call?.id, call?.state?.callingState); // 디버깅 로그
    if (!call || isOnCallScreen || hasNavigated) {
      return;
    }

    if (call.state.callingState === 'ringing') {
      router.push(`/call?callId=${call.id}`);
      setHasNavigated(true);
    }
  }, [call, isOnCallScreen, hasNavigated]);

  // 통화 종료 상태 처리 및 hasNavigated 리셋
  useEffect(() => {
    if (!call) {
      setHasNavigated(false);
      return;
    }

    // 통화 종료 상태일 때 call.leave() 호출
    if (
      call.state.callingState === 'left' ||
      call.state.callingState === 'ended' ||
      call.state.callingState === 'disconnected'
    ) {
      call.leave().catch((error) => console.error('Failed to leave call:', error));
      setHasNavigated(false);
    }
  }, [call]);

  // Pressable 렌더링 조건에 통화 종료 상태 제외
  const isCallActive =
    call &&
    !isOnCallScreen &&
    call.state.callingState !== 'left' &&
    call.state.callingState !== 'ended' &&
    call.state.callingState !== 'disconnected';

  return (
    <>
      {children}
    </>
  );
}