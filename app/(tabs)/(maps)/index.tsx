import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import PagerView from 'react-native-pager-view';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface Item {
  id: string;
  title: string;
  gender: string;
  address: string;
  price: number;
  distance: string;
  area: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

const MapModeScreen = ({
  items,
  currentPage,
  setCurrentPage,
  moveToLocation,
  onBack,
  moveToUserLocation
}: {
  items: Item[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  moveToLocation: (latitude: number, longitude: number) => void;
  onBack: () => void;
  moveToUserLocation: () => Promise<void>;
}) => {
  useEffect(() => {
    setCurrentPage(currentPage);
  }, []);

  return (
    <>
      <View className='absolute left-0 right-0 bottom-4 z-50 w-full' pointerEvents="box-none">
        <View className='flex-row justify-between mb-3'>
          <Pressable onPress={onBack} className="bg-white p-2 rounded-full shadow-lg z-[60]"><Ionicons name="arrow-back" size={24} color="#262626" /></Pressable>
          <Pressable onPress={moveToUserLocation} className="bg-white p-2 rounded-full shadow-lg z-[60]"><MaterialIcons name="my-location" size={24} color="#262626" /></Pressable>
        </View>
        <PagerView
          style={styles.pagerView}
          initialPage={currentPage}
          className='w-full'
          onPageSelected={(e) => {
            const position = e.nativeEvent.position;
            setCurrentPage(position);
            if (items[position]) {
              moveToLocation(items[position].latitude, items[position].longitude);
            }
          }}
          pointerEvents="auto"
        >
          {items.map((item) => (
            <View key={item.id} style={styles.pagerSlide} className='bg-white py-6 px-8 rounded-2xl'>
              <View>
                <View className="flex-row justify-between items-center w-full">
                  <View>
                    <View className="flex-row items-center">
                      <Text className="text-xl text-neutral-800 font-bold mr-1">{item.title}</Text>
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
                    onPress={() => moveToLocation(item.latitude, item.longitude)}
                    className="flex-1 bg-slate-700 py-3 rounded-lg ml-2"
                  >
                    <Text className="text-white text-lg font-bold text-center">상세정보</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </PagerView>
      </View>
    </>
  );
};

export default function MapsScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapMoved, setIsMapMoved] = useState(false);
  const [isInitialRegionSet, setIsInitialRegionSet] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const router = useRouter();
  const [isMinimalUI, setIsMinimalUI] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastSnapIndexBeforeMapMode, setLastSnapIndexBeforeMapMode] = useState(0);

  const snapPoints = useMemo(() => [60, 210, 620], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index >= 0 && index < snapPoints.length) {
      setCurrentSnapIndex(index);
      if (!isMinimalUI) {
        setLastSnapIndexBeforeMapMode(index);
      }
    } else {
      console.warn('Invalid snap index:', index, 'Reverting to index 0');
      setCurrentSnapIndex(0);
      setLastSnapIndexBeforeMapMode(0);
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      }
    }
  }, [snapPoints, isMinimalUI]);

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
        const mockData: Item[] = [
          {
            id: '1',
            title: '라이',
            gender: 'female',
            address: '경기도 부천시 부천로 1',
            price: 350000,
            distance: '362m',
            area: '부천',
            imageUrl: 'https://picsum.photos/200/300',
            latitude: 37.4989,
            longitude: 126.7833,
          },
          {
            id: '2',
            title: '바둑이',
            gender: 'male',
            address: '경기도 부천시 부천로 151',
            price: 200000,
            distance: '1.2km',
            area: '부천',
            imageUrl: 'https://picsum.photos/200/301',
            latitude: 37.4845,
            longitude: 126.7827,
          },
        ];
        setItems(mockData);
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

  useEffect(() => {
    if (isMinimalUI) {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      }
    } else {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(lastSnapIndexBeforeMapMode);
      }
    }
  }, [isMinimalUI, lastSnapIndexBeforeMapMode]);

  const minContent = useMemo(
    () => (
      <View className="w-full px-6 pt-1">
        <View className="flex-row">
          <Fontisto name="map-marker-alt" size={14} color="#404040" />
          <Text className="ml-2 font-semibold text-neutral-700">서울특별시 강남구</Text>
        </View>
      </View>
    ),
    []
  );

  const mainContent = useMemo(() => {
    if (loading) {
      return (
        <View className="px-6 pb-6 flex-1 justify-center items-center">
          <Text className="text-lg text-neutral-600">로딩 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="px-6 pb-6 flex-1 justify-center items-center">
          <Text className="text-lg text-red-500">{error}</Text>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View className="px-6 pb-6 flex-1 justify-center items-center">
          <Text className="text-lg text-neutral-600">데이터가 없습니다.</Text>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={() => {
        moveToLocation(items[0].latitude, items[0].longitude);
        setIsMinimalUI(true);
      }}>
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center w-full">
            <View>
              <View className="flex-row items-center">
                <Text className="text-xl text-neutral-800 font-bold mr-1">{items[0].title}</Text>
              </View>
              <View className="flex-row items-center mt-1">
                <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                <Text className="text-sm text-neutral-600 ml-1">{items[0].address}</Text>
              </View>
              <Text className="font-semibold text-lg text-neutral-800 mt-1">
                {items[0].price.toLocaleString('ko-KR')}₩
              </Text>
              <Text className="text-xs text-neutral-500 mt-2">
                {items[0].distance} · {items[0].area}
              </Text>
            </View>
            <Image
              source={{ uri: items[0].imageUrl }}
              className="w-24 h-24 rounded-lg"
              onLoad={() => console.log('Image loaded')}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }, [items, loading, error, currentRegion]);

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

  const moveToLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: currentRegion?.latitudeDelta || 0.015,
        longitudeDelta: currentRegion?.longitudeDelta || 0.0121,
      }, 350);
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

  const handleSearchPress = () => {
    router.push('/(maps)/search');
  };

  const renderHandle = useCallback(() => {
    return (
      <View className="h-6 items-center justify-center relative z-10">
        <View className="bg-gray-300 w-11 h-1.5 rounded-full mt-2" />
        <View className="absolute px-4 -top-14 z-50 w-full flex-row justify-between">
          <View className="flex-row items-center">
            <View className="bg-orange-200 flex-row items-center border border-orange-400 rounded-full px-4 py-3">
              <Ionicons name="flag" size={15} color="#ea580c" />
              <Text className="text-orange-600 ml-1 font-bold">구조</Text>
            </View>
            <View className="bg-white flex-row items-center border border-neutral-300 rounded-full px-4 py-3 ml-3">
              <AntDesign name="exclamationcircle" size={15} color="#525252" />
              <Text className="text-neutral-600 ml-2 font-bold">제보</Text>
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
      <View className="absolute z-50 top-20 w-full px-6" style={isMinimalUI ? { display: 'none' } : {}}>
        <Pressable onPress={handleSearchPress}>
          <View className="flex-1 flex-row items-center justify-between bg-white rounded-lg pl-6 pr-4">
            <View className="flex-row items-center py-4 text-base">
              <Text className="text-base font-bold text-[#c7c7c7]">구조, 제보, 모임을 검색해보세요.</Text>
            </View>
            <Fontisto name="search" size={18} color="#737373" />
          </View>
        </Pressable>
        {isMapMoved && currentSnapIndex !== 2 && (
          <Pressable onPress={handleResearchLocation}>
            <View className="bg-neutral-800 mx-auto px-4 py-3 rounded-full mt-6 flex-row items-center">
              <Ionicons name="refresh" size={15} color="#f5f5f5" />
              <Text className="ml-2 text-xs font-bold text-neutral-100">현 지도 재검색</Text>
            </View>
          </Pressable>
        )}
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={true}
        rotateEnabled={false}
        region={{
          latitude: userLocation?.latitude || 37.5665,
          longitude: userLocation?.longitude || 126.9780,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {items.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.title}
            description={item.address}
          >
            <View className="items-center">
              <View className="bg-orange-500 rounded-full p-2">
                <Fontisto name="map-marker-alt" size={24} color="white" />
              </View>
              <Text className="text-xs text-neutral-800 font-bold mt-1">{item.title}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        maxDynamicContentSize={600}
        overDragResistanceFactor={0}
        handleComponent={isMinimalUI ? null : renderHandle}
        handleIndicatorStyle={{ display: 'none' }}
        backgroundStyle={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        containerStyle={{ zIndex: 2000 }}
        onAnimate={(fromIndex, toIndex) => null}
        animationConfigs={{
          duration: 250,
          damping: 80,
          stiffness: 500,
          mass: 0.8,
        }}
        style={isMinimalUI ? { display: 'none' } : {}}
        enableContentPanningGesture={!isMinimalUI}
        enableHandlePanningGesture={!isMinimalUI}
      >
        <BottomSheetView className="items-center min-h-[200px] overflow-visible">
          {renderContent()}
        </BottomSheetView>
      </BottomSheet>

      {isMinimalUI && (
        <View className='flex-1 mx-4'>
          <MapModeScreen
            items={items}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            moveToLocation={moveToLocation}
            onBack={() => setIsMinimalUI(false)}
            moveToUserLocation={moveToUserLocation}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pagerView: {
    height: 205,
  },
});