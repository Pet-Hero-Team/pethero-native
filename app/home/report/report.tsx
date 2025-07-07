import { PET_OPTIONS } from '@/constants/pet';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const UNIT_OPTIONS = [
    { label: '그램 (g)', value: 'g' },
    { label: '킬로그램 (kg)', value: 'kg' },
    { label: '밀리리터 (ml)', value: 'ml' },
    { label: '매(장)', value: 'per' },
    { label: '기타', value: 'miscellaneous' },
];

const FormSection = ({ activeField, reportType, control, setValue, getValues, errors, trigger }) => {
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
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('위치 권한이 거부되었습니다.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
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
            return;
        }

        const fetchAddress = debounce(async () => {
            try {
                const result = await Location.reverseGeocodeAsync({
                    latitude: centerCoordinate.latitude,
                    longitude: centerCoordinate.longitude,
                });
                if (result.length > 0) {
                    const address = result[0];
                    const formattedAddress = [
                        address.city,
                        address.street,
                        address.name,
                    ].filter(Boolean).join(', ');
                    setCenterAddress(formattedAddress || '주소를 찾을 수 없습니다.');
                    setAddressCache((prev) => ({ ...prev, [cacheKey]: formattedAddress || '주소를 찾을 수 없습니다.' }));
                } else {
                    setCenterAddress('주소를 찾을 수 없습니다.');
                    setAddressCache((prev) => ({ ...prev, [cacheKey]: '주소를 찾을 수 없습니다.' }));
                }
            } catch (error) {
                console.log('주소 변환 오류:', error);
                setCenterAddress(`위도: ${centerCoordinate.latitude.toFixed(6)}, 경도: ${centerCoordinate.longitude.toFixed(6)}`);
                setAddressCache((prev) => ({ ...prev, [cacheKey]: `위도: ${centerCoordinate.latitude.toFixed(6)}, 경도: ${centerCoordinate.longitude.toFixed(6)}` }));
            }
        }, 500);

        fetchAddress();
        return () => fetchAddress.cancel();
    }, [centerCoordinate, addressCache]);

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
        setValue('location', {
            latitude: region.latitude,
            longitude: region.longitude,
            address: centerAddress,
        });
    };

    const handleCategorySelect = (value) => {
        console.log('카테고리 선택:', value);
        setValue('category', value, { shouldValidate: true });
        trigger('category');
    };

    return (
        <View className="flex-1">
            {(!activeField || activeField === 'category') && (
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    <Text className="text-2xl mb-8 font-semibold">목격한 유기동물의 타입을 선택해주세요</Text>
                    {PET_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`mb-4 px-5 py-6 rounded-3xl ${getValues('category') === option.value ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} border`}
                            onPress={() => handleCategorySelect(option.value)}
                        >
                            <Text className="text-lg font-semibold">{option.label}</Text>
                        </TouchableOpacity>
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
                            rules={{ required: '제목을 입력해주세요.', maxLength: 30 }}
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
                        {reportType === 'sighting'
                            ? '목격담을 알려주세요'
                            : '보호중인 동물의 상태를 말해주세요'
                        }
                    </Text>
                    <Text className="mt-3 mb-8 text-gray-600">
                        {reportType === 'sighting'
                            ? '마지막 목격 장소, 시간, 동물의 특징 등을 적어주세요.'
                            : '과일 가게에 맡겼어요 /  제가 보호하고 있습니다 등등'
                        }
                    </Text>
                    <View className="flex-1 mb-4">
                        <Controller
                            control={control}
                            name="details"
                            defaultValue=""
                            rules={{ maxLength: 500 }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    onFocus={() => setIsDetailsFocused(true)}
                                    onBlur={() => setIsDetailsFocused(false)}
                                    placeholder="상세 정보를 입력하세요"
                                    placeholderTextColor="#9ca3af"
                                    multiline
                                    numberOfLines={10}
                                    className={`flex-1 bg-white p-4 text-xl border rounded-xl ${isDetailsFocused ? 'border-gray-400' : 'border-gray-200'}`}
                                    style={{ textAlignVertical: 'top' }}
                                    maxLength={500}
                                />
                            )}
                        />
                        <View className="flex-row items-center mt-2 justify-end">
                            <Text className="text-right text-sm text-gray-500">{getValues('details').length}/500</Text>
                        </View>
                    </View>
                </View>
            )}
            {(!activeField || activeField === 'location') && reportType === 'sighting' && (
                <View className="flex-1">
                    <Text className="text-2xl font-semibold">마지막 목격 장소를 지정해주세요</Text>
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg text-gray-600 flex-1 mr-2" numberOfLines={2}>
                            {centerAddress}
                        </Text>
                        <TouchableOpacity
                            className="bg-orange-500 p-2 rounded-xl"
                            onPress={moveToUserLocation}
                        >
                            <Ionicons name="location-outline" size={24} color="white" />
                        </TouchableOpacity>
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
                        />
                        <View style={styles.pinContainer}>
                            <Ionicons name="location-sharp" size={40} color="#ff0000" />
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const ImageUploadSection = ({ control, setValue, getValues }) => {
    const [images, setImages] = useState(getValues('images') || []);

    useEffect(() => {
        setValue('images', images);
    }, [images, setValue]);

    useEffect(() => {
        setImages(getValues('images') || []);
    }, []);

    const pickImage = async () => {
        console.log('pickImage 함수 호출됨');
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('갤러리 권한 상태:', status);
            if (status !== 'granted') {
                alert('갤러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                allowsMultipleSelection: true,
                quality: 1,
            });
            console.log('ImagePicker 결과:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImages = result.assets.map((asset) => asset.uri);
                console.log('선택된 이미지 URI:', newImages);
                const updatedImages = [...images, ...newImages].slice(0, 5);
                if (newImages.length + images.length > 5) {
                    alert('최대 5장까지 업로드할 수 있습니다.');
                }
                setImages(updatedImages);
            } else {
                console.log('이미지 선택 취소됨 또는 결과 없음');
            }
        } catch (error) {
            console.error('이미지 선택 오류:', error);
            alert('이미지 선택 중 오류가 발생했습니다.');
        }
    };

    const removeImage = (uri) => {
        console.log('removeImage 호출됨, 삭제 대상 URI:', uri);
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
                            <TouchableOpacity
                                className="absolute top-2 right-2 bg-neutral-800 rounded-full p-1"
                                onPress={() => removeImage(uri)}
                            >
                                <Ionicons name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {images.length < 5 && (
                    <TouchableOpacity
                        className={`${images.length === 0 ? 'w-full p-1' : 'w-1/2 p-1'}`}
                        onPress={() => {
                            console.log('TouchableOpacity 클릭됨');
                            pickImage();
                        }}
                    >
                        <View className="bg-gray-100 rounded-xl items-center justify-center h-40">
                            <Ionicons name="add" size={24} color="#9ca3af" />
                            <Text className="text-lg text-gray-600">이미지 추가</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const SubmitButton = ({ disabled, onPress }) => (
    <TouchableOpacity
        className={`py-4 rounded-xl flex-1 ${disabled ? 'bg-gray-300' : 'bg-orange-500'}`}
        disabled={disabled}
        onPress={onPress}
    >
        <Text className="text-white font-semibold text-center">등록</Text>
    </TouchableOpacity>
);

export default function ReportsScreen() {
    const [currentStep, setCurrentStep] = useState(0);
    const [reportType, setReportType] = useState('sighting');
    const unitValue = 'g';
    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger } = useForm({
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
        ...(reportType === 'sighting' ? [{ name: 'location', label: '목격 장소' }] : []),
    ];

    const filteredSteps = unitValue === 'miscellaneous' ? steps.filter((step) => step.name !== 'quantity') : steps;

    const onSubmit = (data) => {
        console.log('제출된 데이터:', {
            ...data,
            reportType,
        });
    };

    const isNextDisabled = () => {
        const currentStepName = filteredSteps[currentStep]?.name;
        console.log('isNextDisabled:', {
            step: currentStepName,
            category: getValues('category'),
            title: getValues('title'),
            errors,
        });
        if (currentStepName === 'category') {
            return !getValues('category');
        }
        if (currentStepName === 'title') {
            return !getValues('title');
        }
        return false;
    };

    const handleNext = async () => {
        const currentStepName = filteredSteps[currentStep]?.name;
        let isValid = true;

        if (currentStepName === 'category') {
            isValid = await trigger('category');
        } else if (currentStepName === 'title') {
            isValid = await trigger('title');
        }

        console.log('handleNext:', {
            step: currentStepName,
            isValid,
            category: getValues('category'),
            title: getValues('title'),
            errors,
        });

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, filteredSteps.length - 1));
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const renderProgressBar = () => {
        const progress = ((currentStep + 1) / filteredSteps.length) * 100;
        return (
            <View className="w-full h-2 bg-gray-200 rounded-full mt-4 mb-6">
                <View className="h-2 bg-orange-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
        );
    };

    const renderStep = () => {
        const step = filteredSteps[currentStep];
        if (!step) return null;
        if (step.hidden) {
            handleNext();
            return null;
        }
        switch (step.name) {
            case 'images':
                return <ImageUploadSection control={control} setValue={setValue} getValues={getValues} />;
            default:
                return (
                    <View className="mb-4 flex-1">
                        {step.name === 'details' && (
                            <View className="flex-row mb-6">
                                <TouchableOpacity
                                    onPress={() => setReportType('sighting')}
                                    className={`flex-1 p-4 rounded-l-xl ${reportType === 'sighting' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <Text className={`text-center font-semibold ${reportType === 'sighting' ? 'text-white' : 'text-gray-600'}`}>목격</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setReportType('protection')}
                                    className={`flex-1 p-4 rounded-r-xl ${reportType === 'protection' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    <Text className={`text-center font-semibold ${reportType === 'protection' ? 'text-white' : 'text-gray-600'}`}>보호</Text>
                                </TouchableOpacity>
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
                        />
                    </View>
                );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 bg-white"
            >
                <View className="flex-1 px-6">
                    <View className="flex-row justify-end mt-4">
                        <TouchableOpacity onPress={() => { router.back() }}>
                            <Ionicons name="close" size={24} color="#51555c" />
                        </TouchableOpacity>
                    </View>
                    {renderProgressBar()}
                    <Text className="text-xl font-bold mb-4 text-gray-400">
                        <Text className="text-gray-800">{currentStep + 1}</Text>
                        {` / ${filteredSteps.length}`}
                    </Text>
                    {renderStep()}
                </View>
                <View className="px-6 pb-8 bg-white">
                    <View className="flex-row">
                        {currentStep > 0 && (
                            <TouchableOpacity
                                className="bg-gray-100 py-4 rounded-xl flex-[2] mr-2"
                                onPress={handlePrevious}
                            >
                                <Text className="text-black font-semibold text-center">이전</Text>
                            </TouchableOpacity>
                        )}
                        {currentStep < filteredSteps.length - 1 ? (
                            <TouchableOpacity
                                className={`py-4 rounded-xl ${isNextDisabled() ? 'bg-gray-300' : 'bg-orange-500'} ${currentStep === 0 ? 'flex-1' : 'flex-[8]'}`}
                                onPress={handleNext}
                                disabled={isNextDisabled()}
                            >
                                <Text className="text-white font-semibold text-center">다음</Text>
                            </TouchableOpacity>
                        ) : (
                            <SubmitButton disabled={isNextDisabled()} onPress={handleSubmit(onSubmit)} />
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
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
    pagerView: {
        height: 64,
    },
});