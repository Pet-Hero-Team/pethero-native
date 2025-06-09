import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function ChatsScreen() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const tabs = [
    { id: 'group', label: '그룹' },
    { id: 'private', label: '개인' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className='flex-1'>
        <View className='px-6 flex-none'>
          <Text className="text-3xl font-bold text-neutral-800">채팅</Text>
        </View>
        {activeTab === null ? (
          <View className='flex-1 justify-center items-center'>
            <Text className="text-neutral-800 text-center font-bold text-2xl mb-2">
              채팅에 오신걸 환영합니다!
            </Text>
            <Text className="text-neutral-600 text-center mt-3 leading-6">
              반려동물을 찾는 제보와 함께{"\n"}여러가지 활동이 가능한 공간입니다.
            </Text>
            <TouchableOpacity
              className='mt-6 px-4 py-2 flex-row items-center justify-center rounded-full bg-orange-200'
              onPress={() => setActiveTab('group')}
            >
              <Entypo name="plus" size={16} color="#ea580c" />
              <Text className='ml-1 font-semibold text-orange-600'>채팅 시작하기</Text>
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
                  <Text className={`text-base text-center ${activeTab === tab.id ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-1 justify-start items-center px-1">
              {activeTab === 'group' ? (
                <View className='w-full pt-2'>
                  <View className='w-full px-4 py-4 flex-row justify-between'>
                    <View className='flex-row items-center'>
                      <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full" />
                      <View className='ml-5'>
                        <View className='flex-row items-center'>
                          <Text className='font-bold text-slate-700 text-sm mr-1'>수색 중</Text>
                          <MaterialCommunityIcons name="map-search-outline" size={16} color="#334155" />
                        </View>
                        <Text className='text-neutral-800 font-bold text-lg'>라이</Text>
                        <Text className='text-neutral-600 mt-1 text-sm'>서울 중앙공원에서 갈색 포메 유기견 봤던거..</Text>
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <Text className="text-sm text-neutral-500 mb-2">02:11</Text>
                      <View className="bg-orange-200 rounded-full w-6 h-6 flex-row items-center justify-center mt-2">
                        <Text className="text-orange-500 font-semibold text-sm text-center">2</Text>
                      </View>
                    </View>

                  </View>
                  <View className='w-full px-4 py-4 flex-row justify-between'>
                    <View className='flex-row items-center'>
                      <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full" />
                      <View className='ml-5'>
                        <View className='flex-row items-center'>
                          <Text className='font-bold text-slate-700 text-sm mr-1'>수색 중</Text>
                          <MaterialCommunityIcons name="map-search-outline" size={16} color="#334155" />
                        </View>
                        <Text className='text-neutral-800 font-bold text-lg'>럭키</Text>
                        <Text className='text-neutral-600 mt-1 text-sm'>그러게요 아니면 그쪽 CCTV 찾아보는것도 ..</Text>
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <Text className="text-sm text-neutral-500 mb-2">02:11</Text>
                    </View>

                  </View>
                  <View className='w-full px-4 py-4 flex-row justify-between'>
                    <View className='flex-row items-center'>
                      <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full" />
                      <View className='ml-5'>
                        <View className='flex-row items-center'>
                          <Text className='font-bold text-orange-500 text-sm mr-1'>수색완료</Text>
                          <MaterialCommunityIcons name="shield-check-outline" size={16} color="#f97316" />
                        </View>
                        <Text className='text-neutral-800 font-bold text-lg'>라이</Text>
                        <Text className='text-neutral-600 mt-1 text-sm'>진짜 다행입니다ㅎㅎㅎ</Text>
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <Text className="text-sm text-neutral-500 mb-2">01:18</Text>
                    </View>

                  </View>
                  <View className='w-full px-4 py-4 flex-row justify-between bg-neutral-100'>
                    <View className='flex-row items-center'>
                      <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full" />
                      <View className='ml-5'>
                        <View className='flex-row items-center'>
                          <Text className='font-bold text-red-500 text-sm mr-1'>종료</Text>
                          <MaterialCommunityIcons name="progress-close" size={16} color="#ef4444" />
                        </View>
                        <Text className='text-neutral-800 font-bold text-lg'>라이</Text>
                        <Text className='text-neutral-600 mt-1 text-sm'>그래도 여러분 감사합니다😿</Text>
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <Text className="text-sm text-neutral-500 mb-2">01:18</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View className='w-full pt-2'>
                  <View className='w-full px-4 py-4 flex-row justify-between'>
                    <View className='flex-row items-center'>
                      <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full" />
                      <View className='ml-5'>
                        <Text className='text-neutral-800 font-bold text-lg'>김필중</Text>
                        <Text className='text-neutral-600 mt-1 text-sm'>그쪽으로 바로 가겠습니다!</Text>
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <Text className="text-sm text-neutral-500 mb-2">02:11</Text>
                    </View>
                  </View>
                  <View className='w-full px-4 py-4 flex-row justify-between'>
                    <View className='flex-row items-center'>
                      <Image source={{ uri: "https://picsum.photos/200/300" }} className="w-16 h-16 rounded-full" />
                      <View className='ml-5'>
                        <Text className='text-neutral-800 font-bold text-lg'>차무식</Text>
                        <Text className='text-neutral-600 mt-1 text-sm'>네네 감사합니다☺️</Text>
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <Text className="text-sm text-neutral-500 mb-2">02:11</Text>
                      <View className="bg-orange-200 rounded-full w-6 h-6 flex-row items-center justify-center mt-2">
                        <Text className="text-orange-500 font-semibold text-sm text-center">1</Text>
                      </View>
                    </View>

                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView >
  );
}
