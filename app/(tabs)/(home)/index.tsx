import DotPaginator from '@/components/DotPaginator';
import SearchModal from '@/components/SearchModal'; // 새롭게 만든 SearchModal 컴포넌트를 가져옵니다.
import { PET_OPTIONS } from '@/constants/pet';
import { supabase } from '@/supabase/supabase';
import { signOut } from '@/utils/auth';
import { formatTimeAgo } from '@/utils/formating';
import { Entypo, Feather, FontAwesome5, Fontisto, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, FlatList, Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const fetchReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      id,
      title,
      description,
      address,
      created_at,
      reports_images (url)
    `)
    .order('created_at', { ascending: false })
    .limit(9);
  if (error) throw new Error(`제보 조회 실패: ${error.message}`);

  return data.map(report => ({
    id: report.id,
    title: report.title,
    description: report.description || '설명 없음',
    location: report.address || '위치 정보 없음',
    created_at: report.created_at,
    image: report.reports_images?.[0]?.url || null,
  }));
};

const getAnimalTypeLabel = (value) => {
  const option = PET_OPTIONS.find(option => option.value === value);
  return option ? option.label : '미지정';
};

const ReportItem = ({ item }) => {
  return (
    <Link href={`/map/reports/${item.id}`}>
      <View className="flex-row items-center w-full py-5">
        <View>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-28 h-28 rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-28 h-28 bg-neutral-100 rounded-2xl flex-row items-center justify-center">
              <MaterialIcons name="pets" size={24} color="#d4d4d4" />
            </View>
          )}
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
              <Text className="text-xs text-neutral-600 ml-1 max-w-40" numberOfLines={1}>{item.location}</Text>
            </View>
          </View>
          <Text className="text-xs text-neutral-400 mt-2">{formatTimeAgo(item.created_at)}</Text>
        </View>
      </View>
    </Link>
  );
};

const ReportItemSkeleton = () => {
  return (
    <SkeletonPlaceholder
      backgroundColor="#e5e7eb"
      highlightColor="#f3f4f6"
      speed={1000}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 20 }}>
        <View style={{ width: 112, height: 112, borderRadius: 16, marginRight: 20 }} />
        <View style={{ flex: 1 }}>
          <View style={{ width: '80%', height: 20, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: '60%', height: 14, borderRadius: 4, marginBottom: 16 }} />
          <View style={{ width: 100, height: 20, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: 50, height: 12, borderRadius: 4 }} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const boxSize = (width - 4 * 8) / 4;
  const [activePage, setActivePage] = useState(0);
  const flatListRef = useRef(null);

  // 모달 상태를 관리하는 새로운 상태 변수입니다.
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  const itemsPerPage = 3;
  const paginatedData = [];
  for (let i = 0; i < reports.length; i += itemsPerPage) {
    paginatedData.push(reports.slice(i, i + itemsPerPage));
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

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/signin');
    } catch (error) {
      Alert.alert('로그아웃 실패', (error as Error).message);
      console.error('로그아웃 에러:', (error as Error).message);
    }
  };

  const renderReportItem = ({ item }) => <ReportItem item={item} />;

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView className="flex-1 bg-neutral-100">
        <View className="px-6 flex-row items-center justify-between bg-neutral-100 pt-2">
          <View className='flex-row items-center'>
            <FontAwesome5 name="map-marker-alt" size={18} color="#404040" />
            <Text className='font-semibold ml-2 text-lg'>중동 주변</Text>
          </View>
          <View className="flex-row justify-end items-center">
            <Link href="/(tabs)/(home)/notifications" asChild>
              <FontAwesome5 name="bell" size={27} color="black" />
            </Link>
            {/* 검색 버튼을 눌렀을 때 모달을 열도록 수정했습니다. */}
            <Pressable onPress={() => setIsSearchModalVisible(true)} className="ml-4">
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
            <Link href="/(tabs)/(home)/rescues" asChild>
              <TouchableOpacity className="bg-white rounded-2xl p-4 mb-4 flex-row items-center">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-neutral-800 mb-1">구조요청</Text>
                  <Text className="text-base text-neutral-500 pb-3">동물을 찾고있어요.</Text>
                  <Image
                    source={require("@/assets/images/3.png")}
                    className="w-10 h-10 self-end"
                    resizeMode="contain"
                  />
                </View>
              </TouchableOpacity>
            </Link>
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
              <View className='rounded-2xl bg-white size-32 p-4 relative'>
                <Text className='text-neutral-800 font-bold text-xl'>동전 기부</Text>
                <View className='absolute bottom-4 right-4'>
                  <FontAwesome5 name="coins" size={31} color="#bbbbbb" />
                </View>
              </View>
            </Link>
            <View className='rounded-2xl bg-white size-32 p-4 relative'>
              <Text className='text-neutral-800 font-bold text-xl'>모임</Text>
              <View className='absolute bottom-4 right-4'>
                <MaterialIcons name="pets" size={31} color="#bbbbbb" />
              </View>
            </View>
            <Link href={"/(tabs)/(home)/events"}>
              <View className='rounded-2xl bg-white size-32 p-4 relative'>
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
            <Text className="text-neutral-800 text-2xl font-bold">방금 올라온 목격담 </Text>
            <View className="flex-row items-center">
              <MaterialIcons name="refresh" size={16} color="#a3a3a3" />
              <Text className="text-neutral-400 font-semibold ml-2">방금 전</Text>
            </View>
          </View>
          <View>
            {isLoading ? (
              <View style={{ width: pageWidth }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <ReportItemSkeleton key={index} />
                ))}
              </View>
            ) : error ? (
              <Text className="text-red-500 text-center">오류: {(error as Error).message}</Text>
            ) : (
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
            )}
            <View className="pt-6 items-center">
              <DotPaginator total={paginatedData.length} active={activePage} onPress={scrollToPage} />
            </View>
          </View>
        </View>
        <View className="px-6 pt-8 pb-20 mt-8">
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
            <View className="flex-row items-center border-b border-neutral-200 py-5">
              <Feather name="message-circle" size={20} color="#5B81FF" />
              <Text className="text-neutral-800 text-base ml-3">반려동물을 잃어버렸어요.</Text>
            </View>
            <View className="flex-row justify-between mt-6 pb-6">
              <Link href={"/auth"} className="flex-row items-center flex-1 justify-center">
                <Feather name="clipboard" size={18} color="#262626" />
                <Text className="text-neutral-800 text-base ml-2">이용방법</Text>
              </Link>
              <View className="w-px bg-neutral-300 mx-2" />
              <Pressable className="flex-row items-center flex-1 justify-center" onPress={handleLogout}>
                <Feather name="message-square" size={18} color="#262626" />
                <Text className="text-neutral-800 text-base ml-2">1:1상담</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* SearchModal 컴포넌트를 렌더링합니다. */}
      <SearchModal
        isVisible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
      />
    </SafeAreaView>
  );
}
