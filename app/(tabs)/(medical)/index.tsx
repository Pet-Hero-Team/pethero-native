import { ShadowView } from '@/components/ShadowView';
import { supabase } from '@/supabase/supabase';
import { formatTimeAgo, getAnimalTypeLabel, getTreatmentLabel } from '@/utils/formating';
import { AntDesign, FontAwesome6, Fontisto, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const newsList = [
    {
        id: 1,
        type: '고양이',
        title: '고양이는 왜 꾹꾹이를 할까?',
        created_at: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        image: 'https://picsum.photos/200/300',
    },
    {
        id: 2,
        type: '강아지',
        title: '강아지 석고현상을 아시나요?',
        created_at: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        image: 'https://picsum.photos/200/300',
    },
    {
        id: 3,
        type: '소형동물',
        title: '토끼 키우기에 관한 꿀팁 10가지',
        created_at: new Date(new Date().getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        image: 'https://picsum.photos/200/300',
    },
];

const fetchQuestions = async () => {

    const { data, error } = await supabase
        .from('pet_questions')
        .select(`
      id,
      title,
      description,
      animal_type,
      created_at,
      pet_question_images (url),
      pet_question_disease_tags (
        disease_tags (tag_name)
      )
    `)
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) throw new Error(`질문 조회 실패: ${error.message}`);

    return data.map((question) => ({
        id: question.id,
        title: question.title,
        description: question.description || '설명 없음',
        animal_type: getAnimalTypeLabel(question.animal_type),
        created_at: question.created_at,
        image: question.pet_question_images?.[0]?.url || null,
        disease_tag: getTreatmentLabel(question.pet_question_disease_tags?.[0]?.disease_tags?.tag_name || '미지정'),
    }));
};

const QuestionItemSkeleton = () => {
    return (
        <SkeletonPlaceholder
            backgroundColor="#e5e7eb"
            highlightColor="#f3f4f6"
            speed={1000}
        >
            <View style={{ width: '100%', paddingVertical: 32, paddingHorizontal: 24, borderBottomWidth: 1, borderColor: '#f3f4f6' }}>
                <View style={{ width: '100%', height: 20, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ width: '100%', height: 14, borderRadius: 4, marginBottom: 4 }} />
                <View style={{ width: '80%', height: 14, borderRadius: 4, marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ width: 100, height: 20, borderRadius: 8 }} />
                    <View style={{ width: 50, height: 12, borderRadius: 4 }} />
                </View>
            </View>
        </SkeletonPlaceholder>
    );
};

export default function MedicalScreen() {
    const { width } = useWindowDimensions();
    const CARD_WIDTH = width * 0.55;
    const CARD_MARGIN = 12;

    const { data: questions = [], isLoading, error } = useQuery({
        queryKey: ['questions'],
        queryFn: fetchQuestions,
    });

    return (
        <SafeAreaView className="flex-1 bg-teal-800">
            <ScrollView className="flex-1 bg-teal-800">
                <View className="px-6 bg-teal-800 pb-16 pt-4">
                    <FontAwesome6 name="shield-dog" size={28} color="white" />
                    <Text className="text-3xl font-bold text-white mt-3 shadow">
                        내 애완동물의 건강을 {"\n"}한번에 해결해드릴게요.
                    </Text>
                </View>
                <View className="bg-white rounded-t-3xl relative">
                    <View className="mx-6">
                        <ShadowView className="absolute bg-white rounded-full px-8 py-6 -top-8 w-full flex-1 flex-row items-center justify-between">
                            <Text className="text-neutral-500 rounded-full">증상이나 병원명으로 검색...</Text>
                            <Fontisto name="search" size={18} color="#737373" />
                        </ShadowView>
                    </View>
                    <View className="px-6 pt-16 pb-2">
                        <View className="flex-row items-center">
                            <ShadowView className="rounded-3xl bg-white flex-1 justify-between py-6 px-5 w-1/2">
                                <Link href="/medical/questions/question" asChild>
                                    <Pressable>
                                        <View>
                                            <Text className="text-xl font-bold text-neutral-700 mb-2">질문하기</Text>
                                            <Text className="text-neutral-500 mb-4">수의사에게 물어보세요.</Text>
                                        </View>
                                        <Image
                                            source={require('@/assets/images/5.png')}
                                            className="size-20 self-end"
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </Link>
                            </ShadowView>
                            <View className="w-4"></View>
                            <ShadowView className="rounded-3xl bg-white flex-1 justify-between py-6 px-5 w-1/2">
                                <Link href="/medical/video/call-list" asChild>
                                    <Pressable>
                                        <View>
                                            <Text className="text-xl font-bold text-neutral-700 mb-2">비대면 진료</Text>
                                            <Text className="text-neutral-500 mb-4">전화 및 영상통화 진료</Text>
                                        </View>
                                        <Image
                                            source={require('@/assets/images/4.png')}
                                            className="size-20 self-end"
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </Link>
                            </ShadowView>
                        </View>
                    </View>
                </View>

                <View className="bg-white">
                    {isLoading ? (
                        <View>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <QuestionItemSkeleton key={index} />
                            ))}
                        </View>
                    ) : error ? (
                        <Text className="text-red-500 text-center">오류: {(error as Error).message}</Text>
                    ) : questions.length === 0 ? (
                        <Text className="text-neutral-600 text-center">질문이 없습니다.</Text>
                    ) : (
                        questions.map((item) => (
                            <Link href={`/medical/questions/${item.id}`} key={item.id}>
                                <View className="border-b border-b-neutral-100 py-8 w-full">
                                    <View className="px-6">
                                        <Text className="text-neutral-700 font-bold text-lg pb-1">{item.title}</Text>
                                        <Text className="text-neutral-600 text-base leading-7" numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center px-6 pt-4 justify-between">
                                        <View className="bg-neutral-100 py-2 px-3 rounded-lg">
                                            <Text className="text-sm font-semibold text-neutral-600">{item.disease_tag}</Text>
                                        </View>
                                        <Text className="text-sm text-neutral-600">{formatTimeAgo(item.created_at)}</Text>
                                    </View>
                                </View>
                            </Link>
                        ))
                    )}
                    <Link href="/medical/questions/questions">
                        <View className="border-b border-b-neutral-100 py-5 w-full">
                            <View className="flex-row items-center justify-center ml-2">
                                <Text className="text-center text-base text-neutral-600 mr-1">더보기</Text>
                                <AntDesign name="right" size={12} color="#6c6c6c" />
                            </View>
                        </View>
                    </Link>
                </View>
                <View className="bg-white px-6 py-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-neutral-700 font-bold text-xl">애완 소식지</Text>
                        <Link href="/medical/news/news" className="text-neutral-500 text-sm">더보기</Link>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH + CARD_MARGIN}
                        contentContainerStyle={{ gap: 16 }}
                        decelerationRate="fast"
                    >
                        {newsList.map((item, idx) => (
                            <Link href={`/medical/news/${item.id}`} key={item.id}>
                                <View
                                    style={{
                                        width: CARD_WIDTH,
                                        marginRight: idx === newsList.length - 1 ? 0 : CARD_MARGIN,
                                    }}
                                    className="rounded-2xl relative"
                                >
                                    <View className="absolute left-2 top-2 bg-neutral-700 rounded-full px-2 py-1 z-10">
                                        <Text className="text-xs text-white font-bold">{item.type}</Text>
                                    </View>
                                    <Image
                                        source={{ uri: item.image }}
                                        className={`w-[${CARD_WIDTH}] h-40 rounded-lg`}
                                        resizeMode="cover"
                                    />
                                    <Text className="text-neutral-700 font-bold text-lg mb-1 mt-3">{item.title}</Text>
                                    <Text className="text-neutral-500 text-xs">{formatTimeAgo(item.created_at)}</Text>
                                </View>
                            </Link>
                        ))}
                    </ScrollView>
                </View>
                <View className="w-full bg-white px-4 py-6">
                    <View className="bg-neutral-100 rounded-xl flex-row items-center justify-between px-5 py-6 mb-7">
                        <View>
                            <Text className="text-lg font-bold text-neutral-800 mb-1">의료에 대한 평가</Text>
                            <Text className="text-neutral-500 text-base">여러분의 의견을 들려주세요.</Text>
                        </View>
                        <Ionicons name="chatbox-ellipses" size={40} color="#4c4c4c" />
                    </View>

                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center">
                            <AntDesign name="isv" size={20} color="black" />
                            <Text className="ml-2 text-neutral-800 font-medium text-base">내 업체 등록</Text>
                        </TouchableOpacity>
                        <View className="w-px h-6 bg-neutral-200 mx-3" />
                        <TouchableOpacity className="flex-1 flex-row items-center justify-center">
                            <AntDesign name="customerservice" size={20} color="black" />
                            <Text className="ml-2 text-neutral-800 font-medium text-base">고객센터</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}