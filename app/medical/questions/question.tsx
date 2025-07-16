import { PET_OPTIONS } from '@/constants/pet';
import { supabase } from '@/supabase/supabase';
import { getTreatmentLabel } from '@/utils/formating';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TREATMENT_OPTIONS = [
    { label: '피부질환', value: 'skin', helpText: '발진, 두드러기, 습진, 탈모 등' },
    { label: '설사', value: 'diarrhea', helpText: '묽은 변, 혈변, 지속적인 설사 등' },
    { label: '배식 문제 / 구토', value: 'digestion', helpText: '식욕 부진, 구토, 소화불량 등' },
    { label: '관절문제', value: 'joint', helpText: '절뚝거림, 관절 뻣뻣함, 통증 등' },
    { label: '무기력', value: 'lethargy', helpText: '활동량 감소, 졸림, 에너지 부족 등' },
    { label: '임신관련', value: 'pregnancy', helpText: '임신 징후, 출산 준비, 산후 관리 등' },
    { label: '건강질문', value: 'health', helpText: '예방접종, 정기 검진, 영양 관리 등' },
    { label: '기타', value: 'miscellaneous', helpText: '기타 건강 관련 질문' },
];

const FormSection = ({ activeField, control, setValue, getValues, errors, trigger }) => {
    const [isTitleFocused, setIsTitleFocused] = useState(false);
    const [isDetailsFocused, setIsDetailsFocused] = useState(false);

    const handleCategorySelect = (value) => {
        setValue('petType', value, { shouldValidate: true });
        trigger('petType');
    };

    const handleTreatmentSelect = (value) => {
        setValue('treatment', value, { shouldValidate: true });
        trigger('treatment');
    };

    return (
        <View className="flex-1">
            {(!activeField || activeField === 'petType') && (
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    <Text className="text-2xl mb-8 font-semibold">펫 타입을 선택해주세요</Text>
                    {PET_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`mb-4 px-5 py-6 rounded-3xl ${getValues('petType') === option.value ? 'bg-neutral-100 border-gray-300' : 'bg-white border-gray-200'} border`}
                            onPress={() => handleCategorySelect(option.value)}
                        >
                            <Text className="text-lg font-semibold">{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                    {errors.petType && (
                        <Text className="text-red-500 mt-2">{errors.petType.message}</Text>
                    )}
                </ScrollView>
            )}
            {(!activeField || activeField === 'treatment') && (
                <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
                    <Text className="text-2xl mb-8 font-semibold">진료 항목을 선택해주세요</Text>
                    {TREATMENT_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            className={`mb-4 px-5 py-6 rounded-3xl ${getValues('treatment') === option.value ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} border`}
                            onPress={() => handleTreatmentSelect(option.value)}
                        >
                            <Text className="text-lg font-semibold">{option.label}</Text>
                            <Text className="text-sm text-gray-600 mt-1">{option.helpText}</Text>
                        </TouchableOpacity>
                    ))}
                    {errors.treatment && (
                        <Text className="text-red-500 mt-2">{errors.treatment.message}</Text>
                    )}
                </ScrollView>
            )}
            {(!activeField || activeField === 'title') && (
                <View>
                    <Text className="text-2xl font-semibold">질문 제목을 적어주세요</Text>
                    <Text className="mt-3 mb-8 text-gray-600">수의사님께 질문할 주제를 간단히 적어주세요</Text>
                    <View className="mb-4">
                        <Controller
                            control={control}
                            name="title"
                            defaultValue=""
                            rules={{ required: '제목을 입력해주세요.', maxLength: { value: 30, message: '제목은 30자 이내로 입력해주세요.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('title');
                                    }}
                                    onFocus={() => setIsTitleFocused(true)}
                                    onBlur={() => setIsTitleFocused(false)}
                                    placeholder="예시) 강아지가 구토를하고 있어요"
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
                    <Text className="text-2xl font-semibold">상세 정보를 적어주세요</Text>
                    <Text className="mt-3 mb-8 text-gray-600">수의사에게 질문하고 싶은 내용을 자세히 설명해주세요.</Text>
                    <View className="flex-1 mb-4">
                        <Controller
                            control={control}
                            name="details"
                            defaultValue=""
                            rules={{ required: '상세 정보를 입력해주세요.', maxLength: { value: 500, message: '상세 정보는 500자 이내로 입력해주세요.' } }}
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={(text) => {
                                        onChange(text);
                                        trigger('details');
                                    }}
                                    onFocus={() => setIsDetailsFocused(true)}
                                    onBlur={() => setIsDetailsFocused(false)}
                                    placeholder="질문 내용을 입력하세요"
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
                            <Text className="text-right text-sm text-gray-500">{getValues('details')?.length || 0}/500</Text>
                        </View>
                        {errors.details && (
                            <Text className="text-red-500 mt-2">{errors.details.message}</Text>
                        )}
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
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImages = result.assets.map((asset) => asset.uri);
                const updatedImages = [...images, ...newImages].slice(0, 5);
                if (newImages.length + images.length > 5) {
                    alert('최대 5장까지 업로드할 수 있습니다.');
                }
                setImages(updatedImages);
            }
        } catch (error) {
            console.error('이미지 선택 오류:', error);
            alert('이미지 선택 중 오류가 발생했습니다.');
        }
    };

    const removeImage = (uri) => {
        setImages(images.filter((img) => img !== uri));
    };

    return (
        <View>
            <Text className="text-2xl font-semibold">이미지 업로드 (선택)</Text>
            <Text className="mt-3 mb-8 text-gray-600">질문과 관련된 사진을 업로드해주세요. (최대 5장)</Text>
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
                        onPress={pickImage}
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
        className={`py-4 rounded-xl flex-1 ${disabled ? 'bg-gray-300' : 'bg-teal-500'}`}
        disabled={disabled}
        onPress={onPress}
    >
        <Text className="text-white font-semibold text-center">제출</Text>
    </TouchableOpacity>
);

export default function VetQuestionScreen() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedQuestionId, setSubmittedQuestionId] = useState<string | null>(null);
    const { control, handleSubmit, setValue, getValues, formState: { errors }, trigger, reset } = useForm({
        defaultValues: {
            petType: '',
            treatment: '',
            title: '',
            details: '',
            images: [],
        },
        mode: 'onChange',
    });

    const steps = [
        { name: 'petType', label: '펫 타입' },
        { name: 'treatment', label: '진료 항목' },
        { name: 'title', label: '질문 제목' },
        { name: 'details', label: '상세 정보' },
        { name: 'images', label: '이미지 업로드' },
    ];

    const onSubmit = async (data) => {
        try {

            const { data: diseaseTag, error: tagError } = await supabase
                .from('disease_tags')
                .select('id')
                .eq('tag_name', data.treatment)
                .single();

            if (tagError || !diseaseTag) {
                alert('질병 태그를 찾을 수 없습니다.');
                return;
            }


            const { data: questionData, error: questionError } = await supabase
                .from('pet_questions')
                .insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    title: data.title,
                    description: data.details,
                    animal_type: data.petType,
                    created_at: new Date().toISOString(),
                })
                .select('id')
                .single();

            if (questionError || !questionData) {
                alert('질문 저장 중 오류가 발생했습니다.');
                return;
            }


            const { error: tagLinkError } = await supabase
                .from('pet_question_disease_tags')
                .insert({
                    pet_question_id: questionData.id,
                    disease_tag_id: diseaseTag.id,
                });

            if (tagLinkError) {
                alert('질병 태그 연결 중 오류가 발생했습니다.');
                return;
            }


            if (data.images.length > 0) {
                const imageInserts = data.images.map((uri) => ({
                    pet_question_id: questionData.id,
                    url: uri,
                }));
                const { error: imageError } = await supabase
                    .from('pet_question_images')
                    .insert(imageInserts);

                if (imageError) {
                    alert('이미지 저장 중 오류가 발생했습니다.');
                    return;
                }
            }


            setSubmittedQuestionId(questionData.id);
            setIsSubmitted(true);
            reset();
        } catch (error) {
            console.error('제출 오류:', error);
            alert('질문 제출 중 오류가 발생했습니다.');
        }
    };

    const isNextDisabled = () => {
        const currentStepName = steps[currentStep]?.name;
        if (currentStepName === 'petType') {
            return !getValues('petType');
        }
        if (currentStepName === 'treatment') {
            return !getValues('treatment');
        }
        if (currentStepName === 'title') {
            return !getValues('title');
        }
        if (currentStepName === 'details') {
            return !getValues('details');
        }
        return false;
    };

    const handleNext = async () => {
        const currentStepName = steps[currentStep]?.name;
        let isValid = true;

        if (currentStepName === 'petType') {
            isValid = await trigger('petType');
        } else if (currentStepName === 'treatment') {
            isValid = await trigger('treatment');
        } else if (currentStepName === 'title') {
            isValid = await trigger('title');
        } else if (currentStepName === 'details') {
            isValid = await trigger('details');
        }

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const renderProgressBar = () => {
        const progress = ((currentStep + 1) / steps.length) * 100;
        return (
            <View className="w-full h-2 bg-gray-200 rounded-full mt-4 mb-6">
                <View className="h-2 bg-teal-500 rounded-full" style={{ width: `${progress}%` }} />
            </View>
        );
    };

    const renderResultScreen = () => (
        <View className="flex-1 bg-white pt-10">
            <View className="items-center mb-5">
                <View className="size-16 rounded-full bg-teal-500 justify-center items-center mb-3">
                    <FontAwesome6 name="check" size={24} color="white" />
                </View>
                <Text className="text-3xl font-bold mt-6 mb-2 text-black">
                    질문 작성이 완료되었습니다
                </Text>
                <Text className="text-neutral-500 text-lg text-center">
                    수의사분들이 검토 후{'\n'}답변을 남겨주실 예정입니다.
                </Text>
            </View>
            <View className="flex-row items-center justify-center my-6">
                <View className="items-center w-20">
                    <View className="size-8 rounded-full bg-teal-500 justify-center items-center mb-1">
                        <Text className="text-white font-bold text-base">✓</Text>
                    </View>
                    <Text className="text-sm text-teal-600 mt-2">질문 작성완료</Text>
                </View>
                <View className="flex-1 h-0.5 bg-teal-500 -mt-6" />
                <View className="items-center w-20">
                    <View className="size-8 rounded-full border-8 border-teal-500 bg-white justify-center items-center mb-1">
                        <View className="w-4 h-4 rounded-full bg-white" />
                    </View>
                    <Text className="text-sm text-teal-600 font-bold mt-2">질문 확인중</Text>
                </View>
                <View className="flex-1 h-0.5 bg-neutral-200 -mt-6" />
                <View className="items-center w-20">
                    <View className="size-8 rounded-full bg-neutral-200 justify-center items-center mb-1">
                        <Text className="text-neutral-400 font-bold text-base">3</Text>
                    </View>
                    <Text className="text-sm text-neutral-400 mt-2">답변완료!</Text>
                </View>
            </View>
            <View className="flex-1 flex-col justify-between mt-10">
                <View className="bg-neutral-50 rounded-2xl px-6 py-10 mb-5 shadow-sm">
                    <Text className="font-bold text-xl mb-8 text-gray-800">신청 요약정보</Text>
                    <View className="flex-row mb-6 justify-between">
                        <Text className="text-neutral-500">애완동물</Text>
                        <Text className="font-bold text-lg">{getValues('petType') || '미지정'}</Text>
                    </View>
                    <View className="flex-row mb-6 justify-between">
                        <Text className="text-neutral-500">진료항목</Text>
                        <Text className="font-bold text-lg">{getTreatmentLabel(getValues('treatment')) || '미지정'}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-neutral-500">제목</Text>
                        <Text className="font-bold text-lg" numberOfLines={1}>{getValues('title') || '미지정'}</Text>
                    </View>
                </View>
                <View>
                    <Text className="text-neutral-500 text-sm text-center mb-4">
                        ※ 질문에 따라 시간이 소요될 수 있습니다.
                    </Text>
                    <TouchableOpacity
                        className="bg-teal-500 py-4 rounded-xl items-center"
                        onPress={() => submittedQuestionId && router.push(`/medical/questions/${submittedQuestionId}`)}
                    >
                        <Text className="text-white font-bold text-lg">질문내역 보기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderStep = () => {
        if (isSubmitted) return renderResultScreen();
        const step = steps[currentStep];
        if (!step) return null;
        switch (step.name) {
            case 'images':
                return <ImageUploadSection control={control} setValue={setValue} getValues={getValues} />;
            default:
                return (
                    <View className="mb-4 flex-1">
                        <FormSection
                            activeField={step.name}
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
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color="#51555c" />
                        </TouchableOpacity>
                    </View>
                    {!isSubmitted && renderProgressBar()}
                    {!isSubmitted && (
                        <Text className="text-xl font-bold mb-4 text-neutral-400">
                            <Text className="text-neutral-800">{currentStep + 1}</Text>
                            {` / ${steps.length}`}
                        </Text>
                    )}
                    {renderStep()}
                </View>
                {!isSubmitted && (
                    <View className="px-6 pb-8 bg-white">
                        <View className="flex-row">
                            {currentStep > 0 && (
                                <TouchableOpacity
                                    className="bg-neutral-100 py-4 rounded-xl flex-[2] mr-2"
                                    onPress={handlePrevious}
                                >
                                    <Text className="text-black font-semibold text-center">이전</Text>
                                </TouchableOpacity>
                            )}
                            {currentStep < steps.length - 1 ? (
                                <TouchableOpacity
                                    className={`py-4 rounded-xl ${isNextDisabled() ? 'bg-neutral-300' : 'bg-teal-500'} ${currentStep === 0 ? 'flex-1' : 'flex-[8]'}`}
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
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}