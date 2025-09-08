import { PET_OPTIONS } from '@/constants/pet';
import { validationRules } from '@/constants/validationRules';
import { supabase } from '@/supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PLACEHOLDER_COUNT = Math.floor(VISIBLE_ITEMS / 2);

function getDaysInMonth(year, monthIdx) {
    return new Date(year, monthIdx + 1, 0).getDate();
}

// ----------------- STEP 컴포넌트들 -----------------

function UsernameStep({ control, getValues, errors, trigger }) {
    const [isUsernameFocused, setIsUsernameFocused] = useState(false);
    return (
        <View>
            <Text className="text-2xl font-semibold">닉네임을 정해주세요</Text>
            <Text className="mt-3 mb-8 text-gray-600">* 한글, 영문, 숫자, 밑줄(_)만 사용, 3~30자</Text>
            <View className="mb-4">
                <Controller
                    control={control}
                    name="username"
                    defaultValue=""
                    rules={validationRules.username}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            value={value}
                            onChangeText={(text) => {
                                onChange(text);
                                trigger('username');
                            }}
                            onFocus={() => setIsUsernameFocused(true)}
                            onBlur={() => setIsUsernameFocused(false)}
                            placeholder="예시) 뽀삐주인"
                            placeholderTextColor="#9ca3af"
                            className={`bg-white pb-5 text-xl border-b ${isUsernameFocused ? 'border-gray-400' : 'border-gray-200'}`}
                            maxLength={30}
                        />
                    )}
                />
                <View className="flex-row items-center mt-2 justify-end">
                    <Text className="text-right text-sm text-gray-500">{getValues('username')?.length || 0}/30</Text>
                </View>
                {errors.username && (
                    <Text className="text-red-500 mt-2">{errors.username.message}</Text>
                )}
            </View>
        </View>
    );
}

function PetNameStep({ control, getValues, errors, trigger }) {
    const [isPetNameFocused, setIsPetNameFocused] = useState(false);
    return (
        <View>
            <Text className="text-2xl font-semibold">반려동물 이름을 정해주세요</Text>
            <Text className="mt-3 mb-8 text-gray-600">* 한글, 영문, 숫자, 밑줄(_)만 사용, 1~30자</Text>
            <View className="mb-4">
                <Controller
                    control={control}
                    name="petName"
                    defaultValue=""
                    rules={validationRules.petName}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            value={value}
                            onChangeText={(text) => {
                                onChange(text);
                                trigger('petName');
                            }}
                            onFocus={() => setIsPetNameFocused(true)}
                            onBlur={() => setIsPetNameFocused(false)}
                            placeholder="예시) 뽀삐"
                            placeholderTextColor="#9ca3af"
                            className={`bg-white pb-5 text-xl border-b ${isPetNameFocused ? 'border-gray-400' : 'border-gray-200'}`}
                            maxLength={30}
                        />
                    )}
                />
                <View className="flex-row items-center mt-2 justify-end">
                    <Text className="text-right text-sm text-gray-500">{getValues('petName')?.length || 0}/30</Text>
                </View>
                {errors.petName && (
                    <Text className="text-red-500 mt-2">{errors.petName.message}</Text>
                )}
            </View>
        </View>
    );
}

