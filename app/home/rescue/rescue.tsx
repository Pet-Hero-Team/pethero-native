import { PET_OPTIONS } from '@/constants/pet';
import { validationRules } from '@/constants/validationRules';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Entypo, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, useNavigation } from 'expo-router';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Vibration, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

const DASH_COUNT = 101;
const DASH_WIDTH = 1;
const DASH_GAP = 6;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN = 0;
const MAX = 1000000;
const STEP = 10000;
const UNIT = STEP;
const FormSection = ({ activeField, control, errors, trigger, isLoading }) => {
    const { setValue: formSetValue, getValues, trigger: formTrigger } = useFormContext();
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isDetailsFocused, setIsDetailsFocused] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [centerCoordinate, setCenterCoordinate] = useState({
        latitude: 37.5665,
        longitude: 126.9780,
    });
    const [centerAddress, setCenterAddress] = useState('주소를 가져오는 중...');
    const [addressCache, setAddressCache] = useState({});
    const mapRef = useRef(null);
    const scrollViewRef = useRef(null);
    const [prevOffset, setPrevOffset] = useState(0);


    const translateX = useSharedValue(0);
    const color = useSharedValue('#223240');

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: '위치 권한 거부',
                    text2: '위치 권한이 필요합니다.',
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            setCenterCoordinate({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    useEffect(() => {
        const cacheKey = `${centerCoordinate.latitude.toFixed(6)},${centerCoordinate.longitude.toFixed(6)}`;
        if (addressCache[cacheKey]) {
            setCenterAddress(addressCache[cacheKey]);
            formSetValue('location', {
                latitude: centerCoordinate.latitude,
                longitude: centerCoordinate.longitude,
                address: addressCache[cacheKey],
            });
            formTrigger('location');
            return;
        }

        const fetchAddress = debounce(async () => {
            try {
                const result = await Location.reverseGeocodeAsync({
                    latitude: centerCoordinate.latitude,
                    longitude: centerCoordinate.longitude,
                });
                const address = result[0] || {};
                const formattedAddress = [
                    address.city,
                    address.street,
                    address.name,
                ].filter(Boolean).join(', ') || '주소를 찾을 수 없습니다.';
                setCenterAddress(formattedAddress);
                setAddressCache((prev) => ({ ...prev, [cacheKey]: formattedAddress }));
                formSetValue('location', {
                    latitude: centerCoordinate.latitude,
                    longitude: centerCoordinate.longitude,
                    address: formattedAddress,
                });
                formTrigger('location');
            } catch (error) {
                const fallbackAddress = `위도: ${centerCoordinate.latitude.toFixed(6)}, 경도: ${centerCoordinate.longitude.toFixed(6)}`;
                setCenterAddress(fallbackAddress);
                setAddressCache((prev) => ({ ...prev, [cacheKey]: fallbackAddress }));
                formSetValue('location', {
                    latitude: centerCoordinate.latitude,
                    longitude: centerCoordinate.longitude,
                    address: fallbackAddress,
                });
                formTrigger('location');
            }
        }, 500);

        fetchAddress();
        return () => fetchAddress.cancel();
    }, [centerCoordinate, addressCache, formSetValue, formTrigger]);

    const moveToUserLocation = async () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            }, 1000);
            setCenterCoordinate({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
            });
        }
    };

    const handleRegionChangeComplete = (region) => {
        setCenterCoordinate({
            latitude: region.latitude,
            longitude: region.longitude,
        });
    };

    const handleCategorySelect = (value) => {
        formSetValue('category', value, { shouldValidate: true });
        formTrigger('category');
    };

    const DASH_COUNT = 101;
    const DASH_WIDTH = 1;
    const DASH_GAP = 6;
    const { width: SCREEN_WIDTH } = Dimensions.get('window');
    const MIN = 0;
    const MAX = 1000000;
    const STEP = 10000;
    const UNIT = STEP;
    const DASH_TOTAL_WIDTH = DASH_COUNT * (DASH_WIDTH + DASH_GAP);
    const CENTER_OFFSET = DASH_TOTAL_WIDTH / 2;

    const priceForOffset = (offset) => {
        const idx = Math.floor(offset / (DASH_WIDTH + DASH_GAP));
        let price = MIN + idx * UNIT;
        if (price < MIN) return MIN;
        if (price > MAX) return MAX;
        return price;
    };

    const offsetForPrice = (price) => {
        const idx = Math.floor(price / UNIT);
        return idx * (DASH_WIDTH + DASH_GAP);
    };

    useEffect(() => {
        if (scrollViewRef.current) {
            const initialOffset = 0;
            scrollViewRef.current.scrollTo({ x: initialOffset, animated: false });
            formSetValue('bounty', priceForOffset(0), { shouldValidate: true });
            formTrigger('bounty');
        }
    }, [scrollViewRef, formSetValue, formTrigger]);

    const triggerHapticsOnDash = (currentOffset) => {
        const dashIndex = Math.floor(currentOffset / (DASH_WIDTH + DASH_GAP));
        const prevDashIndex = Math.floor(prevOffset / (DASH_WIDTH + DASH_GAP));
        if (dashIndex !== prevDashIndex) {
            const distanceFromCenter = Math.abs((currentOffset + CENTER_OFFSET) % (DASH_WIDTH + DASH_GAP) - (DASH_WIDTH + DASH_GAP) / 2);
            const impactStyle = distanceFromCenter < 2 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;
            if (Platform.OS === 'ios') {
                Haptics.impactAsync(impactStyle).catch(console.error);
            } else if (Platform.OS === 'android') {
                Vibration.vibrate(distanceFromCenter < 2 ? 100 : 50);
            }
            setPrevOffset(currentOffset);
        }
    };

    const onScroll = (e) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const totalWidth = DASH_COUNT * (DASH_WIDTH + DASH_GAP);
        const maxOffset = totalWidth - (DASH_WIDTH + DASH_GAP);
        let newPrice = priceForOffset(offsetX);

        if (offsetX >= maxOffset) {
            newPrice = MAX;
        } else if (newPrice > MAX) {
            newPrice = MAX;
        }

        formSetValue('bounty', newPrice, { shouldValidate: true });
        formTrigger('bounty');


        triggerHapticsOnDash(offsetX);
    };

    const addBounty = (amount) => {
        const currentValue = getValues('bounty');
        const newValue = currentValue + amount;
        if (newValue <= MAX) {
            formSetValue('bounty', newValue, { shouldValidate: true });
            formTrigger('bounty');

            const newOffset = offsetForPrice(newValue);
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({ x: newOffset, animated: true });
            }
        } else {
            translateX.value = withTiming(-5, { duration: 100, easing: Easing.linear }, () => {
                translateX.value = withTiming(5, { duration: 100, easing: Easing.linear }, () => {
                    translateX.value = withTiming(0, { duration: 100, easing: Easing.linear });
                    color.value = '#223240';
                });
            });
            color.value = 'red';
            Toast.show({
                type: 'error',
                text1: '100만원을 넘을 수 없습니다',
                text2: '',
                position: 'top',
                visibilityTime: 2000,
            });
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(console.error);
            } else if (Platform.OS === 'android') {
                Vibration.vibrate(200);
            }
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            color: color.value,
        };
    });

    return (
        <View className="flex-1">
            {(!activeField || activeField === 'category') && (
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    <Text className="text-2xl mb-8 font-semibold">어떤 가족을 찾아야하나요?</Text>
                    {PET_OPTIONS.map((option) => (
                        <Pressable
                            key={option.value}
                            className={`mb-4 px-5 py-6 rounded-3xl ${getValues('category') === option.value ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} border`}
                            onPress={() => handleCategorySelect(option.value)}
                            disabled={isLoading}
                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                        >
                            <Text className="text-lg font-semibold">{option.label}</Text>
                        </Pressable>
                    ))}
                    {errors.category && (
                        <Text className="text-red-500 mt-2">{errors.category.message}</Text>
                    )}
                </ScrollView>
            )}
            {(!activeField || activeField === 'bounty') && (
                <View>
                    <Text className="text-2xl font-semibold">현상금을 설정할수있습니다.</Text>
                    <View className="mb-4">
                        <Controller
                            control={control}
                            name="bounty"
                            defaultValue={0}
                            render={({ field: { value } }) => (
                                <>
                                    <View className="flex-row items-end pt-4">
                                        <Animated.Text
                                            className="text-5xl font-bold"
                                            style={animatedStyle}
                                        >
                                            {value.toLocaleString()}
                                        </Animated.Text>
                                        <Text className="text-xl pl-1 font-bold text-neutral-700 pb-1">₩</Text>
                                    </View>
                                    <Text className="mt-3 mb-8 text-gray-600 leading-7">
                                        현상금을 설정하면 수색에 큰 도움이 될 수 있습니다.
                                    </Text>
                                    <View style={styles.sliderContainer}>
                                        <View style={styles.centerMark} />
                                        <ScrollView
                                            ref={scrollViewRef}
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            onScroll={onScroll}
                                            scrollEventThrottle={16}
                                            contentContainerStyle={styles.scrollContent}
                                            style={styles.scrollView}
                                        >
                                            <View style={styles.dashWrapper}>
                                                {[...Array(DASH_COUNT)].map((_, i) => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.dash,
                                                            { height: i % 10 === 0 ? 50 : 30 }
                                                        ]}
                                                    />
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                    <View style={styles.markContainer}>
                                        <View style={styles.mark}>
                                            <Text style={styles.markText}>0원</Text>
                                        </View>
                                        <View style={styles.mark}>
                                            <Text style={styles.markText}>100만원</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between mt-8">
                                        <Pressable
                                            className="bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-center"
                                            onPress={() => addBounty(10000)}
                                            disabled={isLoading}
                                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                                        >
                                            <Text className="text-lg font-semibold text-neutral-600">1만원</Text>
                                            <Entypo name="plus" size={18} color="#404040" />
                                        </Pressable>
                                        <Pressable
                                            className="bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-center"
                                            onPress={() => addBounty(50000)}
                                            disabled={isLoading}
                                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                                        >
                                            <Text className="text-lg font-semibold text-neutral-600">5만원</Text>
                                            <Entypo name="plus" size={18} color="#404040" />
                                        </Pressable>
                                        <Pressable
                                            className="bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-center"
                                            onPress={() => addBounty(100000)}
                                            disabled={isLoading}
                                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                                        >
                                            <Text className="text-lg font-semibold text-neutral-600">10만원</Text>
                                            <Entypo name="plus" size={18} color="#404040" />
                                        </Pressable>
                                        <Pressable
                                            className="bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-center"
                                            onPress={() => addBounty(MAX - getValues('bounty'))}
                                            disabled={isLoading || getValues('bounty') >= MAX}
                                            style={({ pressed }) => ({ opacity: pressed && !isLoading && getValues('bounty') < MAX ? 0.7 : 1 })}
                                        >
                                            <Text className="text-lg font-semibold text-neutral-600">최대</Text>
                                        </Pressable>
                                    </View>
                                </>
                            )}
                        />
                        {errors.bounty && <Text className="text-red-500 mt-2">{errors.bounty.message}</Text>}
                    </View>
                </View>
            )}
            {(!activeField || activeField === 'title') && (
                <View>
                    <Text className="text-2xl font-semibold">제목을 적어주세요</Text>
                    <Text className="mt-3 mb-8 text-gray-600">간단하게 알기쉬운 제목을 적어주세요.</Text>
                    <View className="mb-4">
                        <Controller
                            control={control}
                            name="title"
                            defaultValue=""
                            rules={validationRules.reportTitle}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('title');
                                    }}
                                    onFocus={() => setIsTitleFocused(true)}
                                    onBlur={() => setIsTitleFocused(false)}
                                    placeholder="예시) 집나간 고양이를 찾아주세요."
                                    placeholderTextColor="#9ca3af"
                                    className={`bg-white pb-5 text-xl border-b ${isTitleFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    maxLength={30}
                                    editable={!isLoading}
                                />
                            )}
                        />
                        <View className="flex-row items-center mt-2 justify-end">
                            <Text className="text-right text-sm text-gray-500">{getValues('title').length}/30</Text>
                        </View>
                        {errors.title && (
                            <Text className="text-red-500 mt-2">{errors.title.message}</Text>
                        )}
                    </View>
                </View>
            )}
            {(!activeField || activeField === 'details') && (
                <View className="flex-1">
                    <Text className="text-2xl font-semibold">상세한 경위를 적어주세요</Text>
                    <Text className="mt-3 mb-8 text-gray-600">마지막 실종 장소, 시간, 동물의 특징 등을 상세히 적어주세요.</Text>
                    <View className="flex-1 mb-4">
                        <Controller
                            control={control}
                            name="details"
                            defaultValue=""
                            rules={validationRules.reportDetails}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('details');
                                    }}
                                    onFocus={() => setIsDetailsFocused(true)}
                                    onBlur={() => setIsDetailsFocused(false)}
                                    placeholder="상세 정보를 입력하세요"
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={10}
                                    className={`flex-1 bg-white p-4 text-xl border rounded-xl ${isDetailsFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    style={{ textAlignVertical: 'top' }}
                                    maxLength={500}
                                    editable={!isLoading}
                                />
                            )}
                        />
                        <View className="flex-row items-center mt-2 justify-end">
                            <Text className="text-right text-sm text-gray-500">{getValues('details').length}/500</Text>
                        </View>
                        {errors.details && (
                            <Text className="text-red-500 mt-2">{errors.details.message}</Text>
                        )}
                    </View>
                </View>
            )}
            {(!activeField || activeField === 'location') && (
                <View className="flex-1">
                    <Text className="text-2xl font-semibold">마지막 목격 장소를 지정해주세요</Text>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg text-gray-600 flex-1 mr-2" numberOfLines={2}>
                            {centerAddress}
                        </Text>
                        <Pressable
                            className="bg-orange-500 p-2 rounded-xl"
                            onPress={moveToUserLocation}
                            disabled={isLoading}
                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                        >
                            <Ionicons name="location-outline" size={24} color="white" />
                        </Pressable>
                    </View>
                    <View className="flex-1 rounded-xl overflow-hidden">
                        <MapView
                            ref={mapRef}
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            showsUserLocation={true}
                            rotateEnabled={false}
                            region={{
                                latitude: centerCoordinate.latitude,
                                longitude: centerCoordinate.longitude,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.0121,
                            }}
                            onRegionChangeComplete={handleRegionChangeComplete}
                            scrollEnabled={!isLoading}
                            zoomEnabled={!isLoading}
                        />
                        <View style={styles.pinContainer}>
                            <Ionicons name="location-sharp" size={40} color="#ff0000" />
                        </View>
                    </View>
                    {errors.location && (
                        <Text className="text-red-500 mt-2">{errors.location.message}</Text>
                    )}
                </View>
            )}
        </View>
    );
};
const ImageUploadSection = ({ control, setValue, getValues, isLoading, trigger }) => {
    const [images, setImages] = useState(getValues('images') || []);

    useEffect(() => {
        setValue('images', images);
        trigger('images');
    }, [images, setValue, trigger]);

    useEffect(() => {
        setImages(getValues('images') || []);
    }, []);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: '권한 필요',
                    text2: '갤러리 접근 권한이 필요합니다.',
                    position: 'top',
                    visibilityTime: 3000,
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImages = result.assets.map((asset) => asset.uri);
                const updatedImages = [...images, ...newImages].slice(0, 5);
                if (newImages.length + images.length > 5) {
                    Toast.show({
                        type: 'error',
                        text1: '업로드 제한',
                        text2: '최대 5장까지 업로드할 수 있습니다.',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                }
                setImages(updatedImages);
                trigger('images');
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: '오류',
                text2: '이미지 선택 중 오류가 발생했습니다.',
                position: 'top',
                visibilityTime: 3000,
            });
        }
    };

    const removeImage = (uri) => {
        setImages(images.filter((img) => img !== uri));
    };

    return (
        <View>
            <Text className="text-2xl font-semibold">이미지 업로드</Text>
            <Text className="mt-3 mb-8 text-gray-600">동물의 사진을 업로드해주세요. (최소 1장, 최대 5장)</Text>
            <View className="flex-row flex-wrap">
                {images.map((uri, index) => (
                    <View key={index} className="w-1/2 p-1">
                        <View className="relative">
                            <Image
                                source={{ uri }}
                                className="w-full h-40 rounded-xl"
                                resizeMode="cover"
                            />
                            <Pressable
                                className="absolute top-2 right-2 bg-neutral-800 rounded-full p-1"
                                onPress={() => removeImage(uri)}
                                disabled={isLoading}
                                style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                            >
                                <Ionicons name="close" size={16} color="white" />
                            </Pressable>
                        </View>
                    </View>
                ))}
                {images.length < 5 && (
                    <Pressable
                        className={`${images.length === 0 ? 'w-full p-1' : 'w-1/2 p-1'}`}
                        onPress={pickImage}
                        disabled={isLoading}
                        style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                    >
                        <View className="bg-gray-100 rounded-xl items-center justify-center h-40">
                            <Ionicons name="add" size={24} color="#9ca3af" />
                            <Text className="text-lg text-gray-600">이미지 추가</Text>
                        </View>
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const TagsSection = ({ control, setValue, getValues, isLoading, trigger }) => {
    const [selectedTags, setSelectedTags] = useState(getValues('tags') || []);

    const tagTranslations = {
        young: '어려요',
        elderly: '노령',
        timid: '겁이 많아요',
        dont_catch: '잡으려고 하지 마세요',
        friendly: '사람을 잘 따라요',
        accessories: '액세서리 착용',
    };

    const tagOptions = Object.keys(tagTranslations);

    useEffect(() => {
        setValue('tags', selectedTags);
        trigger('tags');
    }, [selectedTags, setValue, trigger]);

    const toggleTag = (tagName) => {
        if (isLoading) return;
        setSelectedTags((prev) =>
            prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
        );
        trigger('tags');
    };

    return (
        <View className="flex-1">
            <Text className="text-2xl font-semibold">태그를 선택할수있어요</Text>
            <Text className="mt-3 mb-8 text-gray-600">
                잃어버린 반려동물에 특징을 선택해서 찾을 확률을 높여주세요.
            </Text>
            <ScrollView contentContainerStyle={{ paddingBottom: 150, paddingTop: 8 }}>
                <View className="flex-row flex-wrap gap-2">
                    {tagOptions.map((tagName) => (
                        <Pressable
                            key={tagName}
                            className={[
                                'mb-2 px-5 py-2 rounded-3xl border',
                                selectedTags.includes(tagName)
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'bg-white border-neutral-200',
                            ].join(' ')}
                            onPress={() => toggleTag(tagName)}
                            disabled={isLoading}
                            style={({ pressed }) => ({
                                opacity: pressed && !isLoading ? 0.8 : 1,
                            })}
                        >
                            <Text
                                className={[
                                    'text-base font-semibold',
                                    selectedTags.includes(tagName) ? 'text-white' : 'text-neutral-800',
                                ].join(' ')}
                            >
                                {tagTranslations[tagName]}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
const SubmitButton = ({ disabled, onPress, isLoading }) => (
    <Pressable
        className={`py-4 rounded-xl flex-1 ${disabled || isLoading ? 'bg-gray-300' : 'bg-orange-500'}`}
        disabled={disabled || isLoading}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed && !(disabled || isLoading) ? 0.7 : 1 })}
    >
        <Text className="text-white font-semibold text-center">
            {isLoading ? '업로드 중...' : '등록'}
        </Text>
    </Pressable>
);

export default function RescuesCreateScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const methods = useForm({
        defaultValues: {
            category: '',
            bounty: 0,
            title: '',
            details: '',
            images: [],
            location: null,
            tags: [],
        },
        mode: 'onChange',
    });
    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger, reset } = methods;

    const steps = [
        { name: 'category', label: '카테고리' },
        { name: 'bounty', label: '현상금 설정' },
        { name: 'images', label: '이미지 업로드' },
        { name: 'title', label: '제목' },
        { name: 'details', label: '상세 정보' },
        { name: 'tags', label: '태그 선택' },
        { name: 'location', label: '목격 장소' },
    ];

    useEffect(() => {
        reset({
            category: '',
            bounty: 0,
            title: '',
            details: '',
            images: [],
            location: null,
            tags: [],
        });
        setCurrentStep(0);
    }, [reset]);

    const isLastStep = () => currentStep === steps.length - 1;

    const isNextDisabled = () => {
        const currentStepName = steps[currentStep]?.name;
        if (currentStepName === 'category') {
            return !getValues('category');
        }
        if (currentStepName === 'title') {
            return !getValues('title');
        }
        if (currentStepName === 'location') {
            return !getValues('location') || !getValues('location').latitude || !getValues('location').address;
        }
        if (currentStepName === 'images') {
            return !getValues('images') || getValues('images').length === 0;
        }
        return false;
    };

    const handleNext = async () => {
        const currentStepName = steps[currentStep]?.name;
        let isValid = true;

        if (currentStepName === 'category') {
            isValid = await trigger('category');
        } else if (currentStepName === 'bounty') {
            isValid = await trigger('bounty');
        } else if (currentStepName === 'title') {
            isValid = await trigger('title');
        } else if (currentStepName === 'location') {
            isValid = await trigger('location');
        } else if (currentStepName === 'images') {
            isValid = await trigger('images');
        } else if (currentStepName === 'tags') {
            isValid = await trigger('tags');
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        const startTime = Date.now();
        try {
            if (!user) {
                throw new Error('로그인이 필요합니다.');
            }

            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData.user) {
                throw new Error(`인증 실패: ${authError?.message || '사용자 정보 없음'}`);
            }
            const authUid = authData.user.id;
            if (user.id !== authUid) {
                throw new Error('사용자 ID 불일치');
            }

            const rescuePayload = {
                user_id: user.id,
                title: data.title,
                description: data.details || null,
                animal_type: data.category,
                latitude: data.location?.latitude || 0,
                longitude: data.location?.longitude || 0,
                address: data.location?.address || '',
                bounty: data.bounty || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            const { data: rescueData, error: rescueError } = await supabase
                .from('rescues')
                .insert(rescuePayload)
                .select()
                .single();
            if (rescueError) {
                console.error(`Rescue insert error: ${JSON.stringify(rescueError)}`);
                throw new Error(`구조 제보 생성 실패: ${rescueError.message}`);
            }
            console.log(`Rescue inserted: ${rescueData.id}`);

            const batchSize = 3;
            const imageUrls = [];
            for (let i = 0; i < data.images.length; i += batchSize) {
                const batchStartTime = Date.now();
                const batch = data.images.slice(i, i + batchSize);
                const batchPromises = batch.map(async (uri, index) => {
                    const globalIndex = i + index;
                    console.log(`Processing image ${globalIndex}: ${uri}`);

                    const manipResult = await ImageManipulator.manipulateAsync(
                        uri,
                        [{ resize: { width: 800 } }],
                        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
                    );
                    console.log(`Compressed image: ${manipResult.uri}, size: ${manipResult.width}x${manipResult.height}`);

                    const response = await fetch(manipResult.uri);
                    const arrayBuffer = await response.arrayBuffer();
                    if (arrayBuffer.byteLength === 0) {
                        throw new Error(`이미지 데이터가 비어 있습니다: ${uri}`);
                    }

                    const contentType = 'image/jpeg';
                    const fileName = `rescue_${user.id}_${Date.now()}_${globalIndex}.jpg`;
                    console.log(`Uploading ${fileName}`);

                    Toast.show({
                        type: 'info',
                        text1: `이미지 업로드 중 (${globalIndex + 1}/${data.images.length})`,
                        text2: `파일: ${fileName}`,
                        position: 'top',
                        visibilityTime: 1500,
                    });

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('rescues')
                        .upload(fileName, arrayBuffer, { contentType });
                    if (uploadError) {
                        console.error(`Upload error for ${fileName}: ${JSON.stringify(uploadError)}`);
                        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
                    }
                    console.log(`Upload success: ${fileName}`);

                    const { data: urlData } = supabase.storage
                        .from('rescues')
                        .getPublicUrl(fileName);
                    if (!urlData.publicUrl) {
                        throw new Error(`이미지 URL 생성 실패: ${fileName}`);
                    }
                    console.log(`Public URL: ${urlData.publicUrl}`);
                    return urlData.publicUrl;
                });

                const batchUrls = await Promise.all(batchPromises);
                imageUrls.push(...batchUrls);
                console.log(`Batch ${i / batchSize} completed in ${Date.now() - batchStartTime}ms`);
            }

            if (imageUrls.length > 0) {
                const imageInserts = imageUrls.map((url) => ({
                    rescue_id: rescueData.id,
                    url,
                    created_at: new Date().toISOString(),
                }));
                const { error: imageError } = await supabase
                    .from('rescues_images')
                    .insert(imageInserts);
                if (imageError) {
                    console.error(`Images insert error: ${JSON.stringify(imageError)}`);
                    throw new Error(`이미지 레코드 삽입 실패: ${imageError.message}`);
                }
                console.log(`Inserted ${imageInserts.length} images to rescues_images`);
            }

            if (data.tags.length > 0 && rescueData.id) {
                const tagInserts = await Promise.all(data.tags.map(async (tag_name) => {
                    const { data: tagData, error: tagError } = await supabase
                        .from('rescue_tags')
                        .select('id')
                        .eq('tag_name', tag_name)
                        .single();
                    if (tagError || !tagData) {
                        return null;
                    }
                    return {
                        rescue_id: rescueData.id,
                        rescue_tag_id: tagData.id,
                        created_at: new Date().toISOString(),
                    };
                }));
                const validTagInserts = tagInserts.filter((item) => item !== null);
                if (validTagInserts.length > 0) {
                    const { error: tagError } = await supabase
                        .from('rescue_tag_assignments')
                        .insert(validTagInserts);
                    if (tagError) {
                        console.error(`Tag assignment error: ${JSON.stringify(tagError)}`);
                        throw new Error(`태그 매핑 실패: ${tagError.message}`);
                    }
                    console.log(`Inserted ${validTagInserts.length} tags to rescue_tag_assignments`);
                }
            }

            reset({
                category: '',
                bounty: 0,
                title: '',
                details: '',
                images: [],
                location: null,
                tags: [],
            });
            setCurrentStep(0);

            Toast.show({
                type: 'success',
                text1: '성공적으로 구조 제보가 등록되었습니다',
                text2: `꼭 찾기를 같이 기도드리겠습니다 🙏`,
                position: 'top',
                visibilityTime: 5000,
            });
            router.replace('/rescues');
        } catch (error) {
            console.error('Error in onSubmit:', error);
            Toast.show({
                type: 'error',
                text1: '구조 제보 등록 실패',
                text2: (error as Error).message,
                position: 'top',
                visibilityTime: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderProgressBar = () => {
        const progress = ((currentStep + 1) / steps.length) * 100;
        return (
            <View className="w-full h-2 bg-gray-200 rounded-full mt-4 mb-6">
                <View className="h-2 bg-orange-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
        );
    };

    const renderStep = () => {
        const step = steps[currentStep];
        if (!step) return null;
        switch (step.name) {
            case 'images':
                return <ImageUploadSection control={control} setValue={setValue} getValues={getValues} isLoading={isLoading} trigger={trigger} />;
            case 'tags':
                return <TagsSection control={control} setValue={setValue} getValues={getValues} isLoading={isLoading} trigger={trigger} />;
            default:
                return (
                    <View className="mb-4 flex-1">
                        <FormSection
                            activeField={step.name}
                            control={control}
                            errors={errors}
                            trigger={trigger}
                            isLoading={isLoading}
                        />
                    </View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" pointerEvents={isLoading ? 'none' : 'auto'}>
            <Modal
                visible={isLoading}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
            >
                <View className="flex-1 bg-black/70 justify-center items-center">
                    <View className="bg-white p-6 rounded-xl">
                        <ActivityIndicator size="large" color="#f97316" />
                        <Text className="mt-4 text-lg font-semibold text-gray-800">업로드 중...</Text>
                    </View>
                </View>
            </Modal>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-white"
            >
                <View className="flex-1 px-6">
                    <View className="flex-row justify-end mt-4">
                        <Pressable
                            onPress={() => router.back()}
                            disabled={isLoading}
                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                        >
                            <Ionicons name="close" size={24} color="#51555c" />
                        </Pressable>
                    </View>
                    {renderProgressBar()}
                    <Text className="text-xl font-bold mb-4 text-gray-400">
                        <Text className="text-gray-800">{currentStep + 1}</Text>
                        {` / ${steps.length}`}
                    </Text>
                    <FormProvider {...methods}>
                        {renderStep()}
                    </FormProvider>
                </View>
                <View className="px-6 pb-8 bg-white">
                    <View className="flex-row">
                        {currentStep > 0 && (
                            <Pressable
                                className={`bg-gray-100 py-4 rounded-xl flex-[2] mr-2 ${isLoading ? 'opacity-50' : ''}`}
                                onPress={handlePrevious}
                                disabled={isLoading}
                                style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                            >
                                <Text className="text-black font-semibold text-center">이전</Text>
                            </Pressable>
                        )}
                        {isLastStep() ? (
                            <SubmitButton
                                disabled={isNextDisabled()}
                                onPress={handleSubmit(onSubmit)}
                                isLoading={isLoading}
                            />
                        ) : (
                            <Pressable
                                className={`py-4 rounded-xl ${isNextDisabled() || isLoading ? 'bg-gray-300' : 'bg-orange-500'} ${currentStep === 0 ? 'flex-1' : 'flex-[8]'}`}
                                onPress={handleNext}
                                disabled={isNextDisabled() || isLoading}
                                style={({ pressed }) => ({ opacity: pressed && !(isNextDisabled() || isLoading) ? 0.7 : 1 })}
                            >
                                <Text className="text-white  font-semibold text-center">다음</Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    pinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderContainer: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        position: 'relative',
    },
    centerMark: {
        position: 'absolute',
        backgroundColor: '#f97316',
        width: 5,
        height: 60,
        top: 10,
        left: '49%',
        zIndex: 10,
        borderRadius: 2,
    },
    scrollView: { flexGrow: 0 },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: '50%',
    },
    dashWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    dash: {
        width: DASH_WIDTH,
        backgroundColor: '#fdba74',
        marginHorizontal: DASH_GAP / 2,
        borderRadius: 3,
    },
    markContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    mark: {
        alignItems: 'center',
        height: 20,
        justifyContent: 'center',
    },
    markText: {
        fontSize: 12,
        color: '#666',
    },
});