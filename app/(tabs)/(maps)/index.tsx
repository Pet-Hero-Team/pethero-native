import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';

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
  const [isMapMoved, setIsMapMoved] = useState(false);
  const [isInitialRegionSet, setIsInitialRegionSet] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  const snapPoints = useMemo(() => [60, 300, 620], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index >= 0 && index < snapPoints.length) {
      setCurrentSnapIndex(index);
    } else {
      console.warn('Invalid snap index:', index, 'Reverting to index 0');
      setCurrentSnapIndex(0);
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      }
    }
  }, [snapPoints]);

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
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
      <Text>hi</Text>
    );
  }, [item, loading, error]);

  const renderContent = () => {
    return currentSnapIndex === 0 ? minContent : mainContent;
  };

  const moveToUserLocation = async () => {
    if (userLocation && mapRef.current) {
      const currentRegionData = currentRegion || {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      };

      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: currentRegionData.latitudeDelta,
        longitudeDelta: currentRegionData.longitudeDelta,
      }, 350);
    } else {
      console.log('위치 정보를 사용할 수 없습니다.');
    }
  };

  const handleRegionChange = useCallback((region: Region) => {
    setCurrentRegion(region);
  }, []);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setCurrentRegion(region);
    if (isInitialRegionSet) {
      setIsMapMoved(true);
    } else {
      setIsInitialRegionSet(true);
    }
  }, [isInitialRegionSet]);

  const handleResearchLocation = useCallback(() => {
    setIsMapMoved(false);
  }, []);

  const renderHandle = useCallback(() => {
    return (
      <View className="h-6 items-center justify-center relative">
        <View className="bg-gray-300 w-11 h-1.5 rounded-full mt-2" />
        <View className='absolute px-4 -top-14 z-50 w-full flex-row justify-between'>
          <View className='flex-row items-center'>
            <View className='bg-orange-200 flex-row items-center border border-orange-400 rounded-full px-4 py-3'>
              <Ionicons name="flag" size={15} color="#ea580c" />
              <Text className='text-orange-600 ml-1 font-bold '>구조</Text>
            </View>
            <View className='bg-white flex-row items-center border border-neutral-300 rounded-full px-4 py-3 ml-3'>
              <AntDesign name="exclamationcircle" size={15} color="#525252" />
              <Text className='text-neutral-600 ml-2 font-bold '>제보</Text>
            </View>
          </View>

          <Pressable
            onPress={moveToUserLocation}
            className="bg-white p-2 rounded-full shadow-lg"
          >
            <MaterialIcons name="my-location" size={24} color="#262626" />
          </Pressable>
        </View>
      </View>
    );
  }, [moveToUserLocation]);

  return (
    <View style={styles.container} className="relative">
      <View className="absolute z-50 top-20 w-full px-6">
        <View className="flex-row items-center w-full">
          <View className="flex-1 flex-row items-center bg-white rounded-full px-6">
            <Fontisto name="search" size={18} color="#737373" />
            <TextInput
              className="flex-1 ml-4 py-3 text-base mb-1 text-neutral-600"
              placeholder="검색"
              placeholderTextColor="#737373"
            />
          </View>
          <Pressable
            className="ml-3 w-12 h-12 rounded-full bg-white items-center justify-center"
            onPress={() => { console.log('search!') }}
          >
            <MaterialIcons name="pets" size={18} color="#ea580c" />
          </Pressable>
        </View>
        {isMapMoved && currentSnapIndex !== 2 && (
          <Pressable onPress={handleResearchLocation}>
            <View className='bg-neutral-800 mx-auto px-4 py-2 rounded-full mt-6 flex-row items-center'>
              <Ionicons name="refresh" size={15} color="#f5f5f5" />
              <Text className='ml-2 text-xs font-bold text-neutral-100'>현 지도 재검색</Text>
            </View>
          </Pressable>
        )}
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        region={{
          latitude: userLocation?.latitude || 37.5665,
          longitude: userLocation?.longitude || 126.9780,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        maxDynamicContentSize={600}
        overDragResistanceFactor={0}
        handleComponent={renderHandle}
        handleIndicatorStyle={{ display: 'none' }}
        backgroundStyle={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        containerStyle={{ zIndex: 2000 }}
        onAnimate={(fromIndex, toIndex) => {
          return null
        }}
        animationConfigs={{
          duration: 250,
          damping: 80,
          stiffness: 500,
          mass: 0.8,
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
});