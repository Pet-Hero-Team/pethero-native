// 파일명: EditReportScreen.tsx

import { PET_OPTIONS } from '@/constants/pet';
import { validationRules } from '@/constants/validationRules';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Toast from 'react-native-toast-message';

// FormSection 컴포넌트
const FormSection = ({ activeField, reportType, control, setValue, getValues, errors, trigger, isLoading, centerCoordinate, centerAddress, handleRegionChangeComplete, moveToUserLocation }) => {
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isDetailsFocused, setIsDetailsFocused] = useState(false);
    const mapRef = useRef(null);

    const handleCategorySelect = (value) => {
        setValue('category', value, { shouldValidate: true });
        trigger('category');
    };

    return (
        <View className="flex-1">
            {(!activeField || activeField === 'category') && (
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    <Text className="text-2xl  font-semibold mb-8">수정할 타입을 선택해주세요</Text>
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
            {(!activeField || activeField === 'title') && (
                <View>
                    <Text className="text-2xl font-semibold mt-4">수정된 제목을 적어주세요</Text>
                    <Text className="mt-3 mb-8 text-gray-600">간단하게 어디에서 어떤 동물을 목격했는지 적어주세요</Text>
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
                                    placeholder="예시) 골든리트리버를 대리고 있습니다."
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
                    <Text className="text-2xl font-semibold mt-4">
                        {reportType === 'sighted' ? '수정된 목격담을 알려주세요' : '수정된 동물의 상태를 말해주세요'}
                    </Text>
                    <Text className="mt-3 mb-8 text-gray-600">
                        {reportType === 'sighted'
                            ? '마지막 목격 장소, 시간, 동물의 특징 등을 적어주세요.'
                            : '과일 가게에 맡겼어요 /  제가 보호하고 있습니다 등등'}
                    </Text>
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
            {(!activeField || activeField === 'location') && reportType === 'sighted' && (
                <View className="flex-1">
                    <Text className="text-2xl font-semibold mt-4">수정할 목격 장소를 지정해주세요</Text>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg text-gray-600 flex-1 mr-2" numberOfLines={2}>
                            {centerAddress}
                        </Text>
                        <Pressable
                            className="bg-orange-500 p-2 rounded-xl"
                            onPress={() => moveToUserLocation(mapRef)}
                            disabled={isLoading}
                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                        >
                            <Ionicons name="location-outline" size={24} color="white" />
                        </Pressable>
                    </View>
                    <View className="flex-1 rounded-xl overflow-hidden">
                        {centerCoordinate && (
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
                        )}
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


export default function EditReportScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [reportType, setReportType] = useState('sighted');
    const [isLoading, setIsLoading] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [centerCoordinate, setCenterCoordinate] = useState(null);
    const [centerAddress, setCenterAddress] = useState('주소를 가져오는 중...');
    const [addressCache, setAddressCache] = useState({});
    const mapRef = useRef(null);

    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger, reset } = useForm({
        defaultValues: {
            category: '',
            title: '',
            details: '',
            images: [],
            location: null,
            originalCategory: '',
            originalTitle: '',
            originalDetails: '',
            originalAddress: '',
        },
        mode: 'onChange',
    });

    // 컴포넌트 마운트 시 초기 위치 권한 요청 및 위치 설정
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
        })();
    }, []);

    // 기존 데이터 불러오기
    useEffect(() => {
        const fetchReportData = async () => {
            if (!id) {
                Toast.show({ type: 'error', text1: '게시글 ID가 없습니다.' });
                router.back();
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    throw new Error(`게시글 조회 실패: ${error.message}`);
                }

                setReportData(data);
                setReportType(data.sighting_type || 'sighted');
                setCenterCoordinate({
                    latitude: data.latitude,
                    longitude: data.longitude,
                });

                reset({
                    category: data.animal_type || '',
                    title: data.title || '',
                    details: data.description || '',
                    location: {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        address: data.address,
                    },
                    images: [],
                    originalCategory: data.animal_type || '',
                    originalTitle: data.title || '',
                    originalDetails: data.description || '',
                    originalAddress: data.address || '',
                });

                setIsLoading(false);
                Toast.show({ type: 'info', text1: '기존 내역을 불러왔습니다.' });
            } catch (err) {
                console.error('Failed to fetch report data:', err);
                Toast.show({ type: 'error', text1: '게시글 정보를 불러오는 데 실패했습니다.' });
                setIsLoading(false);
                router.back();
            }
        };

        if (id) {
            fetchReportData();
        }
    }, [id, reset]);

    // 지도가 정지했을 때 주소 가져오는 디바운스 로직
    useEffect(() => {
        if (!centerCoordinate) return;

        const cacheKey = `${centerCoordinate.latitude.toFixed(6)},${centerCoordinate.longitude.toFixed(6)}`;
        if (addressCache[cacheKey]) {
            setCenterAddress(addressCache[cacheKey]);
            setValue('location', {
                latitude: centerCoordinate.latitude,
                longitude: centerCoordinate.longitude,
                address: addressCache[cacheKey],
            });
            trigger('location');
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
                setValue('location', {
                    latitude: centerCoordinate.latitude,
                    longitude: centerCoordinate.longitude,
                    address: formattedAddress,
                });
                trigger('location');
            } catch (error) {
                const fallbackAddress = `위도: ${centerCoordinate.latitude.toFixed(6)}, 경도: ${centerCoordinate.longitude.toFixed(6)}`;
                setCenterAddress(fallbackAddress);
                setAddressCache((prev) => ({ ...prev, [cacheKey]: fallbackAddress }));
                setValue('location', {
                    latitude: centerCoordinate.latitude,
                    longitude: centerCoordinate.longitude,
                    address: fallbackAddress,
                });
                trigger('location');
            }
        }, 500);

        fetchAddress();
        return () => fetchAddress.cancel();
    }, [centerCoordinate, addressCache, setValue, trigger]);

    const steps = [
        { name: 'category', label: '카테고리' },
        { name: 'title', label: '제목' },
        { name: 'details', label: '상세 정보' },
        ...(reportType === 'sighted' ? [{ name: 'location', label: '목격 장소' }] : []),
    ];

    const isLastStep = () => currentStep === steps.length - 1;

    const isNextDisabled = () => {
        const currentStepName = steps[currentStep]?.name;
        if (currentStepName === 'category') {
            return !getValues('category');
        }
        if (currentStepName === 'title') {
            return !getValues('title');
        }
        if (currentStepName === 'location' && reportType === 'sighted') {
            const location = getValues('location');
            return !location || !location.latitude || !location.address;
        }
        return false;
    };

    const handleNext = async () => {
        const currentStepName = steps[currentStep]?.name;
        let isValid = true;

        if (currentStepName === 'category') {
            isValid = await trigger('category');
        } else if (currentStepName === 'title') {
            isValid = await trigger('title');
        } else if (currentStepName === 'details') {
            isValid = await trigger('details');
        } else if (currentStepName === 'location' && reportType === 'sighted') {
            isValid = await trigger('location');
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const moveToUserLocation = (mapRef) => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            }, 1000);
            setCenterCoordinate(userLocation);
        }
    };

    const handleRegionChangeComplete = (region) => {
        setCenterCoordinate({
            latitude: region.latitude,
            longitude: region.longitude,
        });
    };

    const onUpdate = async (data) => {
        setIsLoading(true);
        try {
            if (!user || user.id !== reportData.user_id) {
                Toast.show({ type: 'error', text1: '권한이 없습니다.' });
                return;
            }

            const updatePayload = {
                title: data.title,
                description: data.details,
                animal_type: data.category,
                sighting_type: reportType,
                latitude: reportType === 'sighted' ? data.location?.latitude : null,
                longitude: reportType === 'sighted' ? data.location?.longitude : null,
                address: reportType === 'sighted' ? data.location?.address : '',
                updated_at: new Date().toISOString(),
            };

            const { error: updateError } = await supabase
                .from('reports')
                .update(updatePayload)
                .eq('id', id);

            if (updateError) {
                console.error(`Report update error: ${JSON.stringify(updateError)}`);
                throw new Error(`게시글 수정 실패: ${updateError.message}`);
            }

            Toast.show({
                type: 'success',
                text1: '게시글 수정 완료',
                position: 'top',
                visibilityTime: 3000,
            });
            router.replace(`/map/reports/${id}`);
        } catch (error) {
            console.error('Error in onUpdate:', error);
            Toast.show({
                type: 'error',
                text1: '게시글 수정 실패',
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
        return (
            <View className="mb-4 flex-1">
                {step.name === 'details' && (
                    <View className="flex-row mb-6">
                        <Pressable
                            onPress={() => {
                                setReportType('sighted');
                                setCurrentStep(2);
                            }}
                            className={`flex-1 p-4 rounded-l-xl ${reportType === 'sighted' ? 'bg-orange-500' : 'bg-gray-100'}`}
                            disabled={isLoading}
                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                        >
                            <Text className={`text-center font-semibold ${reportType === 'sighted' ? 'text-white' : 'text-gray-600'}`}>목격됨</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                setReportType('protected');
                                setCurrentStep(2);
                            }}
                            className={`flex-1 p-4 rounded-r-xl ${reportType === 'protected' ? 'bg-orange-500' : 'bg-gray-100'}`}
                            disabled={isLoading}
                            style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                        >
                            <Text className={`text-center font-semibold ${reportType === 'protected' ? 'text-white' : 'text-gray-600'}`}>보호 중</Text>
                        </Pressable>
                    </View>
                )}
                <FormSection
                    activeField={step.name}
                    reportType={reportType}
                    control={control}
                    setValue={setValue}
                    getValues={getValues}
                    errors={errors}
                    trigger={trigger}
                    isLoading={isLoading}
                    centerCoordinate={centerCoordinate}
                    centerAddress={centerAddress}
                    handleRegionChangeComplete={handleRegionChangeComplete}
                    moveToUserLocation={moveToUserLocation}
                />
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-4 text-lg font-semibold text-gray-800">게시글 정보를 불러오는 중...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" pointerEvents={isLoading ? 'none' : 'auto'}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-white"
            >
                <View className="flex-1 px-6">
                    <View className="flex-row items-center justify-end mt-4">
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
                        {` / ${steps.length}`} 수정 중..
                    </Text>
                    {renderStep()}
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
                            <Pressable
                                className={`py-4 rounded-xl flex-1 ${isNextDisabled() || isLoading ? 'bg-gray-300' : 'bg-orange-500'}`}
                                disabled={isNextDisabled() || isLoading}
                                onPress={handleSubmit(onUpdate)}
                                style={({ pressed }) => ({ opacity: pressed && !(isNextDisabled() || isLoading) ? 0.7 : 1 })}
                            >
                                <Text className="text-white font-semibold text-center">
                                    {isLoading ? '수정 중...' : '수정 완료'}
                                </Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                className={`py-4 rounded-xl ${isNextDisabled() || isLoading ? 'bg-gray-300' : 'bg-orange-500'} ${currentStep === 0 ? 'flex-1' : 'flex-[8]'}`}
                                onPress={handleNext}
                                disabled={isNextDisabled() || isLoading}
                                style={({ pressed }) => ({ opacity: pressed && !(isNextDisabled() || isLoading) ? 0.7 : 1 })}
                            >
                                <Text className="text-white font-semibold text-center">다음</Text>
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
});