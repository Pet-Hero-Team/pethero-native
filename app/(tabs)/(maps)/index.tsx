import { supabase } from '@/supabase/supabase';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Link, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import PagerView from 'react-native-pager-view';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const posts = [
  { id: 1, title: 'Restaurant Territórios', image: { uri: 'https://picsum.photos/500/300' } },
  { id: 2, title: 'Les Champs Libres', image: { uri: 'https://picsum.photos/500/300' } },
  { id: 3, title: 'Les Champs Libres', image: { uri: 'https://picsum.photos/500/300' } },
];

interface Item {
  id: string;
  title: string;
  address: string;
  price?: number;
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
  moveToUserLocation,
}: {
  items: Item[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  moveToLocation: (latitude: number, longitude: number, id?: string) => void;
  onBack: () => void;
  moveToUserLocation: () => Promise<void>;
}) => {
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    setCurrentPage(currentPage);
    if (pagerRef.current) {
      pagerRef.current.setPage(currentPage);
    }
  }, [currentPage, setCurrentPage]);

  return (
    <View className="absolute left-0 right-0 bottom-4 z-50 w-full" pointerEvents="box-none">
      <View className="flex-row justify-between mb-3 px-4">
        <Pressable onPress={onBack} className="bg-white p-2 rounded-full shadow-lg z-[60]">
          <Ionicons name="arrow-back" size={24} color="#262626" />
        </Pressable>
        <Pressable onPress={moveToUserLocation} className="bg-white p-2 rounded-full shadow-lg z-[60]">
          <MaterialIcons name="my-location" size={24} color="#262626" />
        </Pressable>
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={currentPage}
        className="w-full"
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          setCurrentPage(index);
          if (items[index]) {
            moveToLocation(items[index].latitude, items[index].longitude);
          }
        }}
        pointerEvents="auto"
      >
        {items.map((item) => (
          <View key={item.id} style={styles.pagerSlide} className="bg-white py-6 px-8 rounded-2xl">
            <View>
              <View className="flex-row justify-between items-center w-full">
                <View>
                  <Text className="text-xl text-neutral-800 font-bold mr-1">{item.title}</Text>
                  <View className="flex-row items-center mt-1">
                    <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                    <Text className="text-sm text-neutral-600 ml-1">{item.address}</Text>
                  </View>
                  {item.price && (
                    <Text className="font-semibold text-lg text-neutral-800 mt-1">
                      {item.price.toLocaleString('ko-KR')}₩
                    </Text>
                  )}
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
                <Link href={`/map/${item.price ? 'rescues' : 'reports'}/${item.id}`} asChild>
                  <Pressable
                    onPress={() => moveToLocation(item.latitude, item.longitude)}
                    className="flex-1 bg-slate-700 py-3 rounded-lg ml-2"
                  >
                    <Text className="text-white text-lg font-bold text-center">상세정보</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        ))}
      </PagerView>
    </View>
  );
};

