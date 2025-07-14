import { PET_OPTIONS } from '@/constants/pet';
import { validationRules } from '@/constants/validationRules';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router, useNavigation } from 'expo-router';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Toast from 'react-native-toast-message';

const FormSection = ({ activeField, reportType, control, setValue, getValues, errors, trigger, isLoading }) => {
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
        setValue('category', value, { shouldValidate: true });
        trigger('category');
    };

    return (
        <View className="flex-1">
            {(!activeField || activeField === 'category') && (
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    <Text className="text-2xl mb-8 font-semibold">목격한 유기동물의 타입을 선택해주세요</Text>
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
                    <Text className="text-2xl font-semibold">제목을 적어주세요</Text>
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
                    <Text className="text-2xl font-semibold">
                        {reportType === 'sighted' ? '목격담을 알려주세요' : '보호중인 동물의 상태를 말해주세요'}
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

const ImageUploadSection = ({ control, setValue, getValues, isLoading }) => {
    const [images, setImages] = useState(getValues('images') || []);

    useEffect(() => {
        setValue('images', images);
    }, [images, setValue]);

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
            <Text className="mt-3 mb-8 text-gray-600">동물의 사진을 업로드해주세요. (최대 5장)</Text>
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

export default function ReportsScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(0);
    const [reportType, setReportType] = useState('sighted');
    const [isLoading, setIsLoading] = useState(false);
    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger, reset } = useForm({
        defaultValues: {
            category: '',
            title: '',
            details: '',
            images: [],
            location: null,
        },
        mode: 'onChange',
    });

    const steps = [
        { name: 'category', label: '카테고리' },
        { name: 'images', label: '이미지 업로드' },
        { name: 'title', label: '제목' },
        { name: 'details', label: '상세 정보' },
        ...(reportType === 'sighted' ? [{ name: 'location', label: '목격 장소' }] : []),
    ];

    useEffect(() => {
        reset({
            category: '',
            title: '',
            details: '',
            images: [],
            location: null,
        });
        setCurrentStep(0);
        setReportType('sighted');
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
        if (currentStepName === 'location' && reportType === 'sighted') {
            return !getValues('location') || !getValues('location').latitude || !getValues('location').address;
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
            console.log(`User ID: ${user.id}, Auth UID: ${authUid}`);
            if (user.id !== authUid) {
                throw new Error('사용자 ID 불일치');
            }

            const reportPayload = {
                user_id: user.id,
                title: data.title,
                description: data.details || null,
                animal_type: data.category,
                sighting_type: reportType,
                latitude: reportType === 'sighted' ? data.location?.latitude : 0,
                longitude: reportType === 'sighted' ? data.location?.longitude : 0,
                address: reportType === 'sighted' ? data.location?.address : '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            const { data: reportData, error: reportError } = await supabase
                .from('reports')
                .insert(reportPayload)
                .select()
                .single();
            if (reportError) {
                console.error(`Report insert error: ${JSON.stringify(reportError)}`);
                throw new Error(`제보 생성 실패: ${reportError.message}`);
            }
            console.log(`Report inserted: ${reportData.id}`);

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
                    console.log(`ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);

                    if (arrayBuffer.byteLength === 0) {
                        throw new Error(`이미지 데이터가 비어 있습니다: ${uri}`);
                    }

                    const contentType = 'image/jpeg';
                    const fileName = `report_${user.id}_${Date.now()}_${globalIndex}.jpg`;
                    console.log(`Uploading ${fileName}`);

                    Toast.show({
                        type: 'info',
                        text1: `이미지 업로드 중 (${globalIndex + 1}/${data.images.length})`,
                        text2: `파일: ${fileName}`,
                        position: 'top',
                        visibilityTime: 1500,
                    });

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('reports')
                        .upload(fileName, arrayBuffer, { contentType });
                    if (uploadError) {
                        console.error(`Upload error for ${fileName}: ${JSON.stringify(uploadError)}`);
                        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
                    }
                    console.log(`Upload success: ${fileName}`);

                    const { data: urlData } = supabase.storage
                        .from('reports')
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
                    report_id: reportData.id,
                    url,
                    created_at: new Date().toISOString(),
                }));
                console.log(`Inserting images: ${JSON.stringify(imageInserts)}`);
                const { error: imageError } = await supabase
                    .from('reports_images')
                    .insert(imageInserts);
                if (imageError) {
                    console.error(`Images insert error: ${JSON.stringify(imageError)}`);
                    throw new Error(`이미지 레코드 삽입 실패: ${imageError.message}`);
                }
                console.log(`Inserted ${imageInserts.length} images to reports_images`);
            }

            reset({
                category: '',
                title: '',
                details: '',
                images: [],
                location: null,
            });
            setCurrentStep(0);
            setReportType('sighted');

            Toast.show({
                type: 'success',
                text1: '제보 등록 완료',
                text2: `업로드 완료 (${data.images.length}장, ${Date.now() - startTime}ms)`,
                position: 'top',
                visibilityTime: 3000,
            });
            router.replace('/(tabs)/(home)');
        } catch (error) {
            console.error('Error in onSubmit:', error);
            Toast.show({
                type: 'error',
                text1: '제보 등록 실패',
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
                return <ImageUploadSection control={control} setValue={setValue} getValues={getValues} isLoading={isLoading} />;
            default:
                return (
                    <View className="mb-4 flex-1">
                        {step.name === 'details' && (
                            <View className="flex-row mb-6">
                                <Pressable
                                    onPress={() => setReportType('sighted')}
                                    className={`flex-1 p-4 rounded-l-xl ${reportType === 'sighted' ? 'bg-orange-500' : 'bg-gray-100'}`}
                                    disabled={isLoading}
                                    style={({ pressed }) => ({ opacity: pressed && !isLoading ? 0.7 : 1 })}
                                >
                                    <Text className={`text-center font-semibold ${reportType === 'sighted' ? 'text-white' : 'text-gray-600'}`}>목격됨</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setReportType('protected')}
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