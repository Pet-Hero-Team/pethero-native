import { Entypo, Fontisto, Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const messages = [
    { id: '1', fromMe: false, text: '안녕하세요!' },
    { id: '2', fromMe: false, text: '찾는 상황은 어떤가요?' },
    { id: '3', fromMe: false, text: '아는게 있다면 꼭 저에게 알려주시면 감사하겠습니다.' },
    { id: '4', fromMe: true, replyTo: '', text: '안녕하세요' },
    { id: '5', fromMe: true, replyTo: '아는게 있다면 꼭 저에게 알려주시면 감사하겠습니다.', text: '저도 꼭 라이를 찾아주고 싶네요, 마지막으로 봤던 장소가 어디였나요?' },
];

export default function GroupChatScreen() {
    const [value, setValue] = useState("");
    return (
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
            <View className="flex-row items-center bg-neutral-100 rounded-full px-5 py-3 mx-4">
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
                        <TouchableOpacity className="ml-3">
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
        </SafeAreaView>
    );
}