export default function MapsScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollOffset = useRef(0);
  const tabBarHeight = useBottomTabBarHeight();
  const [currentSnapIndex, setCurrentSnapIndex] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapMoved, setIsMapMoved] = useState(false);
  const [isInitialRegionSet, setIsInitialRegionSet] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [dataType, setDataType] = useState<'rescues' | 'reports'>('rescues');
  const [currentArea, setCurrentArea] = useState<string>('위치 정보 로드 중...');
  const router = useRouter();
  const [isMinimalUI, setIsMinimalUI] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastSnapIndexBeforeMapMode, setLastSnapIndexBeforeMapMode] = useState(0);

  const snapPoints = useMemo(() => [60, 400, 620], []);
  const itemsPerPage = 10;

  const fetchData = async (region: Region, dataType: 'rescues' | 'reports') => {
    if (!userLocation) {
      console.log('사용자 위치 정보가 없어 데이터를 가져올 수 없습니다.');
      setError('사용자 위치 정보를 가져오는 중입니다. 잠시 후 다시 시도하세요.');
      return;
    }
    try {
      setLoading(true);
      const { latitude, longitude } = region;
      console.log(`Fetching ${dataType} with userLocation:`, userLocation, 'region:', region);

      const { data, error } = await supabase.rpc(
        dataType === 'rescues' ? 'get_rescues_with_distance' : 'get_reports_with_distance',
        {
          user_latitude: userLocation.latitude,
          user_longitude: userLocation.longitude,
        }
      );

      console.log(`${dataType} RPC response:`, { data, error });

      if (error) {
        throw new Error(`${dataType === 'rescues' ? '구조' : '목격'} 데이터 조회 실패: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log(`No ${dataType} data found for the given location.`);
        setItems([]);
        setDisplayedItems([]);
        setError(null);
        return;
      }

      const processedData: Item[] = data.map((item: any) => ({
        id: item.id,
        title: item.title || '제목 없음',
        address: item.address || '위치 정보 없음',
        price: dataType === 'rescues' ? item.bounty || 0 : undefined,
        distance: item.distance ? `${item.distance.toFixed(0)}km` : '알 수 없음',
        area: item.address?.split(' ')[1] || '지역 정보 없음',
        imageUrl: item.image_url || 'https://picsum.photos/200/300',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
      }));

      console.log(`Processed ${dataType} data:`, processedData);

      setItems(processedData);
      setDisplayedItems(processedData);
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(`${dataType === 'rescues' ? '구조' : '목격'} 데이터를 불러오지 못했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAdministrativeArea = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const [location] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = location.city || location.region || '';
      const district = location.district || '';
      return city && district ? `${city} ${district}` : city || district || '위치 정보 없음';
    } catch (err) {
      console.error('Reverse geocode error:', err);
      return '위치 정보 없음';
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('위치 권한이 허용되지 않았습니다. 설정에서 권한을 허용해주세요.');
          setCurrentArea('위치 권한 필요');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        };
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setCurrentRegion(initialRegion);
        const area = await getAdministrativeArea(location.coords.latitude, location.coords.longitude);
        setCurrentArea(area);
        if (mapRef.current) {
          mapRef.current.animateToRegion(initialRegion, 0);
        }
        // 위치 정보가 설정된 후 fetchData 호출
        await fetchData(initialRegion, 'rescues');
      } catch (err) {
        console.error('Location fetch error:', err);
        setError('위치를 가져오지 못했습니다. 네트워크 상태를 확인해주세요.');
        setCurrentArea('위치 정보 없음');
      }
    })();
  }, []);

  useEffect(() => {
    if (userLocation && currentRegion && isInitialRegionSet && !loading) {
      fetchData(currentRegion, dataType);
    }
  }, [dataType, isInitialRegionSet]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index >= 0 && index < snapPoints.length) {
        setCurrentSnapIndex(index);
        if (!isMinimalUI) {
          setLastSnapIndexBeforeMapMode(index);
        }
        if (index === 2 && scrollOffset.current > 0) {
          flatListRef.current?.scrollToOffset({ offset: scrollOffset.current, animated: false });
        }
      } else {
        console.warn('Invalid snap index:', index, 'Reverting to index 0');
        setCurrentSnapIndex(0);
        setLastSnapIndexBeforeMapMode(0);
        if (bottomSheetRef.current) {
          bottomSheetRef.current.snapToIndex(0);
        }
      }
    },
    [snapPoints, isMinimalUI]
  );

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
          <Text className="ml-2 font-semibold text-neutral-700">{currentArea}</Text>
        </View>
      </View>
    ),
    [currentArea]
  );

  const renderContent = useCallback(() => {
    if (currentSnapIndex === 0) {
      return minContent;
    }

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

    const recentItems = items.length >= 3 ? items.slice(0, 3) : items;
    const displayItems = items.length >= 3 ? (currentSnapIndex === 2 ? items.slice(3) : items.slice(3, 5)) : items;

    return (
      <FlatList
        ref={flatListRef}
        data={displayItems}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback
            onPress={() => {
              moveToLocation(item.latitude, item.longitude, item.id);
              setIsMinimalUI(true);
            }}
          >
            <View className="px-6 pb-6">
              <View className="flex-row justify-between items-center w-full">
                <View>
                  <Text className="text-xl text-neutral-800 font-bold mr-1">{item.title}</Text>
                  <View className="flex-row items-center mt-1">
                    <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                    <Text className="text-sm text-neutral-600 ml-1">{item.address}</Text>
                  </View>
                  {item.price !== undefined && (
                    <Text className="font-semibold text-lg text-neutral-800 mt-1">
                      {Number(item.price).toLocaleString('ko-KR')}₩
                    </Text>
                  )}
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
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={currentSnapIndex === 2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={() => (
          <View className="w-full px-6 pt-2 mb-8">
            {recentItems.length > 0 && (
              <>
                <View className="flex-row items-center mb-4">
                  <Text className="text-neutral-700 font-bold text-lg mr-1">
                    {currentArea} 주변 {dataType === 'rescues' ? '구조' : '목격'} 게시글
                  </Text>
                  <TouchableOpacity activeOpacity={0.7}>
                    <MaterialIcons name="auto-awesome" size={14} color="#353535" />
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {recentItems.map((item) => (
                    <View
                      key={item.id}
                      className="w-[184px] h-[144px] rounded-lg overflow-hidden bg-white justify-end"
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-full h-full absolute"
                        resizeMode="cover"
                      />
                      <View className="w-full py-2 px-3">
                        <Text
                          className="text-white text-base font-semibold"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={{ width: 160, overflow: 'hidden' }}
                        >
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        )}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.y;
          console.log('Scroll position:', scrollOffset.current);
          if (currentSnapIndex === 2 && scrollOffset.current <= 0 && e.nativeEvent.velocity?.y > 0) {
            bottomSheetRef.current?.snapToIndex(1);
          }
        }}
        scrollEventThrottle={16}
      />
    );
  }, [currentSnapIndex, items, loading, error, moveToLocation, setIsMinimalUI, minContent, dataType, currentArea]);

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
      const area = await getAdministrativeArea(userLocation.latitude, userLocation.longitude);
      setCurrentArea(area);
      await fetchData(currentRegionData, dataType);
    } else {
      console.log('위치 정보를 사용할 수 없습니다.');
      setError('위치 정보를 사용할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const moveToLocation = (latitude: number, longitude: number, id?: string) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: currentRegion?.latitudeDelta || 0.015,
        longitudeDelta: currentRegion?.longitudeDelta || 0.0121,
      }, 350);
    }
    if (id) {
      const index = items.findIndex((item) => item.id === id);
      if (index !== -1) {
        setCurrentPage(index);
        setIsMinimalUI(true);
      }
    }
  };

  const handleRegionChange = useCallback((region: Region) => {
    setCurrentRegion(region);
  }, []);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setCurrentRegion(region);
      if (!isInitialRegionSet) {
        setIsInitialRegionSet(true);
      } else {
        setIsMapMoved(true);
      }
    },
    [isInitialRegionSet]
  );

  const handleResearchLocation = useCallback(() => {
    setIsMapMoved(false);
    if (currentRegion) {
      fetchData(currentRegion, dataType);
      bottomSheetRef.current?.snapToIndex(1);
      getAdministrativeArea(currentRegion.latitude, currentRegion.longitude).then(setCurrentArea);
    }
  }, [currentRegion, dataType]);

  const handleSearchPress = () => {
    router.push('/(maps)/search');
  };

  const renderHandle = useCallback(() => {
    return (
      <View className="h-6 items-center justify-center relative z-10">
        <View className="bg-gray-300 w-11 h-1.5 rounded-full mt-2" />
        <View className="absolute px-4 -top-14 z-50 w-full flex-row justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => {
                setDataType('rescues');
                if (currentRegion && userLocation) {
                  fetchData(currentRegion, 'rescues');
                  bottomSheetRef.current?.snapToIndex(1);
                  getAdministrativeArea(currentRegion.latitude, currentRegion.longitude).then(setCurrentArea);
                }
              }}
              className={`flex-row items-center border rounded-full px-4 py-3 ${dataType === 'rescues' ? 'bg-orange-200 border-orange-400' : 'bg-white border-neutral-300'}`}
            >
              <Ionicons name="flag" size={15} color={dataType === 'rescues' ? '#ea580c' : '#525252'} />
              <Text className={`ml-1 font-bold ${dataType === 'rescues' ? 'text-orange-600' : 'text-neutral-600'}`}>구조</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setDataType('reports');
                if (currentRegion && userLocation) {
                  fetchData(currentRegion, 'reports');
                  bottomSheetRef.current?.snapToIndex(1);
                  getAdministrativeArea(currentRegion.latitude, currentRegion.longitude).then(setCurrentArea);
                }
              }}
              className={`flex-row items-center border rounded-full px-4 py-3 ml-3 ${dataType === 'reports' ? 'bg-orange-200 border-orange-400' : 'bg-white border-neutral-300'}`}
            >
              <AntDesign name="exclamationcircle" size={15} color={dataType === 'reports' ? '#ea580c' : '#525252'} />
              <Text className={`ml-2 font-bold ${dataType === 'reports' ? 'text-orange-600' : 'text-neutral-600'}`}>목격</Text>
            </Pressable>
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
  }, [moveToUserLocation, dataType, currentRegion, userLocation]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <GestureHandlerRootView style={styles.container} className="relative">
      <View className="absolute z-50 top-20 w-full px-6" style={isMinimalUI ? { display: 'none' } : {}}>
        <Pressable onPress={handleSearchPress}>
          <View className="flex-1 flex-row items-center justify-between bg-white rounded-lg pl-6 pr-4">
            <View className="flex-row items-center py-4 text-base">
              <Text className="text-base font-bold text-[#c7c7c7]">구조, 목격, 모임을 검색해보세요.</Text>
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
        onMapReady={() => console.log('Map ready, API Key:', Constants.expoConfig?.extra?.googleMapsApiKey)}
        clusteringEnabled={true}
        clusterColor="#ff5733"
        clusterTextColor="#ffffff"
      >
        {displayedItems.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            title={item.title}
            description={item.address}
            onPress={() => moveToLocation(item.latitude, item.longitude, item.id)}
          >
            <View className="items-center">
              <View className="bg-orange-500 rounded-full px-3 py-1">
                <Text className="text-white text-sm font-bold">
                  {item.price ? `${item.price.toLocaleString('ko-KR')}₩` : '목격'}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        enableContentPanningGesture={currentSnapIndex !== 2}
        enableHandlePanningGesture={!isMinimalUI}
        maxDynamicContentSize={600}
        overDragResistanceFactor={0}
        handleComponent={isMinimalUI ? null : renderHandle}
        handleIndicatorStyle={{ display: 'none' }}
        backgroundStyle={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        containerStyle={{ zIndex: 2000 }}
        animationConfigs={{
          duration: 250,
          damping: 80,
          stiffness: 500,
          mass: 0.8,
        }}
        style={isMinimalUI ? { display: 'none' } : {}}
      >
        <View className="items-center min-h-[200px] overflow-visible">
          {renderContent()}
        </View>
      </BottomSheet>

      {isMinimalUI && (
        <View className="flex-1 mx-4">
          <MapModeScreen
            items={displayedItems}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            moveToLocation={moveToLocation}
            onBack={() => setIsMinimalUI(false)}
            moveToUserLocation={moveToUserLocation}
          />
        </View>
      )}
    </GestureHandlerRootView>
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
  pagerSlide: {
    marginHorizontal: 16,
  },
});