function ImageUploadStep({ control, setValue, getValues }) {
    const [image, setImage] = useState(getValues('image') || null);

    useEffect(() => {
        setValue('image', image);
    }, [image, setValue]);

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
        }
    };

    const removeImage = () => setImage(null);

    return (
        <View>
            <Text className="text-2xl font-semibold">프로필 사진 업로드</Text>
            <Text className="mt-3 mb-8 text-gray-600">프로필 사진을 업로드해주세요.</Text>
            <View className="flex-row flex-wrap">
                {image ? (
                    <View className="w-full p-1">
                        <View className="relative">
                            <Image source={{ uri: image }} className="w-full h-96 rounded-xl" resizeMode="cover" />
                            <TouchableOpacity className="absolute top-2 right-2 bg-neutral-800 rounded-full p-1" onPress={removeImage}>
                                <Ionicons name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity className="w-full p-1" onPress={pickImage}>
                        <View className="bg-gray-100 rounded-xl items-center justify-center h-96">
                            <Ionicons name="add" size={24} color="#9ca3af" />
                            <Text className="text-lg text-gray-600">사진 추가</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

function ReportTypeStep({ reportType, setReportType }) {
    return (
        <View className="flex-1">
            <Text className="text-2xl font-semibold">애완동물이 있으신가요?</Text>
            <Text className="mt-3 mb-8 text-gray-600">반려동물 유무에 따라 맞춤형 정보를 제공해드려요.</Text>
            <View className="flex-row mb-6">
                <TouchableOpacity onPress={() => setReportType('sighting')} className={`flex-1 p-4 rounded-l-xl ${reportType === 'sighting' ? 'bg-orange-500' : 'bg-gray-100'}`}>
                    <Text className={`text-center font-semibold ${reportType === 'sighting' ? 'text-white' : 'text-gray-600'}`}>네, 있어요!</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setReportType('protection')} className={`flex-1 p-4 rounded-r-xl ${reportType === 'protection' ? 'bg-orange-500' : 'bg-gray-100'}`}>
                    <Text className={`text-center font-semibold ${reportType === 'protection' ? 'text-white' : 'text-gray-600'}`}>아니요, 없어요</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function CategoryStep({ control, setValue, getValues, errors, trigger }) {
    const handleCategorySelect = (value) => {
        setValue('category', value, { shouldValidate: true });
        trigger('category');
    };

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
            <Text className="text-2xl mb-8 font-semibold">어떤 종류의 반려동물인가요?</Text>
            {PET_OPTIONS.map((option) => (
                <TouchableOpacity key={option.value} className={`mb-4 px-5 py-6 rounded-3xl ${getValues('category') === option.value ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} border`} onPress={() => handleCategorySelect(option.value)}>
                    <Text className="text-lg font-semibold">{option.label}</Text>
                </TouchableOpacity>
            ))}
            {errors.category && <Text className="text-red-500 mt-2">{errors.category.message}</Text>}
        </ScrollView>
    );
}

function BreedStep({ control, setValue, getValues, errors, trigger, animalType }) {
    const [breeds, setBreeds] = useState<{ id: string; breed_name: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreeds = async () => {
            if (!animalType) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('animal_breeds')
                .select('id, breed_name')
                .eq('animal_type', animalType);

            if (error) {
                Toast.show({ type: 'error', text1: '품종 목록을 불러오는데 실패했습니다.' });
            } else {
                const mixLabel = animalType === 'dog' ? '믹스견' : '믹스묘';
                setBreeds([{ id: 'mixed', breed_name: mixLabel }, ...data]);
            }
            setLoading(false);
        };
        fetchBreeds();
    }, [animalType]);

    const handleBreedSelect = (breedId: string) => {
        setValue('breed_id', breedId, { shouldValidate: true });
        trigger('breed_id');
    };

    if (loading) return <ActivityIndicator className="mt-10" />;

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
            <Text className="text-2xl mb-8 font-semibold">어떤 품종인가요?</Text>
            {breeds.map((breed) => (
                <TouchableOpacity
                    key={breed.id}
                    className={`mb-4 px-5 py-6 rounded-3xl ${getValues('breed_id') === breed.id ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} border`}
                    onPress={() => handleBreedSelect(breed.id)}
                >
                    <Text className="text-lg font-semibold">{breed.breed_name}</Text>
                </TouchableOpacity>
            ))}
            {errors.breed_id && <Text className="text-red-500 mt-2">{errors.breed_id.message}</Text>}
        </ScrollView>
    );
}

function BirthdayStep({ selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, selectedDay, setSelectedDay, years, months, days, yearRef, monthRef, dayRef, onUnknown, birthdayUnknown }) {
    return (
        <>
            <Text className="text-2xl font-bold text-neutral-900">반려동물 생일은 언제일까요?</Text>
            <Text className="mt-3 text-gray-600">기억이 나지 않거나 모른다면 하단에 작은 버튼을 눌러주세요</Text>
            <View className="flex-1 px-4 justify-center">
                {!birthdayUnknown ? (
                    <>
                        <View className="flex-row justify-center items-center mb-16">
                            <ScrollView style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} showsVerticalScrollIndicator={false} ref={yearRef}>
                                {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (<View key={`year-top-${idx}`} style={{ height: ITEM_HEIGHT }} />))}
                                {years.map((year) => (
                                    <TouchableOpacity key={year} onPress={() => { setSelectedYear(year); yearRef.current && yearRef.current.scrollTo({ y: years.indexOf(year) * ITEM_HEIGHT, animated: true }); }}>
                                        <Text style={{ height: ITEM_HEIGHT, fontSize: 24, color: selectedYear === year ? "#f97316" : "#bdbdbd", fontWeight: selectedYear === year ? "bold" : "normal", textAlign: "center", lineHeight: ITEM_HEIGHT, minWidth: 80 }}>
                                            {year}년
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (<View key={`year-bot-${idx}`} style={{ height: ITEM_HEIGHT }} />))}
                            </ScrollView>
                            <View style={{ width: 1, height: ITEM_HEIGHT * VISIBLE_ITEMS - 8, backgroundColor: "#e5e7eb", marginHorizontal: 8, alignSelf: "center", opacity: 0.7 }} />
                            <ScrollView style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} showsVerticalScrollIndicator={false} ref={monthRef}>
                                {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (<View key={`month-top-${idx}`} style={{ height: ITEM_HEIGHT }} />))}
                                {months.map((month, idx) => (
                                    <TouchableOpacity key={month} onPress={() => { setSelectedMonth(idx); monthRef.current && monthRef.current.scrollTo({ y: idx * ITEM_HEIGHT, animated: true }); }}>
                                        <Text style={{ height: ITEM_HEIGHT, fontSize: 24, color: selectedMonth === idx ? "#f97316" : "#bdbdbd", fontWeight: selectedMonth === idx ? "bold" : "normal", textAlign: "center", lineHeight: ITEM_HEIGHT, minWidth: 80 }}>
                                            {month}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (<View key={`month-bot-${idx}`} style={{ height: ITEM_HEIGHT }} />))}
                            </ScrollView>
                            <View style={{ width: 1, height: ITEM_HEIGHT * VISIBLE_ITEMS - 8, backgroundColor: "#e5e7eb", marginHorizontal: 8, alignSelf: "center", opacity: 0.7 }} />
                            <ScrollView style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }} showsVerticalScrollIndicator={false} ref={dayRef}>
                                {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (<View key={`day-top-${idx}`} style={{ height: ITEM_HEIGHT }} />))}
                                {days.map((day) => (
                                    <TouchableOpacity key={day} onPress={() => { setSelectedDay(day); dayRef.current && dayRef.current.scrollTo({ y: (day - 1) * ITEM_HEIGHT, animated: true }); }}>
                                        <Text style={{ height: ITEM_HEIGHT, fontSize: 24, color: selectedDay === day ? "#f97316" : "#bdbdbd", fontWeight: selectedDay === day ? "bold" : "normal", textAlign: "center", lineHeight: ITEM_HEIGHT, minWidth: 80 }}>
                                            {String(day).padStart(2, "0")}일
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {Array.from({ length: PLACEHOLDER_COUNT }).map((_, idx) => (<View key={`day-bot-${idx}`} style={{ height: ITEM_HEIGHT }} />))}
                            </ScrollView>
                        </View>
                        <TouchableOpacity onPress={onUnknown}><Text className="text-sm text-neutral-400 underline text-center mb-6">기억나지 않습니다</Text></TouchableOpacity>
                    </>
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 48 }}>
                        <Ionicons name="help-circle-outline" size={48} color="#bdbdbd" style={{ marginBottom: 12 }} />
                        <Text className="text-lg text-gray-500 mb-8 leading-8 text-center">기억이 나지않으신다면{"\n"}이대로 제출하셔도 좋습니다!</Text>
                        <TouchableOpacity onPress={onUnknown}><Text className="text-sm text-neutral-400 underline text-center mb-6">다시 입력하기</Text></TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );
}

