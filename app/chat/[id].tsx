// app/chat/[id].tsx

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import {
    AntDesign,
    Entypo,
    EvilIcons,
    Fontisto,
    Ionicons,
    MaterialCommunityIcons,
    Octicons
} from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Keyboard,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

// --- 타입 정의 ---
type Profile = { id: string; display_name: string; avatar_url: string; };
type RawMessage = {
    id: number;
    user_id: string;
    content: string | null;
    image_urls: string[] | null;
    created_at: string;
    profiles: Profile | null;
};
type FormattedMessage = {
    id: number;
    fromMe: boolean;
    text: string | null;
    image_urls: string[] | null;
    user: Profile;
    created_at: string;
};

const getStatusStyles = (status) => {
    switch (status) {
        case '수색 중':
            return { text: '수색 중', color: 'text-slate-700', icon: 'map-search-outline', iconColor: '#334155' };
        case '수색완료':
            return { text: '수색완료', color: 'text-orange-500', icon: 'shield-check-outline', iconColor: '#f97316' };
        case '종료':
            return { text: '종료', color: 'text-red-500', icon: 'progress-close', iconColor: '#ef4444' };
        default:
            return { text: '알 수 없음', color: 'text-neutral-600', icon: 'progress-question', iconColor: '#525252' };
    }
};

