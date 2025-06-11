import { Entypo, Fontisto, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [pickedImages, setPickedImages] = useState([]);
    const [galleryAssets, setGalleryAssets] = useState([]);
    const [selectedAssets, setSelectedAssets] = useState([]);


    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['50%', '93%'], []);


    const loadGalleryAssets = async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
            const media = await MediaLibrary.getAssetsAsync({
                mediaType: 'photo',
                first: 60,
                sortBy: [['creationTime', false]],
            });
            setGalleryAssets(media.assets);
        }
    };


    const toggleSelectAsset = (asset) => {
        setSelectedAssets((prev) =>
            prev.some(a => a.id === asset.id)
                ? prev.filter(a => a.id !== asset.id)
                : [...prev, asset]
        );
    };


    const confirmSelectImages = () => {
        setPickedImages([...pickedImages, ...selectedAssets.map(a => a.uri)]);
        setSelectedAssets([]);
        bottomSheetRef.current?.close();
    };


    const pickFromNativeGallery = async () => {
        bottomSheetRef.current?.close();
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
            setPickedImages([...pickedImages, ...result.assets.map(asset => asset.uri)]);
        }
    };


    const openGalleryBottomSheet = async () => {
        await loadGalleryAssets();
        bottomSheetRef.current?.expand();
    };

    const removeImage = (uriToRemove) => {
        setPickedImages(prev => prev.filter(uri => uri !== uriToRemove));
    };

    const renderGalleryItem = ({ item }) => {
        const selected = selectedAssets.some(a => a.id === item.id);
        return (
            <TouchableOpacity
                className="m-1"
                onPress={() => toggleSelectAsset(item)}
                activeOpacity={0.8}
            >
                <Image
                    source={{ uri: item.uri }}
                    className="size-24 rounded-lg"
                    style={{
                        opacity: selected ? 0.5 : 1,
                        borderWidth: selected ? 2 : 0,
                        borderColor: selected ? '#2563eb' : undefined,
                    }}
                />
                {selected && (
                    <View className="absolute top-2 right-2 bg-blue-600 rounded-full w-6 h-6 items-center justify-center">
                        <AntDesign name="check" size={18} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center px-4 py-4 border-b border-neutral-100">
                    <TouchableOpacity onPress={() => { router.back() }}>
                        <Ionicons name="chevron-back" size={24} color="#222" />
                    </TouchableOpacity>
                    <Image source={{ uri: 'https://picsum.photos/200/300' }} className="w-10 h-10 rounded-full ml-4" />
                    <View className="flex-1 ml-4">
                        <Text className="font-bold text-lg text-neutral-800">라이</Text>
                        <View className='flex-row items-center'>
                            <Text className='font-bold text-slate-700 text-sm mr-1'>수색 중</Text>
                            <MaterialCommunityIcons name="map-search-outline" size={16} color="#334155" />
                        </View>
                    </View>
                    <TouchableOpacity className='mr-5'>
                        <Fontisto name="search" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <AntDesign name="profile" size={22} color="black" />
                    </TouchableOpacity>
                </View>
                <Text className='text-center pt-6 text-neutral-500'>오늘</Text>
                <FlatList
                    className='px-4 pt-8'
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) =>
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
                    }
                />

                {pickedImages.length > 0 && (
                    <View className="px-4 pt-2">
                        <FlatList
                            horizontal
                            data={pickedImages}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <View className="relative mr-2">
                                    <Image
                                        source={{ uri: item }}
                                        className="w-20 h-20 rounded-lg"
                                    />
                                    <TouchableOpacity
                                        className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                                        onPress={() => removeImage(item)}
                                    >
                                        <Text className="text-white text-xs">×</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={{ paddingVertical: 8 }}
                        />
                    </View>
                )}


                <View className="flex-row items-center bg-neutral-100 rounded-full px-5 py-3 mx-4 mb-4">
                    <TouchableOpacity className="bg-orange-500 rounded-full w-9 h-9 items-center justify-center mr-4">
                        <Entypo name="camera" size={16} color="#fff" />
                    </TouchableOpacity>
                    <TextInput
                        className="flex-1 text-lg text-neutral-700"
                        placeholder="메시지 보내기..."
                        placeholderTextColor="#a3a3a3"
                        style={{ paddingVertical: 0, maxHeight: 100 }}
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
                        <TouchableOpacity className="bg-neutral-600 rounded-xl size-9 items-center justify-center ml-3">
                            <Ionicons name="arrow-up" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose={true}
                    enableDynamicSizing={false}
                    handleIndicatorStyle={{ backgroundColor: '#d1d5db', width: 40 }}
                    backgroundStyle={{ backgroundColor: '#ffffff' }}
                >
                    <BottomSheetView className="flex-1 px-4">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="font-bold text-lg">사진 선택</Text>
                            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
                                <AntDesign name="close" size={22} color="#222" />
                            </TouchableOpacity>
                        </View>
                        <BottomSheetFlatList
                            data={galleryAssets}
                            numColumns={4}
                            keyExtractor={item => item.id}
                            renderItem={renderGalleryItem}
                        />
                        <View className="absolute bottom-0 left-0 right-0 bg-white pt-4 px-4 border-t border-neutral-200">
                            <View className="flex-row justify-between items-center">
                                <TouchableOpacity
                                    className="flex-row items-center"
                                    onPress={pickFromNativeGallery}
                                >
                                    <Ionicons name="images" size={22} color="#2563eb" />
                                    <Text className="ml-2 text-blue-600 font-semibold">갤러리에서 선택</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`bg-blue-600 px-5 py-2 rounded-full ${selectedAssets.length === 0 ? 'opacity-50' : ''}`}
                                    disabled={selectedAssets.length === 0}
                                    onPress={confirmSelectImages}
                                >
                                    <Text className="text-white font-bold">추가하기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
