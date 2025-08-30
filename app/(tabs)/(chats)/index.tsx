import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return isToday
    ? `${hours}:${minutes}`
    : `${date.getMonth() + 1}/${date.getDate()} ${hours}:${minutes}`;
};

export default function ChatsScreen() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_chats', { p_user_id: user.id });
      if (error) throw error;
      console.log('Fetched chats:', data);
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      Toast.show({ type: 'error', text1: '채팅 목록 로드 실패', text2: error.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchChats(); }, [fetchChats]));

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        console.log('New message received:', payload);
        const isMyChat = chats.some(chat => chat.chat_id === payload.new.chat_id);
        if (isMyChat) {
          fetchChats();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, chats, fetchChats]);

  const groupChats = chats.filter(c => c.is_group_chat);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4"><Text className="text-3xl font-bold">채팅</Text></View>
      {loading ? <ActivityIndicator size="large" color="#f97316" /> : (
        <ScrollView>
          {groupChats.length > 0 ? groupChats.map(chat => (
            <Link key={chat.chat_id} href={`/chat/${chat.chat_id}`} asChild>
              <TouchableOpacity className="w-full px-4 py-4 flex-row items-center">
                <Image source={{ uri: chat.rescue_image_url || 'https://via.placeholder.com/64' }} className="w-16 h-16 rounded-full" />
                <View className="ml-5 flex-1">
                  <Text className="text-neutral-800 font-bold text-lg">{chat.chat_title}</Text>
                  <Text className="text-neutral-600 mt-1 text-sm" numberOfLines={1}>{chat.last_message_content || '메시지 없음'}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm text-neutral-500 mb-2">{formatTime(chat.last_message_created_at || chat.chat_created_at)}</Text>
                  {chat.unread_count > 0 && <View className="bg-orange-500 rounded-full w-6 h-6 items-center justify-center"><Text className="text-white font-semibold text-sm">{chat.unread_count}</Text></View>}
                </View>
              </TouchableOpacity>
            </Link>
          )) : <Text className="text-center mt-10">참여한 그룹 채팅이 없습니다.</Text>}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}