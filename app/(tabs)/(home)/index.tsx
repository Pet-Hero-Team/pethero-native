import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, Text, useWindowDimensions, View } from 'react-native';
const data = [
  { key: '1', label: '구조요청' },
  { key: '2', label: '유기동물' },
  { key: '3', label: '동물병원' },
  { key: '4', label: '보호소' },
  { key: '5', label: '모임' },
  { key: '6', label: '동물카페' },
  { key: '7', label: '미용샵' },
  { key: '8', label: '산책코스' },
];

const numColumns = 4;


export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const boxSize = (width - 1 * numColumns * 8) / numColumns;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className='flex-1'>
        <View className='px-6 flex-none'>
          <View className='flex-row justify-end items-center'>
            <Pressable onPress={() => console.log("bell")}>
              <FontAwesome5 name="bell" size={27} color="black" />
            </Pressable>
            <Pressable onPress={() => console.log("search")} className='ml-4'>
              <Ionicons name="search" size={28} color="black" />
            </Pressable>
          </View>
          <Text className="text-3xl font-bold text-neutral-800 mt-8">
            <Text className='text-orange-500'>문경민님,</Text> 반가워요!{'\n'}
            영웅적인 활동을 기대할게요.
          </Text>
          {/* 여기에 점수같은 느낌으로 채워지듯이 경험치 ? 비슷하게 구현 */}
          <View className='mt-12'>
            <Text className="text-neutral-800 text-lg font-semibold">카테고리별 항목</Text>
            <FlatList
              className='mt-3'
              data={data}
              numColumns={numColumns}
              renderItem={({ item }) => (
                <View
                  style={{ width: boxSize, height: boxSize, }}
                >
                  <View className="w-16 h-16 mx-auto bg-neutral-100 rounded-2xl justify-center items-center">
                    <FontAwesome5 name="hands-helping" size={24} color="#8595a9" />
                  </View>
                  <Text className="text-xs text-neutral-700 font-bold text-center mt-1">{item.label}</Text>
                </View>
              )}
              keyExtractor={item => item.key}
              contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
            />
          </View>
        </View>
        <View className='w-full bg-slate-200 h-32 mt-8'></View>
        <View className='mt-12'>
          <Text className="text-neutral-800 text-xl font-bold px-6">실시간 구조</Text>
          <View className='flex-row items-center px-6 mt-3'>
            <View className='flex-row items-center bg-slate-800 px-4 py-2 rounded-lg'>
              <FontAwesome5 name="hands-helping" size={13} color="#ececec" />
              <Text className='text-white text-sm ml-1'>구조</Text>
            </View>
            <View className='flex-row items-center bg-slate-100 px-4 py-2 rounded-lg ml-4'>
              <FontAwesome5 name="hands-helping" size={13} color="#474747" />
              <Text className='text-neutral-800 text-sm ml-1'>소식</Text>
            </View>
            <View className='flex-row items-center bg-slate-100 px-4 py-2 rounded-lg ml-4'>
              <FontAwesome5 name="hands-helping" size={13} color="#474747" />
              <Text className='text-neutral-800 text-sm ml-1'>모임</Text>
            </View>
          </View>
          <View className='px-6 mt-8 pb-12'>
            <View className="flex-row justify-between items-center w-full border-b-[0.5px] border-neutral-200 pb-4">
              <View>
                <View className='flex-row items-center'>
                  <Text className="text-xl text-neutral-800 font-bold mr-1">라이</Text>
                  <Foundation name="female-symbol" size={17} color="#ef4444" />
                </View>
                <View className='flex-row items-center mt-1'>
                  <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                  <Text className="text-sm text-neutral-600 ml-1">서울시 강남구 32길 7</Text>
                </View>

                {/* <Foundation name="male-symbol" size={24} color="black" /> */}
                {/* <Fontisto name="neuter" size={24} color="black" /> */}
                <Text className="font-semibold text-lg text-neutral-800 mt-1">350,000₩</Text>
                <Text className="text-xs text-neutral-500 mt-2">
                  362m ·강남
                </Text>

              </View>
              <Image
                source={{ uri: 'https://picsum.photos/200/300' }}
                className="w-24 h-24 rounded-lg"
              />
            </View>
            <View className="flex-row justify-between items-center w-full pt-6">
              <View>
                <View className='flex-row items-center'>
                  <Text className="text-xl text-neutral-800 font-bold mr-1">라이</Text>
                  <Foundation name="female-symbol" size={17} color="#ef4444" />
                </View>
                <View className='flex-row items-center mt-1'>
                  <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                  <Text className="text-sm text-neutral-600 ml-1">서울시 강남구 32길 7</Text>
                </View>

                {/* <Foundation name="male-symbol" size={24} color="black" /> */}
                {/* <Fontisto name="neuter" size={24} color="black" /> */}
                <Text className="font-semibold text-lg text-neutral-800 mt-1">350,000₩</Text>

              </View>
              <View>
                <Image
                  source={{ uri: 'https://picsum.photos/200/300' }}
                  className="w-24 h-24 rounded-lg"
                />

              </View>

            </View>
            <View className='flex flex-row items-center justify-between w-full mt-2  border-b-[0.5px] border-neutral-200 pb-4'>
              <Text className="text-xs text-neutral-500">
                362m ·강남
              </Text>
              <View className='flex-row items-center'>
                <Ionicons name="people" size={14} color="#737373" />
                <Text className='text-neutral-500 text-xs ml-[2px]'>3</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

