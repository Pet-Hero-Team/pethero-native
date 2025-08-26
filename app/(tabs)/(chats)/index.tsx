import { chatEmitter } from '@/app/chat/[id]';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ChatsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('group');
  const [groupChats, setGroupChats] = useState([]);
  const [personalChats, setPersonalChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const tabs = [
    { id: 'group', label: '그룹' },
    { id: 'personal', label: '개인' },
  ];

  // 사용자 로딩 상태 확인
  useEffect(() => {
    if (user !== undefined) {
      setAuthLoading(false);
    }
  }, [user]);

  // 채팅 목록 가져오기
  const fetchChats = async () => {
    if (authLoading || !user) return;

    setLoading(true);
    try {
      // 그룹 채팅 가져오기
      const { data: groupData, error: groupError } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          last_read_at,
          chats (
            id,
            created_at,
            rescue_chats (
              rescue_id,
              rescues (
                title,
                animal_type,
                address,
                status,
                rescues_images (url)
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('chats.rescue_chats.rescues.status', '수색 중');

      if (groupError) {
        console.error('Group chats fetch error:', JSON.stringify(groupError, null, 2));
        throw new Error(`그룹 채팅 로드 실패: ${groupError.message}`);
      }

      // 읽지 않은 메시지 수 및 마지막 메시지
      const groupChatsWithUnread = await Promise.all(
        (groupData || []).map(async (chat) => {
          const { data: lastMessage, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('chat_id', chat.chat_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          const { count, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('chat_id', chat.chat_id)
            .gt('created_at', chat.last_read_at || '1970-01-01');
          if (countError) {
            console.error('Unread count error:', JSON.stringify(countError, null, 2));
          }
          if (messageError) {
            console.error('Last message error:', JSON.stringify(messageError, null, 2));
          }
          return {
            ...chat,
            unread_count: count || 0,
            last_message: lastMessage?.content || '메시지 없음',
            last_message_time: lastMessage?.created_at || chat.chats.created_at,
          };
        })
      );
      setGroupChats(groupChatsWithUnread);

      // rescue_chats에서 chat_id 목록 가져오기
      const { data: rescueChatIds, error: rescueChatError } = await supabase
        .from('rescue_chats')
        .select('chat_id');
      if (rescueChatError) {
        console.error('Rescue chats fetch error:', JSON.stringify(rescueChatError, null, 2));
        throw new Error(`rescue_chats 로드 실패: ${rescueChatError.message}`);
      }
      const rescueChatIdList = (rescueChatIds || []).map((rc) => rc.chat_id);

      // 개인 채팅 가져오기
      let personalQuery = supabase
        .from('chat_participants')
        .select(`
          chat_id,
          last_read_at,
          chats (
            id,
            created_at,
            messages (
              content,
              created_at
            )
          ),
          profiles!chat_participants_user_id_fkey (id, display_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { foreignTable: 'chats.messages', ascending: false });

      if (rescueChatIdList.length > 0) {
        personalQuery = personalQuery.not('chat_id', 'in', rescueChatIdList);
      }

      const { data: personalData, error: personalError } = await personalQuery;

      if (personalError) {
        console.error('Personal chats fetch error:', JSON.stringify(personalError, null, 2));
        throw new Error(`개인 채팅 로드 실패: ${personalError.message}`);
      }

      // 읽지 않은 메시지 수 및 마지막 메시지
      const personalChatsWithUnread = await Promise.all(
        (personalData || []).map(async (chat) => {
          const { count, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('chat_id', chat.chat_id)
            .gt('created_at', chat.last_read_at || '1970-01-01');
          if (countError) {
            console.error('Unread count error:', JSON.stringify(countError, null, 2));
          }
          const lastMessage = chat.chats.messages[0] || { content: '메시지 없음', created_at: chat.chats.created_at };
          return {
            ...chat,
            unread_count: count || 0,
            last_message: lastMessage.content,
            last_message_time: lastMessage.created_at,
          };
        })
      );
      setPersonalChats(personalChatsWithUnread);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '채팅 목록 로드 실패',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;

    fetchChats();

    // 실시간 구독
    const subscription = supabase
      .channel('chat_participants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchChats()
      )
      .subscribe();

    const messageSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.chat_id) {
            fetchChats();
          }
        }
      )
      .subscribe();

    // GroupChatScreen에서 메시지 전송 이벤트 수신
    chatEmitter.on('messageSent', ({ chat_id }) => {
      fetchChats();
    });

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(messageSubscription);
      chatEmitter.off('messageSent');
    };
  }, [user, authLoading]);

  // 상태에 따른 스타일과 아이콘
  const getStatusStyles = (status) => {
    switch (status) {
      case '수색 중':
        return { text: '수색 중', color: 'text-slate-700', icon: 'map-search-outline', iconColor: '#334155' };
      case '수색완료':
        return { text: '수색완료', color: 'text-orange-500', icon: 'shield-check-outline', iconColor: '#f97316' };
      case '종료':
        return { text: '종료', color: 'text-red-500', icon: 'progress-close', iconColor: '#ef4444' };
      default:
        return { text: '', color: 'text-neutral-600', icon: null, iconColor: '#000' };
    }
  };

  // 참여한 채팅이 있는지 확인
  const hasChats = groupChats.length > 0 || personalChats.length > 0;

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-neutral-600">인증 로드 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="px-6 flex-none">
          <Text className="text-3xl font-bold text-neutral-800">채팅</Text>
        </View>
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#f97316" />
            <Text className="mt-4 text-neutral-600">채팅 목록 로드 중...</Text>
          </View>
        ) : !hasChats ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-neutral-800 text-center font-bold text-2xl mb-2">
              채팅에 오신걸 환영합니다!
            </Text>
            <Text className="text-neutral-600 text-center mt-3 leading-6">
              반려동물을 찾는{"\n"}여러가지 활동이 가능한 공간입니다.
            </Text>
            <TouchableOpacity
              className="mt-6 px-4 py-2 flex-row items-center justify-center rounded-full bg-orange-200"
              onPress={() => setActiveTab('group')}
            >
              <Entypo name="plus" size={16} color="#ea580c" />
              <Text className="ml-1 font-semibold text-orange-600">채팅 시작하기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="flex-row justify-between mt-4">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 ${activeTab === tab.id ? 'border-b-2 border-neutral-800' : 'border-b border-neutral-200'}`}
                >
                  <Text
                    className={`text-base text-center ${activeTab === tab.id ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-1 justify-start items-center px-1">
              {activeTab === 'group' ? (
                <View className="w-full pt-2">
                  {groupChats.length === 0 ? (
                    <Text className="text-neutral-600 text-center mt-4">참여한 그룹 채팅이 없습니다.</Text>
                  ) : (
                    groupChats.map((chat) => {
                      const rescue = chat.chats.rescue_chats?.rescues;
                      const status = getStatusStyles(rescue?.status || '');
                      return (
                        <Link
                          key={chat.chat_id}
                          href={`/chat/${chat.chat_id}`}
                          className="w-full px-4 py-4 flex-row justify-between items-center"
                        >
                          <View className="flex-row justify-between items-center w-full">
                            <View className="flex-row items-center">
                              <Image
                                source={{ uri: rescue?.rescues_images[0]?.url || 'https://picsum.photos/200/300' }}
                                className="w-16 h-16 rounded-full"
                              />
                              <View className="ml-5">
                                <View className="flex-row items-center">
                                  <Text className={`font-bold ${status.color} text-sm mr-1`}>
                                    {status.text}
                                  </Text>
                                  {status.icon && (
                                    <MaterialCommunityIcons
                                      name={status.icon}
                                      size={16}
                                      color={status.iconColor}
                                    />
                                  )}
                                </View>
                                <Text className="text-neutral-800 font-bold text-lg">
                                  {rescue?.title || '제목 없음'}
                                </Text>
                                <Text className="text-neutral-600 mt-1 text-sm">
                                  {chat.last_message}
                                </Text>
                              </View>
                            </View>
                            <View className="items-end justify-between">
                              <Text className="text-sm text-neutral-500 mb-2">
                                {new Date(chat.last_message_time || chat.chats.created_at).toLocaleTimeString(
                                  'ko-KR',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </Text>
                              {chat.unread_count > 0 && (
                                <View className="bg-orange-200 rounded-full w-6 h-6 flex-row items-center justify-center mt-2">
                                  <Text className="text-orange-500 font-semibold text-sm text-center">
                                    {chat.unread_count}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </Link>
                      );
                    })
                  )}
                </View>
              ) : (
                <View className="w-full pt-2">
                  {personalChats.length === 0 ? (
                    <Text className="text-neutral-600 text-center mt-4">참여한 개인 채팅이 없습니다.</Text>
                  ) : (
                    personalChats.map((chat) => {
                      const otherUser = Array.isArray(chat.profiles)
                        ? chat.profiles.find((p) => p.id !== user.id) || { display_name: '알 수 없는 사용자', avatar_url: null }
                        : chat.profiles || { display_name: '알 수 없는 사용자', avatar_url: null };
                      return (
                        <Link
                          key={chat.chat_id}
                          href={`/chat/${chat.chat_id}`}
                          className="w-full px-4 py-4 flex-row justify-between items-center"
                        >
                          <View className="flex-row justify-between items-center w-full">
                            <View className="flex-row items-center">
                              <Image
                                source={{ uri: otherUser.avatar_url || 'https://picsum.photos/200/300' }}
                                className="w-16 h-16 rounded-full"
                              />
                              <View className="ml-5">
                                <Text className="text-neutral-800 font-bold text-lg">
                                  {otherUser.display_name}
                                </Text>
                                <Text className="text-neutral-600 mt-1 text-sm">{chat.last_message}</Text>
                              </View>
                            </View>
                            <View className="items-end justify-between">
                              <Text className="text-sm text-neutral-500 mb-2">
                                {new Date(chat.last_message_time || chat.chats.created_at).toLocaleTimeString(
                                  'ko-KR',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </Text>
                              {chat.unread_count > 0 && (
                                <View className="bg-orange-200 rounded-full w-6 h-6 flex-row items-center justify-center mt-2">
                                  <Text className="text-orange-500 font-semibold text-sm text-center">
                                    {chat.unread_count}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </Link>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}