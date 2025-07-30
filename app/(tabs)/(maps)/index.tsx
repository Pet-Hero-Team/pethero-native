import { supabase } from '@/supabase/supabase';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MapClustering from 'react-native-map-clustering';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { runOnJS } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

interface Item {
  id: string;
  title: string;
  description: string;
  address: string;
  distance: number;
  area: string;
  imageUrls: string[];
  latitude: number;
  longitude: number;
}

const ReportItem = memo(
  ({
    item,
    activeImageIndex,
    setImageIndex,
    flatListRef,
    moveToLocation,
  }: {
    item: Item;
    activeImageIndex: number;
    setImageIndex: (id: string, index: number) => void;
    flatListRef: React.RefObject<FlatList>;
    moveToLocation: (latitude: number, longitude: number, id?: string) => void;
  }) => {
    const imageFlatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const images = item.imageUrls.length > 0 ? item.imageUrls : [
      'https://picsum.photos/200/300',
      'https://picsum.photos/200/301',
      'https://picsum.photos/200/302',
    ];

    const REPORT_ITEM_IMAGE_WIDTH = SCREEN_WIDTH - 44;

    const handleImageScrollEnd = useCallback((event: any) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(contentOffsetX / REPORT_ITEM_IMAGE_WIDTH);
      if (newIndex !== activeImageIndex) {
        setImageIndex(item.id, newIndex);
      }
    }, [item.id, activeImageIndex, REPORT_ITEM_IMAGE_WIDTH, setImageIndex]);


    const tapGestureForDetail = Gesture.Tap()
      .onEnd(() => {
        runOnJS(router.push)(`/map/reports/${item.id}`);
      })
      .maxDuration(250)
      .numberOfTaps(1);

    const panGesture = Gesture.Pan()
      .activeOffsetX([-20, 20])
      .simultaneousWithExternalGesture(flatListRef);

    const combinedGesture = Gesture.Exclusive(panGesture, tapGestureForDetail);

    useEffect(() => {
      if (imageFlatListRef.current && activeImageIndex >= 0 && activeImageIndex < images.length) {
        imageFlatListRef.current.scrollToIndex({
          index: activeImageIndex,
          animated: false,
        });
      }
    }, [activeImageIndex, images.length]);

    return (
      <View className='mb-10'>
        {/* '지도에서 보기' 부분을 제외한 나머지 영역에 GestureDetector 적용 */}
        <GestureDetector gesture={combinedGesture}>
          <View>
            <View className='rounded-3xl' style={[styles.imageContainer, { width: REPORT_ITEM_IMAGE_WIDTH }]}>
              <FlatList
                ref={imageFlatListRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={REPORT_ITEM_IMAGE_WIDTH}
                snapToAlignment="start"
                decelerationRate="fast"
                onMomentumScrollEnd={handleImageScrollEnd}
                scrollEventThrottle={16}
                contentContainerStyle={[
                  { width: REPORT_ITEM_IMAGE_WIDTH * images.length },
                  images.length === 1 && { flexGrow: 1, justifyContent: 'center' }
                ]}
                bounces={false}
                scrollEnabled={images.length > 1}
                data={images}
                renderItem={({ item: imageUri, index }) => (
                  <Image
                    key={index}
                    source={{ uri: imageUri }}
                    style={[styles.flatListImage, { width: REPORT_ITEM_IMAGE_WIDTH, resizeMode: 'cover' }]}
                    cachePolicy="memory-disk"
                    fadeDuration={0}
                  />
                )}
                keyExtractor={(imageUri, index) => `${item.id}-${index}`}
                initialScrollIndex={activeImageIndex}
                getItemLayout={(data, index) => (
                  { length: REPORT_ITEM_IMAGE_WIDTH, offset: REPORT_ITEM_IMAGE_WIDTH * index, index }
                )}
                removeClippedSubviews={true}
                initialNumToRender={1}
                maxToRenderPerBatch={1}
                windowSize={5}
              />
              {images.length > 1 && (
                <View className="flex-row justify-center absolute bottom-4 w-full">
                  {images.map((_, index) => (
                    <View
                      key={index}
                      className={`h-2 w-2 mx-1 rounded-full ${activeImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </View>
              )}
            </View>
            <View className='pt-5 px-2'>
              <View className='flex-row items-center justify-between'>
                <Text className="text-xl text-neutral-800 font-bold" numberOfLines={1}>{item.title}</Text>
                <View className='flex-row items-center'>
                  <Fontisto name="map-marker-alt" size={12} color="#262626" />
                  <Text className="text-neutral-800 font-semibold ml-1">{item.distance.toFixed(0)}km</Text>
                </View>
              </View>
              <Text className="text-neutral-500 leading-6 mt-2" numberOfLines={2}>{item.description}</Text>
            </View>
          </View>
        </GestureDetector>
        {/* '지도에서 보기' Pressable은 GestureDetector 외부에 위치 */}
        <Pressable onPress={() => moveToLocation(item.latitude, item.longitude, item.id)} className='px-2'>
          <Text className='underline text-neutral-500 mt-4'>지도에서 보기</Text>
        </Pressable>
      </View>
    );
  }
);
ReportItem.displayName = 'ReportItem';

const MapModeScreen = memo(
  ({
    items,
    currentPage,
    onBack,
    moveToUserLocation,
    activeImageIndex,
    setImageIndex,
  }: {
    items: Item[];
    currentPage: number;
    onBack: () => void;
    moveToUserLocation: () => Promise<void>;
    activeImageIndex: number;
    setImageIndex: (id: string, index: number) => void;
  }) => {
    const item = items?.[currentPage];
    const imageFlatListRef = useRef<FlatList>(null);
    const router = useRouter();

    const images = item?.imageUrls.length > 0 ? item.imageUrls : [
      'https://picsum.photos/200/300',
      'https://picsum.photos/200/301',
      'https://picsum.photos/200/302',
    ];

    const IMAGE_DISPLAY_WIDTH = SCREEN_WIDTH - 56;

    const handleImageScrollEnd = useCallback((event: any) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(contentOffsetX / IMAGE_DISPLAY_WIDTH);
      if (item && newIndex !== activeImageIndex) {
        setImageIndex(item.id, newIndex);
      }
    }, [item, activeImageIndex, IMAGE_DISPLAY_WIDTH, setImageIndex]);

    const tapGesture = Gesture.Tap()
      .onEnd(() => {
        if (item) {
          runOnJS(router.push)(`/map/reports/${item.id}`);
        }
      })
      .maxDuration(250)
      .numberOfTaps(1);

    const panGesture = Gesture.Pan()
      .activeOffsetX([-20, 20]);

    const combinedGesture = Gesture.Exclusive(panGesture, tapGesture);

    useEffect(() => {
      if (imageFlatListRef.current && activeImageIndex >= 0 && activeImageIndex < images.length) {
        imageFlatListRef.current.scrollToIndex({
          index: activeImageIndex,
          animated: false,
        });
      }
    }, [activeImageIndex, images.length, IMAGE_DISPLAY_WIDTH]);

    if (!item) {
      return null;
    }

    const isScrollEnabled = images.length > 1;

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
        <View style={styles.pagerSlide} className="bg-white rounded-3xl mx-4">
          <GestureDetector gesture={combinedGesture}>
            <View>
              <View style={[styles.imageContainer, { width: IMAGE_DISPLAY_WIDTH, borderTopLeftRadius: 24, borderTopRightRadius: 24 }]}>
                <FlatList
                  ref={imageFlatListRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={IMAGE_DISPLAY_WIDTH}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleImageScrollEnd}
                  scrollEventThrottle={16}
                  contentContainerStyle={[
                    styles.scrollViewContent,
                    { width: IMAGE_DISPLAY_WIDTH * images.length },
                    images.length === 1 && { flexGrow: 1, justifyContent: 'center' }
                  ]}
                  bounces={false}
                  scrollEnabled={isScrollEnabled}
                  data={images}
                  renderItem={({ item: imageUri, index }) => (
                    <Image
                      key={index}
                      source={{ uri: imageUri }}
                      style={[{ width: IMAGE_DISPLAY_WIDTH, height: 220, resizeMode: 'cover' }]}
                      cachePolicy="memory-disk"
                      fadeDuration={0}
                    />
                  )}
                  keyExtractor={(imageUri, index) => `${item?.id}-${index}`}
                  initialScrollIndex={activeImageIndex}
                  getItemLayout={(data, index) => (
                    { length: IMAGE_DISPLAY_WIDTH, offset: IMAGE_DISPLAY_WIDTH * index, index }
                  )}
                  removeClippedSubviews={true}
                  initialNumToRender={1}
                  maxToRenderPerBatch={1}
                  windowSize={5}
                />
                {isScrollEnabled && (
                  <View className="flex-row justify-center absolute bottom-4 w-full">
                    {images.map((_, index) => (
                      <View
                        key={index}
                        className={`h-2 w-2 mx-1 rounded-full ${activeImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </View>
                )}
              </View>
              <View className="py-5 px-4">
                <Text className="text-lg text-neutral-800 font-semibold" numberOfLines={1}>{item.title}</Text>
                <Text className="text-neutral-500 leading-6" numberOfLines={2}>{item.description}</Text>
                <View className="flex-row items-center mt-3">
                  <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                  <Text className="text-sm text-neutral-600 ml-1">{item.address}</Text>
                </View>
              </View>
            </View>
          </GestureDetector>
        </View>
      </View>
    );
  }
);
MapModeScreen.displayName = 'MapModeScreen';

const ClusterMarkerContent = memo(({ pointCount, clusterSize }: { pointCount: number; clusterSize: number }) => (
  <View style={{
    width: clusterSize,
    height: clusterSize,
    borderRadius: clusterSize / 2,
    backgroundColor: '#ff5733',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Text style={{
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    }}>
      {pointCount}
    </Text>
  </View>
));
ClusterMarkerContent.displayName = 'ClusterMarkerContent';

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
  const [isInitialRegionSet, setIsInitialRegionSet] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [prevRegion, setPrevRegion] = useState<Region | null>(null);
  const [currentArea, setCurrentArea] = useState<string>('위치 정보 로드 중...');
  const router = useRouter();
  const [isMinimalUI, setIsMinimalUI] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [lastSnapIndexBeforeMapMode, setLastSnapIndexBeforeMapMode] = useState(0);
  const [enableContentPanning, setEnableContentPanning] = useState(true);
  const [clickedMarkerIds, setClickedMarkerIds] = useState<string[]>([]);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});
  const areaCache = useRef<Map<string, string>>().current;
  const [isWideView, setIsWideView] = useState(false);
  const [noDataInView, setNoDataInView] = useState(false);

  const [markerTracksViewChanges, setMarkerTracksViewChanges] = useState<{ [key: string]: boolean }>({});


  const snapPoints = useMemo(() => [80, 360, SCREEN_HEIGHT - tabBarHeight - 20], []);

  const debouncedRegion = useDebounce(currentRegion, 800);

  const setImageIndex = useCallback((id: string, index: number) => {
    setImageIndices((prev) => ({ ...prev, [id]: index }));
  }, []);

  const fetchData = async (region: Region) => {
    const fallbackLocation = userLocation || { latitude: 37.5665, longitude: 126.9780 };
    try {
      setLoading(true);
      setIsMapLoading(true);
      setNoDataInView(false);
      const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
      const min_lat = latitude - latitudeDelta / 2;
      const max_lat = latitude + latitudeDelta / 2;
      const min_lon = longitude - longitudeDelta / 2;
      const max_lon = longitude + longitudeDelta / 2;

      const { data, error } = await supabase.rpc('get_maps_reports_in_bounds', {
        user_latitude: fallbackLocation.latitude,
        user_longitude: fallbackLocation.longitude,
        min_lat,
        max_lat,
        min_lon,
        max_lon,
      });

      if (error) {
        throw new Error(`목격 데이터 조회 실패: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setItems([]);
        setDisplayedItems([]);
        setError(null);
        setNoDataInView(true);
        return;
      }

      const processedData: Item[] = data.map((item: any) => {
        let imageUrls = Array.isArray(item.image_urls) && item.image_urls.length > 0
          ? item.image_urls
          : ['https://picsum.photos/200/300', 'https://picsum.photos/200/301', 'https://picsum.photos/200/302'];

        if (item.image_url && typeof item.image_url === 'string') {
          imageUrls = [item.image_url, ...imageUrls.slice(1)];
        }

        return {
          id: item.id,
          title: item.title || '제목 없음',
          address: item.address || '위치 정보 없음',
          description: item.description || '설명 정보 없음',
          distance: item.distance || 0,
          area: item.address?.split(' ')[1] || '지역 정보 없음',
          imageUrls,
          latitude: item.latitude || 0,
          longitude: item.longitude || 0,
        };
      });

      setItems(processedData);
      setDisplayedItems(processedData);
      setError(null);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Data fetch error:', err);
      if (err.message.includes('rate limit') && retryCount < 3) {
        setError('데이터 요청 제한 초과, 잠시 후 재시도합니다...');
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchData(region);
        }, 5000);
      } else {
        setError(`목격 데이터를 불러오지 못했습니다: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setIsMapLoading(false);
    }
  };

  const getAdministrativeArea = async (latitude: number, longitude: number): Promise<string> => {
    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
    if (areaCache.has(cacheKey)) {
      return areaCache.get(cacheKey)!;
    }

    try {
      const [location] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = location.city || location.region || '';
      const district = location.district || '';
      const area = city && district ? `${city} ${district}` : city || district || '위치 정보 없음';
      areaCache.set(cacheKey, area);
      setRetryCount(0);
      return area;
    } catch (err: any) {
      console.error('Reverse geocode error:', err);
      if (err.message.includes('rate limit') && retryCount < 3) {
        setError('위치 정보 요청 제한 초과, 잠시 후 재시도합니다...');
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          getAdministrativeArea(latitude, longitude);
        }, 5000);
        return '위치 정보 로드 중...';
      }
      return '위치 정보 없음';
    }
  };

  const initializeLocation = async () => {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('위치 권한이 허용되지 않았습니다. 설정에서 권한을 허용해주세요.');
          setCurrentArea('위치 권한 필요');
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            continue;
          }

          const defaultRegion = {
            latitude: 37.5665,
            longitude: 126.9780,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          };
          setUserLocation({ latitude: defaultRegion.latitude, longitude: defaultRegion.longitude });
          setCurrentRegion(defaultRegion);
          setPrevRegion(defaultRegion);
          const area = await getAdministrativeArea(defaultRegion.latitude, defaultRegion.longitude);
          setCurrentArea(area);
          await fetchData(defaultRegion);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
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
        setPrevRegion(initialRegion);
        const area = await getAdministrativeArea(location.coords.latitude, location.coords.longitude);
        setCurrentArea(area);
        if (mapRef.current) {
          mapRef.current.animateToRegion(initialRegion, 0);
        }
        await fetchData(initialRegion);
        return;
      } catch (err) {
        console.error('Location fetch error:', err);
        attempts++;
        if (attempts < maxAttempts) {
          setError(`위치를 가져오지 못했습니다. ${maxAttempts - attempts}회 재시도...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        const defaultRegion = {
          latitude: 37.5665,
          longitude: 126.9780,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        };
        setUserLocation({ latitude: defaultRegion.latitude, longitude: defaultRegion.longitude });
        setCurrentRegion(defaultRegion);
        setPrevRegion(defaultRegion);
        const area = await getAdministrativeArea(defaultRegion.latitude, defaultRegion.longitude);
        setCurrentArea(area);
        await fetchData(defaultRegion);
      }
    }
  };

  const fetchNearestData = async () => {
    if (!userLocation) {
      Alert.alert('위치 정보 없음', '현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
      return;
    }
    setLoading(true);
    setIsMapLoading(true);

    try {
      const { data, error } = await supabase.rpc('get_nearest_maps_reports', {
        user_latitude: userLocation.latitude,
        user_longitude: userLocation.longitude,
      });

      if (error) {
        throw new Error(`가까운 목격 데이터 조회 실패: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setError('가까운 목격 데이터를 찾을 수 없습니다.');
        setLoading(false);
        setIsMapLoading(false);
        return;
      }

      const nearestItem = data[0];
      const newRegion = {
        latitude: nearestItem.latitude,
        longitude: nearestItem.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
        setCurrentRegion(newRegion);
        setPrevRegion(newRegion);
      }

      const area = await getAdministrativeArea(nearestItem.latitude, nearestItem.longitude);
      setCurrentArea(area);

      await fetchData(newRegion);

      setLoading(false);
      setIsMapLoading(false);
      setNoDataInView(false);
    } catch (err: any) {
      setError(`가까운 목격 데이터를 불러오지 못했습니다: ${err.message}`);
      setLoading(false);
      setIsMapLoading(false);
    }
  };


  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (debouncedRegion && isInitialRegionSet && !loading && prevRegion) {
      const distance = calculateDistance(
        debouncedRegion.latitude,
        debouncedRegion.longitude,
        prevRegion.latitude,
        prevRegion.longitude
      );
      if (distance >= 500) {
        fetchData(debouncedRegion);
        getAdministrativeArea(debouncedRegion.latitude, debouncedRegion.longitude).then(setCurrentArea);
        setPrevRegion(debouncedRegion);
      }
    }
  }, [debouncedRegion, isInitialRegionSet, prevRegion, loading]);

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
        setEnableContentPanning(true);
      } else {
        console.warn('Invalid snap index:', index, 'Reverting to index 0');
        setCurrentSnapIndex(0);
        setLastSnapIndexBeforeMapMode(0);
        setEnableContentPanning(true);
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
        setEnableContentPanning(false);
      }
    } else {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(lastSnapIndexBeforeMapMode);
        setEnableContentPanning(true);
      }
    }
  }, [isMinimalUI, lastSnapIndexBeforeMapMode]);

  const minContent = useMemo(
    () => (
      <View className="w-full flex-row justify-center pt-8 border-b border-neutral-200 pb-8">
        <View className="flex-row">
          {loading ? (
            <Text className="font-semibold text-neutral-800">
              {isWideView ? null : <Text className='font-bold'>{currentArea}</Text>} 로딩 중...
            </Text>
          ) : error ? (
            <Text className="font-semibold text-red-500">
              {isWideView ? null : <Text className='font-bold'>{currentArea}</Text>} 데이터 로드 실패
            </Text>
          ) : (
            <Text className="font-semibold text-neutral-800">
              {isWideView ? null : <Text className='font-bold'>{currentArea}</Text>} {items.length}개의 목격담
            </Text>
          )}
        </View>
      </View>
    ),
    [currentArea, items.length, loading, error, isWideView]
  );


  const renderCustomCluster = useCallback((cluster: any, onPress: () => void) => {
    const { pointCount, coordinate, clusterId } = cluster;
    const clusterSize = Math.min(pointCount * 2 + 10, 60);

    return (
      <Marker
        key={clusterId}
        coordinate={coordinate}
        onPress={onPress}
        tracksViewChanges={false}
      >
        <ClusterMarkerContent pointCount={pointCount} clusterSize={clusterSize} />
      </Marker>
    );
  }, []);

  const renderContent = useCallback(() => {
    if (currentSnapIndex === 0) {
      return null;
    }

    if (loading) {
      return (
        <View className="px-6 pb-6 flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#262626" />
          <Text className="text-lg text-neutral-600 mt-4">로딩 중...</Text>
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
        <View className="mt-8 mx-8">
          <Text className=" text-neutral-800 pt-6">(귀뚜라미 소리)...</Text>
          <Pressable onPress={fetchNearestData} className="py-4 mt-6 border-neutral-200 border rounded-xl">
            <Text className="font-semibold text-neutral-800 text-center">가까운 위치에서 찾기</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={items}
        className="px-6 pt-10"
        renderItem={({ item }) => (
          <ReportItem
            item={item}
            activeImageIndex={imageIndices[item.id] || 0}
            setImageIndex={setImageIndex}
            flatListRef={flatListRef}
            moveToLocation={moveToLocation}
          />
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={currentSnapIndex === 2}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          scrollOffset.current = e.nativeEvent.contentOffset.y;
          if (currentSnapIndex === 2 && scrollOffset.current < -70) {
            bottomSheetRef.current?.snapToIndex(1);
          }
        }}
        scrollEventThrottle={16}
        style={{ height: currentSnapIndex === 1 ? 360 : undefined }}
        nestedScrollEnabled={true}
      />
    );
  }, [currentSnapIndex, items, loading, error, imageIndices, setImageIndex, fetchNearestData, moveToLocation]);

  const moveToUserLocation = async () => {
    const fallbackLocation = userLocation || { latitude: 37.5665, longitude: 126.9780 };
    if (mapRef.current) {
      const currentRegionData = currentRegion || {
        latitude: fallbackLocation.latitude,
        longitude: fallbackLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      };

      mapRef.current.animateToRegion(
        {
          latitude: fallbackLocation.latitude,
          longitude: fallbackLocation.longitude,
          latitudeDelta: currentRegionData.latitudeDelta,
          longitudeDelta: currentRegionData.longitudeDelta,
        },
        350
      );
      const area = await getAdministrativeArea(fallbackLocation.latitude, fallbackLocation.longitude);
      setCurrentArea(area);
      await fetchData(currentRegionData);
      setPrevRegion(currentRegionData);
    } else {
      console.log('지도가 초기화되지 않았습니다.');
      setError('지도가 초기화되지 않았습니다. 앱을 재시작해주세요.');
    }
  };

  const moveToLocation = useCallback((latitude: number, longitude: number, id?: string) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      }, 350);
    }

    if (id) {
      const index = items.findIndex((item) => item.id === id);
      if (index !== -1) {
        setCurrentPage(index);
        setLastSnapIndexBeforeMapMode(currentSnapIndex);
        setIsMinimalUI(true);

        setClickedMarkerIds((prev) => {
          const newIds = [...new Set([...prev, id])];
          return newIds;
        });

        setMarkerTracksViewChanges((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => {
          setMarkerTracksViewChanges((prev) => ({ ...prev, [id]: false }));
        }, 500);
      }
    }
  }, [items, currentSnapIndex]);

  const handleBackFromMapMode = useCallback(() => {
    setIsMinimalUI(false);
    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(lastSnapIndexBeforeMapMode, { animated: false });
    }
  }, [lastSnapIndexBeforeMapMode]);

  const handleMapPress = useCallback(
    (event: any) => {

      if (!event.nativeEvent.action) {
        if (isMinimalUI) {
          console.log('Exiting minimal UI mode...');
          setIsMinimalUI(false);
          if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(lastSnapIndexBeforeMapMode, { animated: false });
          }
        } else if (currentSnapIndex === 1) {
          if (bottomSheetRef.current) {
            bottomSheetRef.current.snapToIndex(0);
          }
        } else {
          console.log('Map pressed, but no action taken based on current state.');
        }
      } else {
        console.log('Map press was a marker or cluster press, ignoring for snap point change.');
      }
    },
    [isMinimalUI, lastSnapIndexBeforeMapMode, currentSnapIndex]
  );

  const handleRegionChange = useCallback((region: Region) => {
    setCurrentRegion(region);
  }, []);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      setCurrentRegion(region);

      const isCurrentlyWide = region.latitudeDelta > 0.1;
      if (isCurrentlyWide !== isWideView) {
        setIsWideView(isCurrentlyWide);
      }

      if (!isInitialRegionSet) {
        setIsInitialRegionSet(true);
        setPrevRegion(region);
      }
    },
    [isInitialRegionSet, isWideView]
  );

  const renderHandle = useCallback(() => {
    return (
      <View className="items-center justify-center relative z-10 pt-4">
        <View className="bg-gray-300 w-11 h-1 rounded-full" />
        {minContent}
      </View>
    );
  }, [minContent]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <View style={styles.container} className="relative">
      {isMapLoading && (
        <View className="absolute z-50 top-20 w-full px-6">
          <View className="bg-white mx-auto p-3 rounded-full shadow-lg">
            <ActivityIndicator size="small" color="#262626" />
          </View>
        </View>
      )}

      <MapClustering
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
        clusterColor="#ff532c"
        clusterTextColor="#ffffff"
        onPress={handleMapPress}
        renderCustomCluster={renderCustomCluster}
      >
        {displayedItems.map((item) => (
          <Marker
            key={item.id}
            coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            onPress={() => moveToLocation(item.latitude, item.longitude, item.id)}
            tracksViewChanges={markerTracksViewChanges[item.id] || false}
          >
            <View className="items-center">
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor: clickedMarkerIds.includes(item.id) ? '#404040' : '#FFFFFF',
                  borderWidth: clickedMarkerIds.includes(item.id) ? 0 : 1,
                  borderColor: '#E5E5E5'
                }}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: clickedMarkerIds.includes(item.id) ? '#FFFFFF' : '#404040' }}
                >
                  목격
                </Text>
              </View>

            </View>
          </Marker>
        ))}
      </MapClustering>

      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        enableContentPanningGesture={enableContentPanning}
        enableHandlePanningGesture={!isMinimalUI}
        maxDynamicContentSize={SCREEN_HEIGHT - tabBarHeight - 20}
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
        <View style={{ flex: 1 }}>{renderContent()}</View>
      </BottomSheet>

      {isMinimalUI && (
        <View className="flex-1 mx-4">
          <MapModeScreen
            items={displayedItems}
            currentPage={currentPage}
            onBack={handleBackFromMapMode}
            moveToUserLocation={moveToUserLocation}
            activeImageIndex={imageIndices[displayedItems[currentPage]?.id] || 0}
            setImageIndex={setImageIndex}
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
  pagerSlide: {
    marginHorizontal: 16,
  },
  imageContainer: {
    overflow: 'hidden',
  },
  flatListImage: {
    height: 400,
  },
});