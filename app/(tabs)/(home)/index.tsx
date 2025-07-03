import DotPaginator from '@/components/DotPaginator';
import { Entypo } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';



const reportData = [
  { id: '1', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '2', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '3', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '4', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '5', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '6', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '7', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '8', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
  { id: '9', title: '골든리트리버를 데리고 있습니다!', description: '서울공원에서 목걸이를 하고 있던 강아..', location: '합정동', type: '강아지' },
];

const numColumns = 4;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const boxSize = (width - numColumns * 8) / numColumns;
  const [activePage, setActivePage] = useState(0);
  const flatListRef = useRef(null);

  const itemsPerPage = 3;
  const paginatedData = [];
  for (let i = 0; i < reportData.length; i += itemsPerPage) {
    paginatedData.push(reportData.slice(i, i + itemsPerPage));
  }


  const pageWidth = width * 0.92 - 48;
  const pageSpacing = 24;

  const onScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / (pageWidth + pageSpacing));
    setActivePage(page);
  };

  const scrollToPage = (pageIndex) => {
    flatListRef.current?.scrollToOffset({ offset: pageIndex * (pageWidth + pageSpacing), animated: true });
    setActivePage(pageIndex);
  };

  const renderReportItem = ({ item }) => (
    <Link href={`/map/rescues/${item.id}`}>
      <View className="flex-row items-center w-full py-5">
        <View>
          <Image
            source={{ uri: 'https://picsum.photos/200/300' }}
            className="w-28 h-28 rounded-2xl"
          />
        </View>
        <View className="ml-5 flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg text-neutral-700 font-semibold" numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text className="text-neutral-500 text-sm" numberOfLines={1} ellipsizeMode="tail">
              {item.description}
            </Text>
          </View>
          <View className="flex-row mt-4">
            <View className="flex-row items-center bg-neutral-100 px-2 py-1 rounded-md">
              <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
              <Text className="text-xs text-neutral-600 ml-1">{item.location}</Text>
            </View>
            <View className="ml-2 flex-row items-center bg-neutral-100 px-2 py-1 rounded-md">
              <Text className="text-xs text-neutral-600 ml-1">{item.type}</Text>
            </View>
          </View>
        </View>
      </View>
    </Link>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView className="flex-1 bg-neutral-100">
        <View className="px-6 flex-row items-center justify-between bg-neutral-100 pt-2">
          <View className='flex-row items-center'>
            <FontAwesome5 name="map-marker-alt" size={18} color="#404040" />
            <Text className='font-semibold ml-2 text-lg'>중동 주변</Text>
          </View>
          <View className="flex-row justify-end items-center">
            <Pressable onPress={() => console.log("bell")}>
              <FontAwesome5 name="bell" size={27} color="black" />
            </Pressable>
            <Pressable onPress={() => console.log("search")} className="ml-4">
              <Ionicons name="search" size={28} color="black" />
            </Pressable>
          </View>

        </View>
        <View className="flex-row w-full bg-neutral-100 pt-8 px-4">

          <Link href="/(tabs)/(home)/reports" asChild>
            <TouchableOpacity className="flex-1 bg-white rounded-3xl p-6 mr-4 justify-between">
              <View>
                <Text className="text-2xl font-bold text-neutral-800 mb-2">제보하기</Text>
                <Text className="text-lg text-neutral-600">유기동물을 목격했어요.</Text>
              </View>
              <Image
                source={require('@/assets/images/2.png')}
                className="w-24 h-24 self-end"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Link>
          <View className="flex-1 justify-between">
            <View className="bg-white rounded-2xl p-4 mb-4 flex-row items-center">
              <View className="flex-1">
                <Text className="text-xl font-bold text-neutral-800 mb-1">구조요청</Text>
                <Text className="text-base text-neutral-500 pb-3">동물을 찾고있어요.</Text>
                <Image
                  source={require("@/assets/images/3.png")}
                  className="w-10 h-10 self-end"
                  resizeMode="contain"
                />
              </View>
            </View>

            <Link href="/(tabs)/(home)/my-pet" asChild>
              <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-800 mb-1">내 애완동물</Text>
                  <Text className="text-base text-neutral-500">동물 정보를 기록해요.</Text>
                  <Image
                    source={require("@/assets/images/1.png")}
                    className="w-10 h-10 self-end"
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View className='px-6 py-4 bg-neutral-100'>
          <View className='flex-row items-center justify-between'>
            <Link href={"/(tabs)/(home)/donation"}>
              <View className=' rounded-2xl bg-white  size-32 p-4 relative'>
                <Text className='text-neutral-800 font-bold text-xl'>동전 기부</Text>
                <View className='absolute bottom-4 right-4'>
                  <FontAwesome5 name="coins" size={31} color="#bbbbbb" />
                </View>
              </View>
            </Link>
            <View className=' rounded-2xl bg-white size-32 p-4 relative'>
              <Text className='text-neutral-800 font-bold text-xl'>모임</Text>
              <View className='absolute bottom-4 right-4'>
                <MaterialIcons name="pets" size={31} color="#bbbbbb" />
              </View>
            </View>

            <Link href={"/(tabs)/(home)/events"}>
              <View className=' rounded-2xl bg-white size-32 p-4 relative'>
                <Text className='text-neutral-800 font-bold text-xl'>이벤트</Text>
                <View className='absolute bottom-4 right-4'>
                  <Entypo name="megaphone" size={33} color="#bbbbbb" />
                </View>
              </View>
            </Link>
          </View>
        </View>
        <View className="w-full bg-slate-500 h-32 mt-8"></View>
        <View className="px-6 bg-white pt-16 pb-6">
          <View className="flex-row items-center justify-between pb-5">
            <Text className="text-neutral-800 text-2xl font-bold">방금 올라온 목격담</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="refresh" size={16} color="#a3a3a3" />
              <Text className="text-neutral-400 font-semibold ml-2">방금 전</Text>
            </View>
          </View>
          <View>
            <FlatList
              ref={flatListRef}
              data={paginatedData}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={pageWidth + pageSpacing}
              snapToAlignment="start"
              decelerationRate="fast"
              onMomentumScrollEnd={onScrollEnd}
              renderItem={({ item }) => (
                <View style={{ width: pageWidth, marginRight: pageSpacing }}>
                  <FlatList
                    data={item}
                    renderItem={renderReportItem}
                    keyExtractor={(report) => report.id}
                    scrollEnabled={false}
                  />
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
            />
            <View className="pt-6 items-center">
              <DotPaginator total={paginatedData.length} active={activePage} onPress={scrollToPage} />
            </View>
          </View>
        </View>
        <View className="px-6 pt-8 pb-20 mt-8 ">
          <Text className="text-neutral-800 text-2xl pb-6 font-bold">자주 묻는 질문</Text>
          <View className="rounded-2xl border border-neutral-200 bg-white px-6">

            <View className="flex-row items-center border-b border-neutral-200 py-5">
              <Feather name="message-circle" size={20} color="#5B81FF" />
              <Text className="text-neutral-800 text-base ml-3">반려동물을 잃어버렸어요.</Text>
            </View>

            <View className="flex-row items-center border-b border-neutral-200 py-5">
              <Feather name="message-circle" size={20} color="#5B81FF" />
              <Text className="text-neutral-800 text-base ml-3">반려동물을 잃어버렸어요.</Text>
            </View>

            <View className="flex-row items-center  border-b border-neutral-200 py-5">
              <Feather name="message-circle" size={20} color="#5B81FF" />
              <Text className="text-neutral-800 text-base ml-3">반려동물을 잃어버렸어요.</Text>
            </View>
            <View className="flex-row justify-between mt-6 pb-6">
              <Link href={"/auth"} className="flex-row items-center flex-1 justify-center">
                <Feather name="clipboard" size={18} color="#262626" />
                <Text className="text-neutral-800 text-base ml-2">이용방법</Text>
              </Link>
              <View className="w-px bg-neutral-300 mx-2" />
              <Pressable className="flex-row items-center flex-1 justify-center">
                <Feather name="message-square" size={18} color="#262626" />
                <Text className="text-neutral-800 text-base ml-2">1:1상담</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