const SubmitButton = ({ disabled, onPress }) => (
    <TouchableOpacity className={`py-4 rounded-xl flex-1 ${disabled ? 'bg-gray-300' : 'bg-orange-500'}`} disabled={disabled} onPress={onPress}>
        <Text className="text-white font-semibold text-center">제출</Text>
    </TouchableOpacity>
);

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error || !session || !session.user) {
                    setSession(null); setUser(null);
                    await SecureStore.deleteItemAsync('profileCompleted');
                    router.replace('/auth');
                    return;
                }
                setSession(session); setUser(session.user);
            } catch (error) {
                setSession(null); setUser(null);
                await SecureStore.deleteItemAsync('profileCompleted');
                router.replace('/auth');
            }
        };
        checkAuth();
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session || !session.user) {
                setSession(null); setUser(null);
                await SecureStore.deleteItemAsync('profileCompleted');
                router.replace('/auth');
            } else {
                setSession(session); setUser(session.user);
            }
        });
        return () => { authListener?.subscription.unsubscribe(); };
    }, []);
    return { user, session };
};

// ----------------- 메인 컴포넌트 -----------------

export default function AuthInfoScreen() {
    const { user, session } = useAuth();
    const today = new Date();
    const initialYear = today.getFullYear();
    const initialMonth = today.getMonth();
    const initialDay = today.getDate();

    const [currentStep, setCurrentStep] = useState(0);
    const [reportType, setReportType] = useState('sighting');
    const [birthdayUnknown, setBirthdayUnknown] = useState(false);
    const [selectedDay, setSelectedDay] = useState(initialDay);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [selectedYear, setSelectedYear] = useState(initialYear);

    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger } = useForm({
        defaultValues: {
            username: '',
            petName: '',
            image: null,
            category: '',
            breed_id: '',
            birthday: '',
        },
        mode: 'onChange',
    });

    const years = useMemo(() => Array.from({ length: initialYear - 1950 + 1 }, (_, i) => 1950 + i), [initialYear]);
    const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const days = useMemo(() => Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1), [selectedYear, selectedMonth]);

    useEffect(() => {
        const maxDay = getDaysInMonth(selectedYear, selectedMonth);
        if (selectedDay > maxDay) setSelectedDay(maxDay);
    }, [selectedYear, selectedMonth]);

    const yearRef = useRef(null);
    const monthRef = useRef(null);
    const dayRef = useRef(null);

    useEffect(() => {
        if (currentStep === steps.findIndex(step => step.name === 'birthday')) {
            setTimeout(() => {
                if (yearRef.current) yearRef.current.scrollTo({ y: years.indexOf(selectedYear) * ITEM_HEIGHT, animated: true });
                if (monthRef.current) monthRef.current.scrollTo({ y: selectedMonth * ITEM_HEIGHT, animated: true });
                if (dayRef.current) dayRef.current.scrollTo({ y: (selectedDay - 1) * ITEM_HEIGHT, animated: true });
            }, 10);
        }
    }, [currentStep, selectedYear, selectedMonth, selectedDay, days.length]);

    const steps = [
        { name: 'username', label: '닉네임' },
        { name: 'reportType', label: '애완동물 유무' },
        { name: 'petName', label: '반려동물 이름' },
        { name: 'image', label: '프로필 사진 업로드' },
        { name: 'category', label: '애완동물 종류' },
        { name: 'breed', label: '품종 선택' },
        { name: 'birthday', label: '생일' },
    ];

    const isLastStep = () => {
        if (reportType === 'protection') {
            return currentStep === steps.findIndex(step => step.name === 'image');
        }
        return currentStep === steps.length - 1;
    };

    const isNextDisabled = () => {
        const currentStepName = steps[currentStep]?.name;
        if (errors[currentStepName]) return true;

        switch (currentStepName) {
            case 'username': return !getValues('username');
            case 'petName': return reportType === 'sighting' && !getValues('petName');
            case 'category': return !getValues('category');
            case 'breed': return !getValues('breed_id');
            case 'birthday': return !birthdayUnknown && (!selectedYear || selectedMonth === null || !selectedDay);
            default: return false;
        }
    };

    const handleNext = async () => {
        const currentStepName = steps[currentStep]?.name;
        const isValid = await trigger(currentStepName);

        if (isValid) {
            if (currentStepName === 'reportType' && reportType === 'protection') {
                setCurrentStep(steps.findIndex(step => step.name === 'image'));
                return;
            }
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handlePrevious = () => {
        if (currentStep === steps.findIndex(step => step.name === 'image') && reportType === 'protection') {
            setCurrentStep(steps.findIndex(step => step.name === 'reportType'));
            return;
        }
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data) => {
        try {
            if (!session || !user) {
                Alert.alert('오류', '사용자 인증 정보가 없습니다. 다시 로그인해주세요.');
                await SecureStore.deleteItemAsync('profileCompleted');
                router.replace('/auth');
                return;
            }

            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                username: data.username,
                avatar_url: data.image,
                has_pet: reportType === 'sighting',
                user_role: 'user',
                updated_at: new Date().toISOString(),
            });

            if (profileError) throw new Error(`프로필 업데이트 실패: ${profileError.message}`);

            if (reportType === 'sighting') {
                let birthday = birthdayUnknown ? '모름' : `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

                const { error: petError } = await supabase.from('pets').insert({
                    user_id: user.id,
                    name: data.petName,
                    category: data.category,
                    breed_id: data.breed_id === 'mixed' ? null : data.breed_id,
                    birthday,
                });

                if (petError) throw new Error(`반려동물 등록 실패: ${petError.message}`);
            }

            await SecureStore.setItemAsync('profileCompleted', 'true');
            router.replace('/(tabs)/(home)');

        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('제출 실패', error.message || '프로필을 저장할 수 없습니다. 다시 시도해주세요.');
        }
    };

    const renderProgressBar = () => {
        const totalSteps = reportType === 'protection' ? 3 : steps.length;
        let currentProgressStep = currentStep;
        if (reportType === 'protection' && currentStep > 1) {
            currentProgressStep = 2;
        }
        const progress = ((currentProgressStep + 1) / totalSteps) * 100;
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
            case 'username': return <UsernameStep control={control} getValues={getValues} errors={errors} trigger={trigger} />;
            case 'reportType': return <ReportTypeStep reportType={reportType} setReportType={setReportType} />;
            case 'petName': return reportType === 'sighting' ? <PetNameStep control={control} getValues={getValues} errors={errors} trigger={trigger} /> : null;
            case 'image': return <ImageUploadStep control={control} setValue={setValue} getValues={getValues} />;
            case 'category': return <CategoryStep control={control} setValue={setValue} getValues={getValues} errors={errors} trigger={trigger} />;
            case 'breed': return <BreedStep control={control} setValue={setValue} getValues={getValues} errors={errors} trigger={trigger} animalType={getValues('category')} />;
            case 'birthday': return <BirthdayStep selectedYear={selectedYear} setSelectedYear={setSelectedYear} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedDay={selectedDay} setSelectedDay={setSelectedDay} years={years} months={months} days={days} yearRef={yearRef} monthRef={monthRef} dayRef={dayRef} birthdayUnknown={birthdayUnknown} onUnknown={() => setBirthdayUnknown(!birthdayUnknown)} />;
            default: return null;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
                <View className="flex-1 px-6">
                    {renderProgressBar()}
                    <Text className="text-xl font-bold mb-4 text-gray-400">
                        <Text className="text-gray-800">{currentStep + 1}</Text>
                        {` / ${reportType === 'protection' ? 3 : steps.length}`}
                    </Text>
                    {renderStep()}
                </View>
                <View className="px-6 pb-8 bg-white">
                    <View className="flex-row">
                        {currentStep > 0 && (
                            <TouchableOpacity className="bg-gray-100 py-4 rounded-xl flex-[2] mr-2" onPress={handlePrevious}>
                                <Text className="text-black font-semibold text-center">이전</Text>
                            </TouchableOpacity>
                        )}
                        {isLastStep() ? (
                            <SubmitButton disabled={isNextDisabled()} onPress={handleSubmit(onSubmit)} />
                        ) : (
                            <TouchableOpacity className={`py-4 rounded-xl ${isNextDisabled() ? 'bg-gray-300' : 'bg-orange-500'} ${currentStep === 0 ? 'flex-1' : 'flex-[8]'}`} onPress={handleNext} disabled={isNextDisabled()}>
                                <Text className="text-white font-semibold text-center">다음</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}