// app/chat/[id].tsx

import ModalContainer from "@/components/ModalContainer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/supabase/supabase";
import {
    AntDesign,
    Entypo,
    EvilIcons,
    Fontisto,
    Ionicons,
    MaterialCommunityIcons,
    Octicons
} from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ImageViewer from "react-native-image-viewing";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import Toast from "react-native-toast-message";

// --- 타입 정의 ---
type Profile = { id: string; display_name: string; avatar_url: string };
type RawMessage = {
    id: string;
    chat_id: string;
    user_id: string;
    content: string | null;
    image_urls: string[] | null;
    location: { latitude: number; longitude: number; address: string } | null;
    created_at: string;
    profiles: Profile | null;
};
type FormattedMessage = {
    id: string;
    user_id: string;
    fromMe: boolean;
    text: string | null;
    image_urls: string[] | null;
    location: { latitude: number; longitude: number; address: string } | null;
    user: Profile;
    created_at: string;
    status?: "loading" | "sent";
};

const getStatusStyles = (status) => {
    switch (status) {
        case "수색 중":
            return { text: "수색 중", color: "text-slate-700", icon: "map-search-outline", iconColor: "#334155" };
        case "수색완료":
            return { text: "수색완료", color: "text-orange-500", icon: "shield-check-outline", iconColor: "#f97316" };
        case "종료":
            return { text: "종료", color: "text-red-500", icon: "progress-close", iconColor: "#ef4444" };
        default:
            return { text: "알 수 없음", color: "text-neutral-600", icon: "progress-question", iconColor: "#525252" };
    }
};