export default function GroupChatScreen() {
    const { user } = useAuth();
    const { id: chatId } = useLocalSearchParams() as { id: string };

    const [messages, setMessages] = useState<FormattedMessage[]>([]);
    const [value, setValue] = useState('');
    const [rescueData, setRescueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAssets, setSelectedAssets] = useState<MediaLibrary.Asset[]>([]);
    const [galleryImages, setGalleryImages] = useState<MediaLibrary.Asset[]>([]);
    const [permissionStatus, setPermissionStatus] = useState<MediaLibrary.PermissionStatus | null>(null);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);

    const sheetRef = useRef<BottomSheet>(null);
    const flatListRef = useRef<FlatList>(null);
    const { width: screenWidth, height } = useWindowDimensions();
    const snapPoints = useMemo(() => ['60%', '90%'], []);

    // DB 데이터를 UI용 데이터로 변환하는 함수
    const formatMessage = (rawMsg: RawMessage, currentUserId: string): FormattedMessage => {
        return {
            id: rawMsg.id,
            fromMe: rawMsg.user_id === currentUserId,
            text: rawMsg.content,
            image_urls: rawMsg.image_urls,
            user: rawMsg.profiles || { id: rawMsg.user_id, display_name: '알 수 없는 사용자', avatar_url: null },
            created_at: rawMsg.created_at,
        };
    };

    useEffect(() => {
        (async () => {
            const mediaStatus = await MediaLibrary.requestPermissionsAsync();
            setPermissionStatus(mediaStatus.status);
            if (mediaStatus.status === 'granted') {
                const { assets } = await MediaLibrary.getAssetsAsync({ first: 100, mediaType: ['photo'], sortBy: ['creationTime'] });
                setGalleryImages(assets);
            }
        })();
    }, []);

    useEffect(() => {
        if (!user || !chatId) return;

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [chatRes, messagesRes] = await Promise.all([
                    supabase.from('chats').select('*, rescue_chats(*, rescues(*, rescues_images(url)))').eq('id', chatId).single(),
                    supabase.from('messages').select('*, profiles(id, display_name, avatar_url)').eq('chat_id', chatId).order('created_at', { ascending: true })
                ]);

                if (chatRes.error) throw chatRes.error;
                if (messagesRes.error) throw messagesRes.error;

                if (chatRes.data?.rescue_chats?.[0]?.rescues) setRescueData(chatRes.data.rescue_chats[0].rescues);
                setMessages((messagesRes.data || []).map(msg => formatMessage(msg, user.id)));

            } catch (error) {
                Toast.show({ type: 'error', text1: '데이터 로드 실패', text2: error.message });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

        const channel = supabase.channel(`public:messages:chat_id=eq.${chatId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                async (payload) => {
                    const newMessageRaw = payload.new as RawMessage;
                    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', newMessageRaw.user_id).single();
                    const formattedMsg = formatMessage({ ...newMessageRaw, profiles: profileData }, user.id);
                    setMessages(prev => prev.some(m => m.id === formattedMsg.id) ? prev : [...prev, formattedMsg]);
                }
            ).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, chatId]);

    const handleLaunchCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Toast.show({ type: 'error', text1: '카메라 접근 권한이 필요합니다.' }); return; }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!result.canceled && result.assets) {
            setSelectedAssets(result.assets);
            setTimeout(() => sendMessage(), 100);
        }
    };

    const sendMessage = async () => {
        if ((!value.trim() && selectedAssets.length === 0) || !user) return;
        Keyboard.dismiss();
        const content = value;
        const assets = [...selectedAssets];
        setValue('');
        setSelectedAssets([]);
        sheetRef.current?.close();

        try {
            let imageUrls: string[] = [];
            if (assets.length > 0) {
                Toast.show({ type: 'info', text1: `이미지 ${assets.length}개 업로드 중...` });
                const uploadPromises = assets.map(async (asset, index) => {
                    let uri = asset.uri;
                    console.log(`Processing asset ${index + 1}:`, uri);

                    // iOS에서 ph:// URI 처리
                    if (uri.startsWith('ph://')) {
                        try {
                            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
                            uri = assetInfo.localUri || assetInfo.uri;
                            console.log(`Converted ph:// URI to:`, uri);
                            if (!uri) throw new Error(`유효하지 않은 URI: ${asset.id}`);
                        } catch (error) {
                            console.error(`Failed to get asset info for ${asset.id}:`, error);
                            throw new Error(`이미지 정보 로드 실패: ${error.message}`);
                        }
                    }

                    // 파일 정보 확인
                    const fileInfo = await FileSystem.getInfoAsync(uri);
                    console.log(`File info for asset ${index + 1}:`, fileInfo);
                    if (!fileInfo.exists || fileInfo.size === 0) {
                        throw new Error(`파일이 존재하지 않거나 빈 파일입니다: ${asset.id}`);
                    }

                    // HEIC 파일을 JPEG로 변환
                    let finalUri = uri;
                    let finalExtension = uri.split('.').pop()?.toLowerCase() || 'jpg';
                    if (finalExtension === 'heic') {
                        try {
                            const manipulatedImage = await ImageManipulator.manipulateAsync(
                                uri,
                                [],
                                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                            );
                            finalUri = manipulatedImage.uri;
                            finalExtension = 'jpg';
                            console.log(`Converted HEIC to JPEG: ${finalUri}`);

                            // 변환된 파일 정보 확인
                            const convertedFileInfo = await FileSystem.getInfoAsync(finalUri);
                            console.log(`Converted file info for asset ${index + 1}:`, convertedFileInfo);
                            if (!convertedFileInfo.exists || convertedFileInfo.size === 0) {
                                throw new Error(`변환된 JPEG 파일이 존재하지 않거나 빈 파일입니다: ${asset.id}`);
                            }
                        } catch (error) {
                            console.error(`Failed to convert HEIC for ${index + 1}:`, error);
                            throw new Error(`HEIC 변환 실패: ${error.message}`);
                        }
                    }

                    // 파일 읽기 전 지연 (파일 쓰기 완료 보장)
                    await new Promise(resolve => setTimeout(resolve, 100));

                    // 파일을 Base64로 읽기
                    let fileContent;
                    try {
                        fileContent = await FileSystem.readAsStringAsync(finalUri, {
                            encoding: FileSystem.EncodingType.Base64,
                        });
                        console.log(`File content length for asset ${index + 1}:`, fileContent.length);
                        if (!fileContent || fileContent.length === 0) {
                            throw new Error(`빈 파일 데이터: ${asset.id}`);
                        }
                    } catch (error) {
                        console.error(`Read error for asset ${index + 1}:`, error);
                        throw new Error(`파일 읽기 실패: ${error.message}`);
                    }

                    // Base64를 ArrayBuffer로 변환
                    const binaryString = atob(fileContent);
                    const arrayBuffer = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        arrayBuffer[i] = binaryString.charCodeAt(i);
                    }

                    // MIME 타입 결정
                    const mimeType = 'image/jpeg';

                    // 파일명 생성
                    const fileName = `${user.id}/${Date.now()}-${asset.filename || `chat_${index + 1}`}.jpg`;

                    // Supabase에 업로드
                    const { data, error } = await supabase.storage
                        .from('chat_images')
                        .upload(fileName, arrayBuffer, { contentType: mimeType });
                    if (error) {
                        console.error(`Upload error for asset ${index + 1}:`, error);
                        throw error;
                    }
                    const publicUrl = supabase.storage.from('chat_images').getPublicUrl(data.path).data.publicUrl;
                    console.log(`Uploaded asset ${index + 1} URL:`, publicUrl);

                    // 임시 파일 삭제
                    if (finalUri !== uri) {
                        await FileSystem.deleteAsync(finalUri, { idempotent: true });
                    }
                    return publicUrl;
                });
                imageUrls = await Promise.all(uploadPromises);
            }
            const { error } = await supabase.from('messages').insert({
                chat_id: chatId,
                user_id: user.id,
                content: content.trim() || null,
                image_urls: imageUrls.length > 0 ? imageUrls : null
            });
            if (error) throw error;
        } catch (error) {
            Toast.show({ type: 'error', text1: '메시지 전송 실패', text2: error.message });
            setValue(content);
            setSelectedAssets(assets);
        }
    };

    const renderMessageItem = ({ item }: { item: FormattedMessage }) => (
        item.fromMe ? (
            <View className="items-end mb-3"><View className="bg-neutral-800 rounded-xl px-4 py-3 max-w-[80%]">{item.text && <Text className="text-white text-base">{item.text}</Text>}{item.image_urls?.map((url, index) => <Image key={index} source={{ uri: url }} className="w-48 h-48 mt-2 rounded-lg" resizeMode="cover" />)}</View></View>
        ) : (
            <View className="mb-3 flex-row items-start"><Image source={{ uri: item.user?.avatar_url || 'https://via.placeholder.com/40' }} className="w-8 h-8 rounded-full" /><View className="bg-neutral-100 rounded-xl px-4 py-3 max-w-[80%] ml-3"><Text className="text-neutral-900 font-semibold">{item.user?.display_name}</Text>{item.text && <Text className="text-neutral-800 mt-1">{item.text}</Text>}{item.image_urls?.map((url, index) => <Image key={index} source={{ uri: url }} className="w-48 h-48 mt-2 rounded-lg" resizeMode="cover" />)}</View></View>
        )
    );

    const openGalleryBottomSheet = useCallback(() => {
        sheetRef.current?.snapToIndex(0);
    }, []);

    const handleSheetChanges = useCallback((index) => {
        setCurrentSnapIndex(index);
        if (index === -1) {
            setSelectedAssets([]);
        }
    }, []);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
        ),
        []
    );

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

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#f97316" />
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
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 20 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
                <View className="flex-row items-center bg-neutral-100 rounded-full px-5 py-3 mx-4 mb-4">
                    <TouchableOpacity
                        className="bg-orange-500 rounded-full w-9 h-9 items-center justify-center mr-4"
                        onPress={handleLaunchCamera}
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