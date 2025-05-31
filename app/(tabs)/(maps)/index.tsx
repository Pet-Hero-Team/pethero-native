import Fontisto from '@expo/vector-icons/Fontisto';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MapsScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);


  const snapPoints = useMemo(() => [50, 300, SCREEN_HEIGHT - tabBarHeight], []);


  const [items, setItems] = useState(
    Array.from({ length: 10 }, (_, i) => ({ id: i.toString(), title: `아이템 ${i + 1}` }))
  );


  console.log('Snap Points:', snapPoints);
  console.log('Screen Height:', SCREEN_HEIGHT);
  console.log('Tab Bar Height:', tabBarHeight);


  const handleSheetChanges = useCallback((index: number) => {
    console.log('BottomSheet snap index:', index);
    setCurrentSnapIndex(index);
  }, []);


  const loadMoreItems = useCallback(() => {
    setItems((prev) => [
      ...prev,
      ...Array.from({ length: 10 }, (_, i) => ({
        id: (prev.length + i).toString(),
        title: `아이템 ${prev.length + i + 1}`,
      })),
    ]);
  }, []);


  const renderContent = () => {
    if (currentSnapIndex === 0) {

      return (
        <View style={styles.minContent}>
          <Text className="text-lg text-neutral-800 font-bold">최소 상태</Text>
        </View>
      );
    } else if (currentSnapIndex === 1) {

      return (
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center w-full">
            <View>
              <View className="flex-row items-center">
                <Text className="text-xl text-neutral-800 font-bold mr-1">라이</Text>
                <Foundation name="female-symbol" size={17} color="#ef4444" />
              </View>
              <View className="flex-row items-center mt-1">
                <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                <Text className="text-sm text-neutral-600 ml-1">서울시 강남구 32길 7</Text>
              </View>
              <Text className="font-semibold text-lg text-neutral-800 mt-1">350,000₩</Text>
              <Text className="text-xs text-neutral-500 mt-2">362m ·강남</Text>
            </View>
            <Image
              source={{ uri: 'https://picsum.photos/200/300' }}
              className="w-24 h-24 rounded-lg"
            />
          </View>
          <View className="flex-row items-center justify-between mt-6">
            <Pressable
              onPress={() => console.log('제보하기')}
              className="flex-1 flex-row items-center justify-center bg-orange-500 py-3 rounded-lg mr-2"
            >
              <Ionicons name="people" size={17} color="white" />
              <Text className="text-sm text-white font-semibold ml-[1px]">3</Text>
              <Text className="text-white text-lg font-bold text-center ml-2">제보하기</Text>
            </Pressable>
            <Pressable
              onPress={() => console.log('상세정보')}
              className="flex-1 bg-slate-700 py-3 rounded-lg ml-2"
            >
              <Text className="text-white text-lg font-bold text-center">상세정보</Text>
            </Pressable>
          </View>
        </View>
      );
    } else {

      return (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text className="text-lg text-neutral-800">{item.title}</Text>
            </View>
          )}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View className="px-6 pb-6">
              <Text className="text-xl text-neutral-800 font-bold">전체 아이템 리스트</Text>
            </View>
          }
        />
      );
    }
  };

  return (
    <View style={styles.container} className="relative">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        handleIndicatorStyle={{ backgroundColor: '#d1d5db', width: 44, height: 5 }}
        backgroundStyle={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        containerStyle={{ zIndex: 2000 }}
        animationConfigs={{
          duration: 300,
          damping: 10,
          stiffness: 80,
          mass: 1,
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          {renderContent()}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  minContent: {
    padding: 16,
    alignItems: 'center',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});