export default function GroupChatScreen() {
    const { user } = useAuth();
    const { id: chatId } = useLocalSearchParams() as { id: string };

    const [messages, setMessages] = useState<FormattedMessage[]>([]);
    const [value, setValue] = useState("");
    const [rescueData, setRescueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedAssets, setSelectedAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [galleryImages, setGalleryImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [permissionStatus, setPermissionStatus] = useState<ImagePicker.PermissionStatus | null>(null);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [viewerImages, setViewerImages] = useState<{ uri: string }[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isMapModalVisible, setIsMapModalVisible] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number }>({
        latitude: 37.5665,
        longitude: 126.978,
    });
    const [centerAddress, setCenterAddress] = useState("주소를 가져오는 중...");
    const [addressCache, setAddressCache] = useState({});
    const [isCloseToBottom, setIsCloseToBottom] = useState(true);

    const sheetRef = useRef<BottomSheet>(null);
    const flatListRef = useRef<FlatList>(null);
    const mapRef = useRef<MapView>(null);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const snapPoints = useMemo(() => ["60%", "90%"], []);

    const formatMessage = (rawMsg: RawMessage, currentUserId: string): FormattedMessage => {
        return {
            id: rawMsg.id,
            user_id: rawMsg.user_id,
            fromMe: rawMsg.user_id === currentUserId,
            text: rawMsg.content,
            image_urls: rawMsg.image_urls || null,
            location: rawMsg.location || null,
            user: rawMsg.profiles || { id: rawMsg.user_id, display_name: "알 수 없는 사용자", avatar_url: null },
            created_at: rawMsg.created_at,
            status: "sent",
        };
    };

    const sendLocationMessage = async () => {
        setIsMapModalVisible(false);
        if (!mapCenter || !centerAddress || centerAddress === "주소를 가져오는 중...") return;
        const optimisticId = Date.now().toString();
        const optimisticMessage: FormattedMessage = {
            id: optimisticId,
            user_id: user.id,
            fromMe: true,
            text: null,
            image_urls: null,
            location: { latitude: mapCenter.latitude, longitude: mapCenter.longitude, address: centerAddress },
            user: { id: user.id, display_name: "Me", avatar_url: null },
            created_at: new Date().toISOString(),
            status: "loading",
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const { data, error } = await supabase.from("messages").insert({ chat_id: chatId, user_id: user.id, location: { latitude: mapCenter.latitude, longitude: mapCenter.longitude, address: centerAddress } }).select().single();
            if (error) throw error;
            setMessages((prev) => prev.map((msg) => (msg.id === optimisticId ? { ...msg, id: data.id, status: "sent" } : msg)));
        } catch (error) {
            Toast.show({ type: "error", text1: "위치 전송 실패", text2: error.message });
            setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
        }
    };

    const handleRegionChangeComplete = (region: Region) => {
        setMapCenter({ latitude: region.latitude, longitude: region.longitude });
    };

    const handleNavigate = (location) => {
        if (!location) return;
        const { latitude, longitude, address } = location;
        const scheme = Platform.select({ ios: "maps:0,0?q=", android: "geo:0,0?q=" });
        const latLng = `${latitude},${longitude}`;
        const label = address;
        const url = Platform.select({ ios: `${scheme}${label}@${latLng}`, android: `${scheme}${latLng}(${label})` });
        if (url) Linking.openURL(url);
    };

    const moveToUserLocation = useCallback(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({ ...userLocation, latitudeDelta: 0.015, longitudeDelta: 0.0121 }, 1000);
        }
    }, [userLocation]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") { Toast.show({ type: "error", text1: "위치 권한 거부", text2: "위치 권한이 필요합니다." }); return; }
            const location = await Location.getCurrentPositionAsync({});
            const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            setUserLocation(coords);
            setMapCenter(coords);
        })();
        (async () => {
            const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setPermissionStatus(mediaStatus.status);
            if (mediaStatus.status === "granted") {
                const { assets } = await ImagePicker.getMediaLibraryAssetsAsync({ first: 100, mediaType: ["photo"], sortBy: ["creationTime"] });
                setGalleryImages(assets);
            }
        })();
    }, []);

    useEffect(() => {
        const cacheKey = `${mapCenter.latitude.toFixed(6)},${mapCenter.longitude.toFixed(6)}`;
        if (addressCache[cacheKey]) {
            setCenterAddress(addressCache[cacheKey]);
            return;
        }
        const fetchAddress = debounce(async () => {
            try {
                const result = await Location.reverseGeocodeAsync(mapCenter);
                const address = result[0] || {};
                const formattedAddress = [address.city, address.district, address.street, address.name,].filter(Boolean).join(' ') || "주소를 찾을 수 없습니다.";
                setCenterAddress(formattedAddress);
                setAddressCache((prev) => ({ ...prev, [cacheKey]: formattedAddress }));
            } catch (error) {
                setCenterAddress("주소 조회에 실패했습니다.");
            }
        }, 300);
        fetchAddress();
        return () => fetchAddress.cancel();
    }, [mapCenter]);

    useEffect(() => {
        if (!user || !chatId) return;
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [chatRes, messagesRes, updateRes] = await Promise.all([
                    supabase.from("chats").select("*, rescue_chats(*, rescues(*, rescues_images(url)))").eq("id", chatId).single(),
                    supabase.from("messages").select("*, profiles(id, display_name, avatar_url)").eq("chat_id", chatId).order("created_at", { ascending: true }),
                    supabase.from("chat_participants").update({ last_read_at: new Date().toISOString() }).eq("chat_id", chatId).eq("user_id", user.id),
                ]);

                if (chatRes.error) throw chatRes.error;
                if (messagesRes.error) throw messagesRes.error;
                if (updateRes.error) throw updateRes.error;

                if (chatRes.data?.rescue_chats?.[0]?.rescues) setRescueData(chatRes.data.rescue_chats[0].rescues);
                setMessages((messagesRes.data || []).map((msg) => formatMessage(msg, user.id)));
            } catch (error) {
                Toast.show({ type: "error", text1: "데이터 로드 실패", text2: error.message });
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

        const channel = supabase.channel(`public:messages:chat_id=eq.${chatId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` }, async (payload) => {
            const newMessageRaw = payload.new as RawMessage;
            const { data: profileData } = await supabase.from("profiles").select("*").eq("id", newMessageRaw.user_id).single();
            const formattedMsg = formatMessage({ ...newMessageRaw, profiles: profileData }, user.id);
            setMessages((prev) => (prev.some((m) => m.id === formattedMsg.id) ? prev : [...prev, formattedMsg]));
        }).subscribe();

        return () => supabase.removeChannel(channel);
    }, [user, chatId]);

    useEffect(() => {
        if (isCloseToBottom) {
            flatListRef.current?.scrollToEnd({ animated: false });
        }
    }, [messages]);

    const handleLaunchCamera = async () => {
        if (isSending) return;
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") { Toast.show({ type: "error", text1: "카메라 접근 권한이 필요합니다." }); return; }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!result.canceled && result.assets) {
            setSelectedAssets(result.assets);
            setTimeout(() => sendMessage(), 100);
        }
    };

    const sendMessage = async () => {
        if (isSending || (!value.trim() && selectedAssets.length === 0) || !user) return;
        setIsSending(true);
        Keyboard.dismiss();
        const content = value;
        const assets = [...selectedAssets].slice(0, 10);
        if (assets.length > 10) Toast.show({ type: "info", text1: "최대 10장 전송 가능" });
        setValue("");
        setSelectedAssets([]);
        sheetRef.current?.close();

        const optimisticId = Date.now().toString();
        const optimisticMessage: FormattedMessage = {
            id: optimisticId,
            user_id: user.id,
            fromMe: true,
            text: content.trim() || null,
            image_urls: assets.length > 0 ? assets.map(a => a.uri) : null,
            location: null,
            user: { id: user.id, display_name: "Me", avatar_url: null },
            created_at: new Date().toISOString(),
            status: "loading",
        };
        setMessages((prev) => (prev.some((msg) => msg.id === optimisticId) ? prev : [...prev, optimisticMessage]));

        try {
            let imageUrls: string[] = [];
            if (assets.length > 0) {
                Toast.show({ type: "info", text1: `이미지 ${assets.length}개 업로드 중...` });
                imageUrls = await Promise.all(
                    assets.map(async (asset, index) => {
                        let uri = asset.uri;
                        if (uri.startsWith("ph://")) {
                            const assetInfo = await ImagePicker.getAssetInfoAsync(asset.id);
                            uri = assetInfo.localUri || assetInfo.uri;
                            if (!uri) throw new Error(`유효하지 않은 URI: ${asset.id}`);
                        }
                        const manipulatedImage = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 800 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
                        uri = manipulatedImage.uri;
                        const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                        const binaryString = atob(fileContent);
                        const arrayBuffer = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) arrayBuffer[i] = binaryString.charCodeAt(i);
                        const fileName = `${user.id}/${Date.now()}-${asset.filename || `chat_${index + 1}`}.jpg`;
                        const { data, error } = await supabase.storage.from("chat_images").upload(fileName, arrayBuffer, { contentType: "image/jpeg" });
                        if (error) throw error;
                        const publicUrl = supabase.storage.from("chat_images").getPublicUrl(data.path).data.publicUrl;
                        await FileSystem.deleteAsync(uri, { idempotent: true });
                        return publicUrl;
                    })
                );
            }

            const { data, error } = await supabase.from("messages").insert({ chat_id: chatId, user_id: user.id, content: content.trim() || null, image_urls: imageUrls.length > 0 ? imageUrls : null }).select().single();
            if (error) throw error;

            setMessages((prev) => prev.map((msg) => msg.id === optimisticId ? { ...msg, id: data.id, image_urls: imageUrls, status: "sent" } : msg));
        } catch (error) {
            Toast.show({ type: "error", text1: "메시지 전송 실패", text2: error.message });
            setMessages((prev) => prev.filter((msg) => msg.id !== optimisticId));
            setValue(content);
            setSelectedAssets(assets);
        } finally {
            setIsSending(false);
        }
    };

    const pickFromNativeGallery = async () => {
        if (isSending) return;
        sheetRef.current?.close();
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { Toast.show({ type: "error", text1: "갤러리 접근 권한이 필요합니다", position: "top", visibilityTime: 3000 }); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, allowsEditing: false, quality: 1 });
        if (!result.canceled) {
            const assets = result.assets.slice(0, 10);
            if (result.assets.length > 10) Toast.show({ type: "info", text1: "최대 10장 전송 가능" });
            setSelectedAssets(assets);
        }
    };

    const openImageViewer = (imageUrls: string[], index: number) => {
        setViewerImages(imageUrls.map((url) => ({ uri: url })));
        setCurrentImageIndex(index);
        setImageViewerVisible(true);
    };

    const renderMessageItem = ({ item, index }: { item: FormattedMessage; index: number }) => {
        const previousMessage = messages[index - 1];
        const nextMessage = messages[index + 1];
        const showDisplayName = !item.fromMe && (!previousMessage || previousMessage.user_id !== item.user_id);
        const showAvatar = !item.fromMe && (!nextMessage || nextMessage.user_id !== item.user_id);
        const isFirstInSequence = !previousMessage || previousMessage.user_id !== item.user_id;
        const isSingleImage = item.image_urls?.length === 1;

        if (item.fromMe) {
            return (
                <View className={`items-end ${isFirstInSequence ? 'mt-3' : 'mt-1'}`}>
                    <View className="bg-neutral-700 rounded-lg max-w-[80%]">
                        {item.text && <Text className="text-white text-base p-3">{item.text}</Text>}
                        {item.image_urls && (
                            <View className={item.text ? "p-1" : ""}>
                                <FlatList
                                    data={item.image_urls}
                                    renderItem={({ item: url, index }) => (
                                        <TouchableOpacity key={index} onPress={() => openImageViewer(item.image_urls || [], index)}>
                                            <Image source={{ uri: item.status === "loading" ? "https://via.placeholder.com/48?text=Loading" : url }} className={`${isSingleImage ? 'w-52 h-72' : 'w-28 h-28'} rounded-lg m-0.5`} resizeMode="cover" />
                                            {item.status === "loading" && <View className="absolute inset-0 items-center justify-center"><ActivityIndicator size="large" color="#f97316" /></View>}
                                        </TouchableOpacity>
                                    )}
                                    numColumns={isSingleImage ? 1 : Math.min(item.image_urls.length, 2)}
                                    keyExtractor={(url, index) => `${url}-${index}`}
                                />
                            </View>
                        )}
                        {item.location && (
                            <View className="bg-neutral-50 p-3 rounded-lg min-w-[200px]">
                                <Text className="font-semibold text-neutral-800">위치 공유</Text>
                                <Text className="text-sm text-neutral-500 mt-1">{item.location.address}</Text>
                                <TouchableOpacity onPress={() => handleNavigate(item.location)} className="bg-white py-2 mt-2 rounded-md"><Text className="text-center font-semibold text-neutral-800">보기</Text></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            );
        }

        return (
            <View className={`${isFirstInSequence ? 'mt-3' : 'mt-1'}`}>
                {showDisplayName && <Text className="text-neutral-900 font-semibold pl-12 mb-1">{item.user?.display_name}</Text>}
                <View className="flex-row">
                    {showAvatar ? (<Image source={{ uri: item.user?.avatar_url || "https://via.placeholder.com/40" }} className="w-8 h-8 rounded-full mr-2 ml-2 self-end" />) : (<View className="w-8 mr-2 ml-2" />)}
                    <View className="bg-neutral-100 rounded-lg max-w-[80%]">
                        {item.text && <Text className="text-neutral-800 text-base p-3">{item.text}</Text>}
                        {item.image_urls && (
                            <View className={item.text ? "p-1" : ""}>
                                <FlatList
                                    data={item.image_urls}
                                    renderItem={({ item: url, index }) => (
                                        <TouchableOpacity key={index} onPress={() => openImageViewer(item.image_urls || [], index)}>
                                            <Image source={{ uri: url }} className={`${isSingleImage ? 'w-52 h-72' : 'w-24 h-24'} rounded-lg m-0.5`} resizeMode="cover" />
                                        </TouchableOpacity>
                                    )}
                                    numColumns={isSingleImage ? 1 : Math.min(item.image_urls.length, 2)}
                                    keyExtractor={(url, index) => `${url}-${index}`}
                                />
                            </View>
                        )}
                        {item.location && (
                            <View className="bg-neutral-50 p-3 rounded-lg min-w-[200px]">
                                <Text className="font-semibold text-neutral-800">위치 공유</Text>
                                <Text className="text-sm text-neutral-500 mt-1">{item.location.address}</Text>
                                <TouchableOpacity onPress={() => handleNavigate(item.location)} className="bg-white py-2 mt-2 rounded-md"><Text className="text-center font-semibold text-neutral-800">보기</Text></TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const openGalleryBottomSheet = useCallback(() => { sheetRef.current?.snapToIndex(0); }, []);
    const handleSheetChanges = useCallback((index) => { if (index === -1) setSelectedAssets([]); }, []);
    const renderBackdrop = useCallback((props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />, []);

    const toggleSelectAsset = (asset) => {
        if (selectedAssets.length >= 10 && !selectedAssets.some((a) => a.id === asset.id)) { Toast.show({ type: "info", text1: "최대 10장 선택 가능" }); return; }
        setSelectedAssets((prev) => prev.some((a) => a.id === asset.id) ? prev.filter((a) => a.id !== asset.id) : [...prev, asset]);
    };

    const confirmSelectImages = () => { sendMessage(); };

    const renderGalleryItem = useCallback(({ item }) => {
        const isSelected = selectedAssets.some((a) => a.id === item.id);
        const selectIndex = selectedAssets.findIndex((a) => a.id === item.id);
        const itemSize = (screenWidth - 10) / 4;
        return (
            <TouchableOpacity style={{ width: itemSize, height: itemSize, margin: 0.5 }} onPress={() => toggleSelectAsset(item)}>
                <View className="relative overflow-hidden rounded">
                    <Image source={{ uri: item.uri }} style={{ width: itemSize, height: itemSize }} resizeMode="cover" />
                    {isSelected && (<><View className="absolute inset-0 bg-black/40 rounded" /><View className="absolute bottom-2 right-2 bg-white rounded-full w-5 h-5 items-center justify-center"><Text className="text-neutral-800 text-[10px] font-bold">{selectIndex + 1}</Text></View></>)}
                </View>
            </TouchableOpacity>
        );
    }, [selectedAssets, screenWidth]);

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        setIsCloseToBottom(isNearBottom);
    };

    const handleZoom = (delta) => {
        mapRef.current?.getCamera().then(cam => {
            cam.altitude *= delta;
            mapRef.current?.animateCamera(cam);
        });
    };

    if (loading) {
        return (<SafeAreaView className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#f97316" /></SafeAreaView>);
    }

    return (
        <GestureHandlerRootView className="flex-1">
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-4 border-b border-neutral-100">
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#222" /></TouchableOpacity>
                    <Image source={{ uri: rescueData?.rescues_images?.[0]?.url || "https://picsum.photos/200/300" }} className="w-10 h-10 rounded-full ml-4" />
                    <View className="flex-1 ml-4">
                        <Text className="font-bold text-lg text-neutral-800">{rescueData?.title || "채팅방"}</Text>
                        <View className="flex-row items-center">
                            <Text className={`font-bold text-sm ${getStatusStyles(rescueData?.status).color} mr-1`}>{getStatusStyles(rescueData?.status).text}</Text>
                            {getStatusStyles(rescueData?.status).icon && <MaterialCommunityIcons name={getStatusStyles(rescueData?.status).icon} size={16} color={getStatusStyles(rescueData?.status).iconColor} />}
                        </View>
                    </View>
                    <TouchableOpacity className="mr-5"><Fontisto name="search" size={18} color="black" /></TouchableOpacity>
                    <TouchableOpacity><AntDesign name="profile" size={22} color="black" /></TouchableOpacity>
                </View>
                <Text className="text-center pt-6 text-neutral-500">오늘</Text>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={({ item, index }) => renderMessageItem({ item, index })}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 32, paddingBottom: 20 }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
                <View className="flex-row items-center bg-neutral-100 rounded-full px-5 py-3 mx-4 mb-4">
                    <TouchableOpacity className="bg-orange-500 rounded-full w-9 h-9 items-center justify-center mr-4" onPress={handleLaunchCamera} disabled={isSending}><Entypo name="camera" size={16} color="#fff" /></TouchableOpacity>
                    <TextInput className="flex-1 text-lg text-neutral-700 max-h-24" placeholder="메시지 보내기..." placeholderTextColor="#9ca3af" value={value} onChangeText={setValue} multiline={true} blurOnSubmit={false} />
                    {value.length === 0 && selectedAssets.length === 0 ? (
                        <>
                            <TouchableOpacity className="ml-3" onPress={openGalleryBottomSheet} disabled={isSending}><Octicons name="image" size={21} color="#262626" /></TouchableOpacity>
                            <TouchableOpacity className="ml-3" onPress={() => setIsMapModalVisible(true)} disabled={isSending}><MaterialCommunityIcons name="map-marker-circle" size={26} color="#262626" /></TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity className="bg-neutral-600 rounded-lg size-8 items-center justify-center" onPress={sendMessage} disabled={isSending}><Ionicons name="arrow-up" size={18} color="#ffffff" /></TouchableOpacity>
                    )}
                </View>
                <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enableDynamicSizing={false} enableHandlePanningGesture={true} enablePanDownToClose={true} handleIndicatorStyle={{ display: "none" }} backgroundStyle={{ backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24 }} backdropComponent={renderBackdrop} onChange={handleSheetChanges}>
                    <View className="flex-1 pb-24" style={{ minHeight: screenHeight * 0.9 }}>
                        <View className="bg-gray-300 w-11 h-1.5 rounded-full mx-auto" />
                        <View className="flex-row items-center px-2 pb-4 pt-5">
                            <View className="flex-1" />
                            <TouchableOpacity onPress={pickFromNativeGallery} className="flex-row items-center ml-3" disabled={isSending}><Text className="font-bold text-neutral-800 text-lg ml-2">최근항목</Text><EvilIcons name="chevron-down" size={26} color="black" className="-m-1" /></TouchableOpacity>
                            <View className="flex-1 flex-row justify-end"><TouchableOpacity className={`rounded-lg size-8 items-center justify-center ${selectedAssets.length === 0 ? "bg-neutral-300" : "bg-neutral-700"}`} disabled={selectedAssets.length === 0 || isSending} onPress={confirmSelectImages}><Ionicons name="arrow-up" size={18} color="#ffffff" /></TouchableOpacity></View>
                        </View>
                        {permissionStatus === "granted" ? (<FlatList data={galleryImages} renderItem={renderGalleryItem} keyExtractor={(item) => item.id} numColumns={4} contentContainerStyle={{ padding: 2 }} />) : (<View className="flex-1 justify-center items-center px-5"><Text className="text-base text-neutral-800 text-center">갤러리 접근 권한이 필요합니다.</Text></View>)}
                    </View>
                </BottomSheet>
                <ImageViewer images={viewerImages} imageIndex={currentImageIndex} visible={imageViewerVisible} onRequestClose={() => setImageViewerVisible(false)} />
                <ModalContainer isVisible={isMapModalVisible} onClose={() => setIsMapModalVisible(false)}>
                    <View className="p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg text-gray-600 flex-1 mr-4" numberOfLines={2}>{centerAddress}</Text>
                            <TouchableOpacity className="bg-orange-500 p-2 rounded-xl" onPress={moveToUserLocation}>
                                <Ionicons name="locate-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.mapContainer}>
                            <MapView
                                ref={mapRef}
                                provider={PROVIDER_GOOGLE}
                                style={styles.map}
                                initialRegion={{ latitude: mapCenter.latitude, longitude: mapCenter.longitude, latitudeDelta: 0.015, longitudeDelta: 0.0121 }}
                                showsUserLocation={true}
                                rotateEnabled={false}
                                onRegionChangeComplete={handleRegionChangeComplete}
                                scrollEnabled={true}
                                zoomEnabled={true}
                            />
                            <View style={styles.pinContainer} pointerEvents="none">
                                <Ionicons name="location-sharp" size={40} color="#FF6347" />
                            </View>
                            <View className="absolute top-4 right-4 bg-white rounded-lg shadow">
                                <TouchableOpacity onPress={() => handleZoom(0.5)} className="p-2 border-b border-gray-200">
                                    <Ionicons name="add-outline" size={24} color="black" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleZoom(2)} className="p-2">
                                    <Ionicons name="remove-outline" size={24} color="black" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity className="bg-blue-500 py-4 mt-6 rounded-xl flex-row items-center justify-center" onPress={sendLocationMessage}>
                            <Ionicons name="navigate-circle-outline" size={24} color="white" />
                            <Text className="text-white text-lg font-bold ml-2">이 위치 전송</Text>
                        </TouchableOpacity>
                    </View>
                </ModalContainer>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    mapContainer: { width: "100%", height: Dimensions.get("window").height * 0.5, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#eee" },
    map: { ...StyleSheet.absoluteFillObject },
    pinContainer: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -40 }] },
});