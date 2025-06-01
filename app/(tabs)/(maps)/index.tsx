import Fontisto from '@expo/vector-icons/Fontisto';
import Foundation from '@expo/vector-icons/Foundation';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Item {
  id: string;
  title: string;
  gender: string;
  address: string;
  price: number;
  distance: string;
  area: string;
  imageUrl: string;
}

export default function MapsScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const snapPoints = useMemo(() => [60, 300, 600], []);

  console.log('Snap Points:', snapPoints);
  console.log('Screen Height:', SCREEN_HEIGHT);
  console.log('Tab Bar Height:', tabBarHeight);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('BottomSheet snap index:', index);
    setCurrentSnapIndex(index);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('위치 권한이 허용되지 않았습니다.');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        console.error('Location fetch error:', err);
        setError('위치를 가져오지 못했습니다.');
      }
    })();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 나중에 실 데이터 넣어야함
        const mockData: Item = {
          id: '1',
          title: '라이',
          gender: 'female',
          address: '서울시 강남구 32길 7',
          price: 350000,
          distance: '362m',
          area: '강남',
          imageUrl: 'https://picsum.photos/200/300',
        };
        setItem(mockData);
        setError(null);
      } catch (err) {
        console.error('Data fetch error:', err);
        setError('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const minContent = useMemo(
    () => (
      <View className='w-full px-6 pt-1'>
        <View className='flex-row'>
          <Fontisto name="map-marker-alt" size={14} color="#404040" />
          <Text className='ml-2 font-semibold text-neutral-700'>서울특별시 강남구</Text>
        </View>
      </View>
    ),
    []
  );

  const mainContent = useMemo(() => {
    if (loading) {
      return (
        <View className="px-6 pb-6" style={styles.center}>
          <Text className="text-lg text-neutral-600">로딩 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="px-6 pb-6" style={styles.center}>
          <Text className="text-lg text-red-500">{error}</Text>
        </View>
      );
    }

    if (!item) {
      return (
        <View className="px-6 pb-6" style={styles.center}>
          <Text className="text-lg text-neutral-600">데이터가 없습니다.</Text>
        </View>
      );
    }

    return (
      <View className="px-6 pb-6">
        <View className="flex-row justify-between items-center w-full">
          <View>
            <View className="flex-row items-center">
              <Text className="text-xl text-neutral-800 font-bold mr-1">{item.title}</Text>
              <Foundation
                name={item.gender === 'female' ? 'female-symbol' : 'male-symbol'}
                size={17}
                color="#ef4444"
              />
            </View>
            <View className="flex-row items-center mt-1">
              <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
              <Text className="text-sm text-neutral-600 ml-1">{item.address}</Text>
            </View>
            <Text className="font-semibold text-lg text-neutral-800 mt-1">
              {item.price.toLocaleString('ko-KR')}₩
            </Text>
            <Text className="text-xs text-neutral-500 mt-2">
              {item.distance} · {item.area}
            </Text>
          </View>
          <Image
            source={{ uri: item.imageUrl }}
            className="w-24 h-24 rounded-lg"
            onLoad={() => console.log('Image loaded')}
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
  }, [item, loading, error]);

  const renderContent = () => {
    return currentSnapIndex === 0 ? minContent : mainContent;
  };

  // 내 위치로 이동
  const moveToUserLocation = async () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 1000);
    } else {
      console.log('위치 정보를 사용할 수 없습니다.');
    }
  };

  return (
    <View style={styles.container} className="relative">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true} // 사용자 위치 표시
        region={{
          latitude: userLocation?.latitude || 37.78825,
          longitude: userLocation?.longitude || -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      />
      <Pressable
        onPress={moveToUserLocation}
        style={styles.locationButton}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg"
      >
        <MaterialIcons name="my-location" size={24} color="black" />
      </Pressable>
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
        <BottomSheetView style={[styles.contentContainer, { minHeight: 200, overflow: 'visible' }]}>
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
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    zIndex: 3000,
  },
});