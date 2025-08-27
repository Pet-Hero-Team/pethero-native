// GroupChatScreen.tsx
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import {
    AntDesign,
    Entypo,
    EvilIcons,
    Fontisto,
    Ionicons,
    MaterialCommunityIcons,
    Octicons,
} from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import mitt from 'mitt';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const emitter = mitt();
export const chatEmitter = emitter;

const getStatusStyles = (status) => {
    console.log('getStatusStyles called with status:', status);
    switch (status) {
        case '수색 중':
            return { text: '수색 중', color: 'text-slate-700', icon: 'map-search-outline', iconColor: '#334155' };
        case '수색완료':
            return { text: '수색완료', color: 'text-orange-500', icon: 'shield-check-outline', iconColor: '#f97316' };
        case '종료':
            return { text: '종료', color: 'text-red-500', icon: 'progress-close', iconColor: '#ef4444' };
        default:
            return { text: '알 수 없음', color: 'text-neutral-600', icon: null, iconColor: '#000' };
    }
};

export default function GroupChatScreen() {
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const [messages, setMessages] = useState([]);
    const [value, setValue] = useState('');
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);
    const [galleryImages, setGalleryImages] = useState([]);
    const [permissionStatus, setPermissionStatus] = useState(null);
    const [rescueData, setRescueData] = useState({ title: '채팅방', status: null, rescues_images: [] });
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState('INITIAL');

    const sheetRef = useRef(null);
    const flatListRef = useRef(null);
    const subscriptionRef = useRef(null);
    const { height, width: screenWidth } = useWindowDimensions();

    const snapPoints = useMemo(() => ['60%', '90%'], []);

    useEffect(() => {
        if (user !== undefined) {
            setAuthLoading(false);
        }
    }, [user]);

    useEffect(() => {
        (async () => {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            setPermissionStatus(status);
            if (status === 'granted') {
                loadGalleryImages();
            }
        })();
    }, []);

    const loadGalleryImages = async () => {
        const { assets } = await MediaLibrary.getAssetsAsync({
            first: 100,
            mediaType: ['photo'],
            sortBy: ['creationTime'],
        });
        setGalleryImages(assets);
    };

    useEffect(() => {
        if (authLoading || !user || !id) return;

        console.log('useEffect triggered for fetchChatData');

        const fetchChatData = async () => {
            setLoading(true);
            try {
                const { data: authUid } = await supabase.rpc('get_auth_uid');
                console.log('Current auth.uid():', authUid);

                const { data: chatData, error: chatError } = await supabase
                    .from('chats')
                    .select(`
            id,
            rescue_chats (
              rescue_id,
              rescues (
                title,
                status,
                rescues_images (url)
              )
            )
          `)
                    .eq('id', id)
                    .single();

                if (chatError) {
                    console.error('Chat fetch error:', JSON.stringify(chatError, null, 2));
                    throw new Error(`채팅방 정보 로드 실패: ${chatError.message}`);
                }
                console.log('Fetched chat data:', JSON.stringify(chatData, null, 2));
                setRescueData(chatData.rescue_chats?.rescues || { title: '채팅방', status: null, rescues_images: [] });

                const { data: messageData, error: messageError } = await supabase
                    .from('messages')
                    .select(`
            id,
            content,
            image_urls,
            user_id,
            created_at,
            reply_to_id,
            profiles (id, display_name, avatar_url)
          `)
                    .eq('chat_id', id)
                    .order('created_at', { ascending: true });

                if (messageError) {
                    console.error('Messages fetch error:', JSON.stringify(messageError, null, 2));
                    if (messageError.code === '42501') {
                        console.log('Permission denied for profiles table in message fetch');
                    }
                    throw new Error(`메시지 로드 실패: ${messageError.message}`);
                }

                console.log('Initial messages:', JSON.stringify(messageData, null, 2));
                setMessages(
                    messageData.map((msg) => ({
                        id: msg.id,
                        fromMe: msg.user_id === user.id,
                        text: msg.content,
                        image_urls: msg.image_urls || [],
                        replyTo: msg.reply_to_id
                            ? messageData.find((m) => m.id === msg.reply_to_id)?.content
                            : '',
                        user: msg.profiles || { id: msg.user_id, display_name: '알 수 없는 사용자', avatar_url: null },
                        created_at: msg.created_at,
                    }))
                );

                await supabase
                    .from('chat_participants')
                    .update({ last_read_at: new Date().toISOString() })
                    .eq('chat_id', id)
                    .eq('user_id', user.id);
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: '데이터 로드 실패',
                    text2: error.message,
                    position: 'top',
                    visibilityTime: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();

        const channel = supabase.channel(`chat:${id}`, {
            config: { broadcast: { self: true } },
        });
        subscriptionRef.current = channel
            .on('broadcast', { event: 'message' }, async (payload) => {
                console.log('Broadcast message received:', JSON.stringify(payload, null, 2));
                const message = payload.payload;

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, display_name, avatar_url')
                    .eq('id', message.user_id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error in broadcast:', JSON.stringify(profileError, null, 2));
                    if (profileError.code === '42501') {
                        console.log('Permission denied for profiles table in broadcast');
                    }
                }

                const formattedMessage = {
                    id: message.id,
                    fromMe: message.user_id === user.id,
                    text: message.content,
                    image_urls: message.image_urls || [],
                    replyTo: message.reply_to_id
                        ? messages.find((m) => m.id === message.reply_to_id)?.text
                        : '',
                    user: profile || { id: message.user_id, display_name: '알 수 없는 사용자', avatar_url: null },
                    created_at: message.created_at,
                };

                console.log('Formatted message:', JSON.stringify(formattedMessage, null, 2));

                setMessages((prev) => {
                    if (prev.some((m) => m.id === formattedMessage.id)) {
                        console.log('Duplicate message ignored:', formattedMessage.id);
                        return prev;
                    }
                    const updatedMessages = [...prev, formattedMessage];
                    console.log('Updated messages:', JSON.stringify(updatedMessages, null, 2));
                    setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                        console.log('Scrolled to end');
                    }, 100);
                    return updatedMessages;
                });

                if (message.user_id === user.id) {
                    await supabase
                        .from('chat_participants')
                        .update({ last_read_at: new Date().toISOString() })
                        .eq('chat_id', id)
                        .eq('user_id', user.id);
                }

                chatEmitter.emit('messageSent', { chat_id: id, user_id: message.user_id });
            })
            .subscribe((status, err) => {
                console.log('Broadcast subscription status:', status, err ? `Error: ${JSON.stringify(err)}` : '');
                setSubscriptionStatus(status);
                if (status === 'CLOSED' || status === 'TIMED_OUT') {
                    console.warn('Broadcast subscription closed or timed out. Reconnecting...');
                    setTimeout(() => channel.subscribe(), 1000);
                }
            });

        return () => {
            console.log('Cleaning up broadcast subscription');
            supabase.removeChannel(channel);
        };
    }, [user, id, authLoading]);

    const sendMessage = async () => {
        if (!value.trim() && selectedAssets.length === 0) return;

        try {
            let imageUrls = [];
            if (selectedAssets.length > 0) {
                for (const asset of selectedAssets) {
                    const response = await fetch(asset.uri);
                    const blob = await response.blob();
                    const fileName = `${user.id}/${Date.now()}-${asset.id}.jpg`;
                    const { error: uploadError } = await supabase.storage
                        .from('chat_images')
                        .upload(fileName, blob, { contentType: 'image/jpeg' });
                    if (uploadError) {
                        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
                    }
                    const { data: urlData } = supabase.storage.from('chat_images').getPublicUrl(fileName);
                    imageUrls.push(urlData.publicUrl);
                }
            }

            const newMessage = {
                chat_id: id,
                user_id: user.id,
                content: value.trim() || null,
                image_urls: imageUrls.length > 0 ? imageUrls : null,
                created_at: new Date().toISOString(),
            };

            const { data, error: insertError } = await supabase
                .from('messages')
                .insert(newMessage)
                .select()
                .single();

            if (insertError) {
                throw new Error(`메시지 전송 실패: ${insertError.message}`);
            }

            setValue('');
            setSelectedAssets([]);
            sheetRef.current?.close();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: '메시지 전송 실패',
                text2: error.message,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    const openGalleryBottomSheet = useCallback(() => {
        sheetRef.current?.snapToIndex(0);
    }, []);

    const handleSheetChanges = useCallback((index) => {
        setCurrentSnapIndex(index);
        if (index === -1) {
            setSelectedAssets([]);
        }
    }, []);

    const toggleSelectAsset = (asset) => {
        setSelectedAssets((prev) =>
            prev.some((a) => a.id === asset.id)
                ? prev.filter((a) => a.id !== asset.id)
                : [...prev, asset]
        );
    };

    const confirmSelectImages = () => {
        sendMessage();
    };

    const pickFromNativeGallery = async () => {
        sheetRef.current?.close();
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: '갤러리 접근 권한이 필요합니다',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedAssets(result.assets);
            sendMessage();
        }
    };

    const renderGalleryItem = useCallback(
        ({ item }) => {
            const isSelected = selectedAssets.some((a) => a.id === item.id);
            const selectIndex = selectedAssets.findIndex((a) => a.id === item.id);
            const itemSize = (screenWidth - 10) / 4;
            return (
                <TouchableOpacity
                    style={{
                        width: itemSize,
                        height: itemSize,
                        margin: 0.5,
                    }}
                    onPress={() => toggleSelectAsset(item)}
                >
                    <View className="relative overflow-hidden rounded">
                        <Image
                            source={{ uri: item.uri }}
                            style={{
                                width: itemSize,
                                height: itemSize,
                            }}
                            resizeMode="cover"
                        />
                        {isSelected && (
                            <>
                                <View className="absolute inset-0 bg-black/40 rounded" />
                                <View className="absolute bottom-2 right-2 bg-white rounded-full w-5 h-5 items-center justify-center">
                                    <Text className="text-neutral-800 text-[10px] font-bold">{selectIndex + 1}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            );
        },
        [selectedAssets, screenWidth]
    );

    const renderMessageItem = ({ item }) => {
        console.log('Rendering message:', item.id, item.text);
        return item.fromMe ? (
            <View className="items-end mb-3">
                <View className="bg-neutral-800 rounded-xl px-4 py-3 max-w-[80%]">
                    {item.replyTo && (
                        <View className="border-l-2 border-orange-400 pl-2 mb-1">
                            <Text className="text-xs text-orange-400 font-semibold">{item.replyTo}</Text>
                        </View>
                    )}
                    {item.text && <Text className="text-white">{item.text}</Text>}
                    {item.image_urls?.map((url, index) => (
                        <Image key={index} source={{ uri: url }} className="w-40 h-40 mt-2 rounded" />
                    ))}
                </View>
            </View>
        ) : (
            <View className="mb-3 flex-row items-start">
                <Image
                    source={{ uri: item.user?.avatar_url || 'https://picsum.photos/200/300' }}
                    className="w-8 h-8 rounded-full"
                />
                <View className="bg-neutral-100 rounded-xl px-4 py-3 max-w-[80%] ml-3">
                    <Text className="text-neutral-900 font-semibold">{item.user?.display_name || '알 수 없는 사용자'}</Text>
                    {item.replyTo && (
                        <View className="border-l-2 border-orange-400 pl-2 mb-1">
                            <Text className="text-xs text-orange-400 font-semibold">{item.replyTo}</Text>
                        </View>
                    )}
                    {item.text && <Text className="text-neutral-900">{item.text}</Text>}
                    {item.image_urls?.map((url, index) => (
                        <Image key={index} source={{ uri: url }} className="w-40 h-40 mt-2 rounded" />
                    ))}
                </View>
            </View>
        );
    };

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        ),
        []
    );

    if (authLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-4 text-neutral-600">인증 로드 중...</Text>
            </SafeAreaView>
        );
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-4 text-neutral-600">채팅방 로드 중...</Text>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView className="flex-1">
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-4 border-b border-neutral-100">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="#222" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: rescueData?.rescues_images?.[0]?.url || 'https://picsum.photos/200/300' }}
                        className="w-10 h-10 rounded-full ml-4"
                    />
                    <View className="flex-1 ml-4">
                        <Text className="font-bold text-lg text-neutral-800">{rescueData?.title || '채팅방'}</Text>
                        <View className="flex-row items-center">
                            <Text className={`font-bold text-sm ${getStatusStyles(rescueData?.status).color} mr-1`}>
                                {getStatusStyles(rescueData?.status).text}
                            </Text>
                            {getStatusStyles(rescueData?.status).icon && (
                                <MaterialCommunityIcons
                                    name={getStatusStyles(rescueData?.status).icon}
                                    size={16}
                                    color={getStatusStyles(rescueData?.status).iconColor}
                                />
                            )}
                        </View>
                    </View>
                    <TouchableOpacity className="mr-5">
                        <Fontisto name="search" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <AntDesign name="profile" size={22} color="black" />
                    </TouchableOpacity>
                </View>
                <Text className="text-center pt-6 text-neutral-500">오늘</Text>
                <FlatList
                    ref={flatListRef}
                    className="px-4 pt-8"
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessageItem}
                    onContentSizeChange={() => {
                        console.log('Content size changed, scrolling to end');
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                    onLayout={() => {
                        console.log('FlatList layout triggered, scrolling to end');
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                    extraData={messages}
                />
                <View className="flex-row items-center bg-neutral-100 rounded-full px-5 py-3 mx-4 mb-4">
                    <TouchableOpacity
                        className="bg-orange-500 rounded-full w-9 h-9 items-center justify-center mr-4"
                        onPress={openGalleryBottomSheet}
                    >
                        <Entypo name="camera" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TextInput
                        className="flex-1 text-lg text-neutral-700 max-h-24"
                        placeholder="메시지 보내기..."
                        placeholderTextColor="#9ca3af"
                        value={value}
                        onChangeText={setValue}
                        multiline={true}
                        blurOnSubmit={false}
                    />
                    {value.length === 0 && selectedAssets.length === 0 ? (
                        <>
                            <TouchableOpacity className="ml-3" onPress={openGalleryBottomSheet}>
                                <Octicons name="image" size={21} color="#262626" />
                            </TouchableOpacity>
                            <TouchableOpacity className="ml-3">
                                <MaterialCommunityIcons name="map-marker-circle" size={26} color="#262626" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            className="bg-neutral-600 rounded-lg size-8 items-center justify-center"
                            onPress={sendMessage}
                        >
                            <Ionicons name="arrow-up" size={18} color="#ffffff" />
                        </TouchableOpacity>
                    )}
                </View>
                <BottomSheet
                    ref={sheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enableDynamicSizing={false}
                    enableHandlePanningGesture={true}
                    enablePanDownToClose={true}
                    handleIndicatorStyle={{ display: 'none' }}
                    backgroundStyle={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                    backdropComponent={renderBackdrop}
                    onChange={handleSheetChanges}
                >
                    <View className="flex-1 pb-24" style={{ minHeight: height * 0.9 }}>
                        <View className="bg-gray-300 w-11 h-1.5 rounded-full mx-auto" />
                        <View className="flex-row items-center px-2 pb-4 pt-5">
                            <View className="flex-1" />
                            <TouchableOpacity onPress={pickFromNativeGallery} className="flex-row items-center ml-3">
                                <Text className="font-bold text-neutral-800 text-lg ml-2">최근항목</Text>
                                <EvilIcons name="chevron-down" size={26} color="black" className="-m-1" />
                            </TouchableOpacity>
                            <View className="flex-1 flex-row justify-end">
                                <TouchableOpacity
                                    className={`rounded-lg size-8 items-center justify-center ${selectedAssets.length === 0 ? 'bg-neutral-300' : 'bg-neutral-700'}`}
                                    disabled={selectedAssets.length === 0}
                                    onPress={confirmSelectImages}
                                >
                                    <Ionicons name="arrow-up" size={18} color="#ffffff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {permissionStatus === 'granted' ? (
                            <FlatList
                                data={galleryImages}
                                renderItem={renderGalleryItem}
                                keyExtractor={(item) => item.id}
                                numColumns={4}
                                contentContainerStyle={{ padding: 2 }}
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center px-5">
                                <Text className="text-base text-neutral-800 text-center">갤러리 접근 권한이 필요합니다.</Text>
                            </View>
                        )}
                    </View>
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}