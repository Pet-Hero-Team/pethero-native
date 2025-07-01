import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Channel as ChannelType } from 'stream-chat';

import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import * as Crypto from 'expo-crypto';
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from 'stream-chat-expo';

export default function ChannelScreen() {
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const { cid } = useLocalSearchParams<{ cid: string }>();

  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();

  useEffect(() => {
    const fetchChannel = async () => {
      const channels = await client.queryChannels({ cid });
      setChannel(channels[0]);
    };

    fetchChannel();
  }, [cid]);

  const joinCall = async () => {
    const members = Object.values(channel.state.members).map((member) => ({
      user_id: member.user_id,
    }));

    const callId = Crypto.randomUUID();
    const call = videoClient.call('default', callId);
    try {
      await call.getOrCreate({
        ring: true,
        data: {
          members,
        },
      });
      await call.join(); // 전화 건 쪽에서 즉시 통화 참여
      router.push(`/call?callId=${callId}`);
    } catch (error) {
      console.error('Failed to create or join call:', error);
    }
  };

  if (!channel) {
    return <ActivityIndicator />;
  }

  return (
    <Channel channel={channel} audioRecordingEnabled>
      <Stack.Screen
        options={{
          title: 'Channel',
          headerRight: () => (
            <Ionicons name="call" size={20} color="gray" onPress={joinCall} />
          ),
        }}
      />
      <MessageList />
      <SafeAreaView edges={['bottom']}>
        <MessageInput />
      </SafeAreaView>
    </Channel>
  );
}