import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useChatContext } from 'stream-chat-expo';
import { useAuth } from '../providers/AuthProvider';

const UserListItem = ({ user }) => {
  const { client } = useChatContext();
  const { user: me } = useAuth();

  const onPress = async () => {
    //start a chat with him
    const channel = client.channel('messaging', {
      members: [me.id, user.id],
    });
    await channel.watch();
    router.replace(`/(home)/channel/${channel.cid}`);
  };

  return (
    <Pressable
      onPress={onPress}
      style={{ padding: 15, backgroundColor: 'white' }}
    >
      <Text style={{ fontWeight: '600', color: 'black' }}>{user.full_name}</Text>
    </Pressable>
  );
};

export default UserListItem;
