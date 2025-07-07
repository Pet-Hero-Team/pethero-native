import { AntDesign, Entypo, EvilIcons, Fontisto, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const messages = [
    { id: '1', fromMe: false, text: '안녕하세요!' },
    { id: '2', fromMe: false, text: '찾는 상황은 어떤가요?' },
    { id: '3', fromMe: false, text: '아는게 있다면 꼭 저에게 알려주시면 감사하겠습니다.' },
    { id: '4', fromMe: true, replyTo: '', text: '안녕하세요' },
    { id: '5', fromMe: true, replyTo: '아는게 있다면 꼭 저에게 알려주시면 감사하겠습니다.', text: '저도 꼭 라이를 찾아주고 싶네요, 마지막으로 봤던 장소가 어디였나요?' },
];

export default function GroupChatScreen() {
    const [value, setValue] = useState("");
    const [selectedAssets, setSelectedAssets] = useState([]);
    const [currentSnapIndex, setCurrentSnapIndex] = useState(-1);
    const [galleryImages, setGalleryImages] = useState([]);
    const [permissionStatus, setPermissionStatus] = useState(null);

    const sheetRef = useRef(null);
    const { height, width: screenWidth } = useWindowDimensions();

    const snapPoints = useMemo(() => ["60%", "90%"], []);

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
            prev.some(a => a.id === asset.id)
                ? prev.filter(a => a.id !== a.id)
                : [...prev, asset]
        );
    };

    const confirmSelectImages = () => {
        const uris = selectedAssets.map(a => a.uri);
        console.log('Sent images:', uris);
        setSelectedAssets([]);
        sheetRef.current?.close();
    };

    const pickFromNativeGallery = async () => {
        sheetRef.current?.close();
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('갤러리 접근 권한이 필요합니다!');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            allowsEditing: false,
            quality: 1,
        });
        if (!result.canceled) {
            const uris = result.assets.map(asset => asset.uri);
            console.log('Sent images:', uris);
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

    const renderMessageItem = ({ item }) => (
        item.fromMe ? (
            <View className="items-end mb-3">
                <View className="bg-neutral-800 rounded-xl px-4 py-3 max-w-[80%]">
                    {item.replyTo && (
                        <View className="border-l-2 border-orange-400 pl-2 mb-1">
                            <Text className="text-xs text-orange-400 font-semibold">{item.replyTo}</Text>
                        </View>
                    )}
                    <Text className="text-white">{item.text}</Text>
                </View>
            </View>
        ) : (
            <View className="mb-3 flex-row items-center">
                <Image source={{ uri: 'https://picsum.photos/200/300' }} className="w-8 h-8 rounded-full" />
                <View className="bg-neutral-100 rounded-xl px-4 py-3 max-w-[80%] ml-3">
                    <Text className="text-neutral-900">{item.text}</Text>
                </View>
            </View>
        )
    );

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    return (
        <GestureHandlerRootView className="flex-1">
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-4 border-b border-neutral-100">
                    <TouchableOpacity onPress={() => { router.back() }}>
                        <Ionicons name="chevron-back" size={24} color="#222" />
                    </TouchableOpacity>
                    <Image source={{ uri: 'https://picsum.photos/200/300' }} className="w-10 h-10 rounded-full ml-4" />
                    <View className="flex-1 ml-4">
                        <Text className="font-bold text-lg text-neutral-800">라이</Text>
                        <View className="flex-row items-center">
                            <Text className="font-bold text-sm text-slate-700 mr-1">수색 중</Text>
                            <MaterialCommunityIcons name="map-search-outline" size={16} color="#334155" />
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
                    className="px-4 pt-8"
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessageItem}
                />
                <View className="flex-row items-center bg-neutral-100 rounded-full px-5 py-3 mx-4 mb-4">
                    <TouchableOpacity className="bg-orange-500 rounded-full w-9 h-9 items-center justify-center mr-4">
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
                    {value.length === 0 && (
                        <>
                            <TouchableOpacity className="ml-3" onPress={openGalleryBottomSheet}>
                                <Octicons name="image" size={21} color="#262626" />
                            </TouchableOpacity>
                            <TouchableOpacity className="ml-3">
                                <MaterialCommunityIcons name="map-marker-circle" size={26} color="#262626" />
                            </TouchableOpacity>
                        </>
                    )}
                    {value.length > 0 && (
                        <TouchableOpacity
                            className="bg-neutral-600 rounded-lg size-8 items-center justify-center"
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
                                    className={` rounded-lg size-8 items-center justify-center ${selectedAssets.length === 0 ? 'bg-neutral-300' : 'bg-neutral-700'}`}
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
                                <Text className="text-base text-neutral-800 text-center">
                                    갤러리 접근 권한이 필요합니다.
                                </Text>
                            </View>
                        )}
                    </View>
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}