import Entypo from '@expo/vector-icons/Entypo';
import { SafeAreaView, Text, View } from 'react-native';

export default function ChatsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className='flex-1'>
        <View className='px-6 flex-none'>
          <Text className="text-3xl font-bold text-neutral-800">채팅</Text>
        </View>
        <View className='flex-1 justify-center items-center'>
          <View className="bg-neutral-500 rounded-full">
          </View>
          <Text className="text-neutral-800 text-center font-bold text-2xl">채팅에 오신걸 환영합니다!</Text>
          <Text className="text-neutral-600 text-center mt-3 leading-6">반려동물을 찾는 제보와 함께{"\n"}여러가지 활동이 가능한 공간입니다.</Text >
          <View className='mt-6 px-4 py-2 flex-row items-center justify-center rounded-full mx-auto bg-orange-200'>
            <Entypo name="plus" size={16} color="#ea580c" />
            <Text className='ml-1 font-semibold text-orange-600'>채팅 시작하기</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

