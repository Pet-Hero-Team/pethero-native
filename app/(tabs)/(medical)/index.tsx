import { ShadowView } from '@/components/ShadowView';
import { AntDesign, FontAwesome6, Fontisto, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
const newsList = [
    {
        id: 1,
        type: '고양이',
        title: '고양이는 왜 꾹꾹이를 할까?',
        period: '3일 전',
        image: 'https://picsum.photos/200/300',
    },
    {
        id: 2,
        type: '강아지',
        title: '강아지 석고현상을 아시나요?',
        period: '5일 전',
        image: 'https://picsum.photos/200/300',
    },
    {
        id: 3,
        type: '소형동물',
        title: '토끼 키우기에 관한 꿀팁 10가지',
        period: '8일 전',
        image: 'https://picsum.photos/200/300',
    },
];
export default function MedicalScreen() {

    const { width } = useWindowDimensions();
    const CARD_WIDTH = width * 0.55;
    const CARD_MARGIN = 12;
    return (
        <SafeAreaView className="flex-1 bg-teal-800">
            <ScrollView className='flex-1 bg-teal-800'>
                <View className='px-6 bg-teal-800 pb-16 pt-4'>
                    <FontAwesome6 name="shield-dog" size={28} color="white" />
                    <Text className="text-3xl font-bold text-white mt-3 shadow">내 애완동물의 건강을 {"\n"}한번에 해결해드릴게요.</Text>
                </View>
                <View className='bg-white rounded-t-3xl relative'>
                    <View className='mx-6'>
                        <ShadowView className='absolute bg-white rounded-full px-8 py-6 -top-8 w-full flex-1 flex-row items-center justify-between '>
                            <Text className='text-neutral-500 rounded-full'>증상이나 병원명으로 검색...</Text>
                            <Fontisto name="search" size={18} color="#737373" />
                        </ShadowView>
                    </View>
                    <View className="px-6 pt-16">
                        <View className="flex-row items-center">
                            <ShadowView className="rounded-3xl bg-white flex-1 mx-1 justify-between py-6 px-5">
                                <Link href="/medical/questions/question">

                                    <View>
                                        <Text className="text-xl  font-bold text-neutral-700 mb-2">질문하기</Text>
                                        <Text className="text-neutral-500 mb-4">수의사에게 물어보세요.</Text>
                                    </View>
                                    <Image
                                        source={require('@/assets/images/5.png')}
                                        className="size-20 self-end"
                                        resizeMode="contain"
                                    />
                                </Link>
                            </ShadowView>
                            <View className="w-3" />
                            <Link href="/medical/video-call">
                                <ShadowView className="rounded-3xl bg-white flex-1 mx-1 justify-between py-6 px-5">
                                    <View>
                                        <Text className="text-xl  font-bold text-neutral-700 mb-2">비대면 진료</Text>
                                        <Text className="text-neutral-500 mb-4">전화 및 영상통화 진료 </Text>
                                    </View>
                                    <Image
                                        source={require('@/assets/images/4.png')}
                                        className="size-20 self-end"
                                        resizeMode="contain"
                                    />
                                </ShadowView>
                            </Link>
                        </View>
                    </View>


                    <View className='mt-2'>

                        <Link href={`/medical/questions/[1]`}>
                            <View className='border-b border-b-neutral-100 py-8'>
                                <View className='px-6'>
                                    <Text className='text-neutral-700 font-bold text-lg pb-1'>고양이 뱃살에 발진이 일어났어요</Text>
                                    <Text className='text-neutral-600 text-base leading-7'>지난주부터 구석에서 혼자 막 배를 긁길래 장난인줄 알았는데 {"\n"}자세히보니 배에 발진이 일어나있어요 혹시 어떻게 해야할까요?</Text>
                                </View>
                                <View className='flex-row items-center px-6 pt-4 justify-between'>
                                    <View className='bg-neutral-100 py-2 px-3 rounded-lg'>
                                        <Text className='text-sm font-semibold text-neutral-600'>피부 질환</Text>
                                    </View>
                                    <Text className='text-sm text-neutral-600'>15분 전</Text>
                                </View>
                            </View>

                        </Link>
                        <Link href={`/medical/questions/[2]`}>
                            <View className='border-b border-b-neutral-100 py-8'>
                                <View className='px-6'>
                                    <Text className='text-neutral-700 font-bold text-lg pb-1'>고양이 뱃살에 발진이 일어났어요</Text>
                                    <Text className='text-neutral-600 text-base leading-7'>지난주부터 구석에서 혼자 막 배를 긁길래 장난인줄 알았는데 {"\n"}자세히보니 배에 발진이 일어나있어요 혹시 어떻게 해야할까요?</Text>
                                </View>
                                <View className='flex-row items-center px-6 pt-4 justify-between'>
                                    <View className='bg-neutral-100 py-2 px-3 rounded-lg'>
                                        <Text className='text-sm font-semibold text-neutral-600'>피부 질환</Text>
                                    </View>
                                    <Text className='text-sm text-neutral-600'>15분 전</Text>
                                </View>
                            </View>
                        </Link>

                        <Link href={`/medical/questions/[3]`}>
                            <View className='border-b border-b-neutral-100 py-8'>
                                <View className='px-6'>
                                    <Text className='text-neutral-700 font-bold text-lg pb-1'>고양이 뱃살에 발진이 일어났어요</Text>
                                    <Text className='text-neutral-600 text-base leading-7'>지난주부터 구석에서 혼자 막 배를 긁길래 장난인줄 알았는데 {"\n"}자세히보니 배에 발진이 일어나있어요 혹시 어떻게 해야할까요?</Text>
                                </View>
                                <View className='flex-row items-center px-6 pt-4 justify-between'>
                                    <View className='bg-neutral-100 py-2 px-3 rounded-lg'>
                                        <Text className='text-sm font-semibold text-neutral-600'>피부 질환</Text>
                                    </View>
                                    <Text className='text-sm text-neutral-600'>15분 전</Text>
                                </View>
                            </View>
                        </Link>
                        <Link href={"/medical/questions/questions"}>
                            <View className='border-b border-b-neutral-100 py-5 w-full'>
                                <View className='flex-row items-center justify-center ml-2'>
                                    <Text className='text-center text-base text-neutral-600 mr-1'>더보기</Text>
                                    <AntDesign name="right" size={12} color="#6c6c6c" />
                                </View>
                            </View>
                        </Link>
                    </View>
                </View>
                <View className="bg-white px-6 py-8">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-neutral-700 font-bold text-xl">애완 소식지</Text>
                        <Link href={"/medical/news/news"} className="text-neutral-500 text-sm">더보기</Link>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={CARD_WIDTH + CARD_MARGIN}
                        contentContainerStyle={{ gap: 16 }}
                        decelerationRate="fast"
                    >
                        {newsList.map((item, idx) => (
                            <Link href={`/medical/news/[${item.id}]`} key={item.id}>
                                <View
                                    style={{
                                        width: CARD_WIDTH,
                                        marginRight: idx === newsList.length - 1 ? 0 : CARD_MARGIN,
                                    }}
                                    className={`rounded-2xl relative`}
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
                                    <Text className="text-neutral-500 text-xs">{item.period}</Text>
                                </View>
                            </Link>
                        ))}
                    </ScrollView>
                </View>
                <View className="w-full bg-white px-4 py-6">
                    <View className="bg-neutral-100 rounded-xl flex-row items-center justify-between px-5 py-6 mb-7">
                        <View>
                            <Text className="text-lg font-bold text-neutral-800 mb-1">
                                의료에 대한 평가
                            </Text>
                            <Text className="text-neutral-500 text-base">
                                여러분의 의견을 들려주세요.
                            </Text>
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
        </SafeAreaView >
    );
}
