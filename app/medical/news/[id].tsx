import { ShadowView } from '@/components/ShadowView';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';


const newsList = [
    {
        id: 1,
        title: '강아지 치료제 성공적 개발...."내년 상반기 출시예정"',

        time: '7분 전',
        image: { uri: 'https://picsum.photos/seed/1/80/80' },
    },
    {
        id: 2,
        title: '강아지 치료제 성공적 개발...."내년 상반기 출시예정"',

        time: '2시간 전',
        image: { uri: 'https://picsum.photos/seed/2/80/80' },
    },
    {
        id: 3,
        title: '강아지 치료제 성공적 개발...."내년 상반기 출시예정"',

        time: '3시간 전',
        image: { uri: 'https://picsum.photos/seed/3/80/80' },
    },
    {
        id: 4,
        title: '강아지 치료제 성공적 개발...."내년 상반기 출시예정"',

        time: '5시간 전',
        image: { uri: 'https://picsum.photos/seed/4/80/80' },
    },
    {
        id: 5,
        title: '강아지 치료제 성공적 개발...."내년 상반기 출시예정"',

        time: '4시간 전',
        image: { uri: 'https://picsum.photos/seed/5/80/80' },
    },
];
export default function NewsDetailScreen() {

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 pb-4 pt-4 ">
                <Pressable onPress={() => router.back()} >
                    <Ionicons name="chevron-back" size={28} color="#222" />
                </Pressable>
            </View>
            <ScrollView>
                <View className="px-6">
                    <Text className="text-2xl font-extrabold text-neutral-900 mt-8">고양이는 왜 꾹꾹이를 할까?</Text>
                    <Text className="text-neutral-500 mt-2">2025년 6월 20일 00:02</Text>
                </View>
                <View className='mt-8 px-6'>
                    <Image
                        source={{ uri: 'https://picsum.photos/800/800' }}
                        className="w-full h-96 rounded-xl overflow-hidden"
                        resizeMode="cover"
                    />
                </View>
                <ShadowView className='bg-white px-6 pt-10 pb-10' >
                    <Text style={{ fontSize: 16 }} className='leading-8 font-medium text-neutral-800'>
                        1400만 반려동물 시대, 건강관리 트렌드의 변화
                        2025년 현재, 국내 반려동물 인구는 1400만 명을 넘어섰으며, 이에 따라 애견 건강관리 트렌드도 빠르게 변화하고 있다. 최근 발표된 ‘2025 반려동물 건강관리 트렌드 키워드’는 맞춤형 건강관리, 예방 중심의 케어, 그리고 첨단 기술의 도입이 핵심임을 보여준다. {"\n"}{"\n"}
                        맞춤형 건강관리와 예방 중심 케어 반려견마다 품종, 연령, 체중, 건강 상태가 다르다는 인식이 확산되면서, 빅데이터와 AI를 활용한 맞춤형 건강관리가 보편화되고 있다. 예를 들어, DNA 검사나 수의사의 진단을 바탕으로 설계된 맞춤형 사료가 등장해 알레르기, 비만, 신장 질환 등 개별 건강 문제에 대응하고 있다. 또한, 활동량 감소, 식욕 저하 등 작은 변화도 중요한 건강 신호로 인식되어 신속한 대응이 강조된다. {"\n"}{"\n"}
                        예방 중심의 케어 문화도 확산 중이다. 정기적인 건강검진, 예방접종, 구충제 투여 등 기본적인 건강관리 외에도, 스트레스 관리와 환경 개선이 반려견의 신체적·정신적 건강을 지키는 데 중요한 요소로 부각되고 있다.{"\n"}{"\n"}
                        2025년 CES 등 글로벌 박람회에서는 AI 기반 웨어러블 기기와 스마트 장난감 등 펫테크가 주목받았다. 예를 들어, ‘헬스가드’와 같은 웨어러블 기기는 반려견의 활동량, 수면 패턴, 심박수를 실시간으로 측정해 건강 이상을 조기에 목격할 수 있도록 돕는다. 스마트 장난감은 보호자가 외출 중에도 앱으로 반려견의 운동과 스트레스 해소를 도울 수 있게 한다.{"\n"}{"\n"}
                        이러한 기술 발전은 반려견의 건강 모니터링을 일상화하고, 조기 진단 및 예방적 치료를 가능하게 하여 반려동물 복지 수준을 한층 높이고 있다. 공공 진료 및 제도 변화 반려동물의 기초의료를 공공이 책임지는 제도도 도입되었다. 김포시 등 일부 지역에서는 공공진료센터가 개설되어, 시민 누구나 반려동물의 종합검진과 예방접종을 받을 수 있게 되었다. 이는 유기동물의 건강관리와 재입양 가능성 증진에도 기여하고 있다.{"\n"}{"\n"}
                        또한, 2025년부터는 반려동물 관련 모든 영업장에 CCTV 설치가 의무화되어 동물학대 예방과 건강 증진에 기여한다. 동물병원 진료비 게시 항목도 20개로 확대되어 투명성이 강화되었고, 백신 품질 관리 체계도 한층 엄격해졌다. 영양제·사료 시장의 변화와 주의점 프리미엄 및 기능성 사료, 영양제 시장도 지속 성장 중이다. 하지만 최근 조사에 따르면 일부 반려동물 영양제는 표시된 양보다 실제 성분 함량이 크게 부족하거나, 질병 치료 효과를 과장하는 사례가 있어 소비자의 주의가 요구된다. 정부와 관련 기관은 영양제 및 기능성 사료의 품질 관리와 정보 제공을 강화하고 있다.
                    </Text>
                </ShadowView>
                <View className='w-full bg-neutral-100 h-6'></View>
                <View className="bg-white pt-12 ">
                    <View className='px-6 mb-12'>
                        <Text className="text-2xl font-extrabold text-neutral-900 mb-8">관련 소식</Text>
                        {newsList.map((item, idx) => (
                            <View
                                key={item.id}
                                className={`flex-row items-center justify-between ${idx < newsList.length - 1 ? 'mb-6' : ''}`}
                            >
                                <View className="flex-1 pr-8">
                                    <Text className="text-neutral-700 font-semibold text-lg mb-2 leading-6" numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                    <Text className="text-neutral-500 text-sm">
                                        {item.time}
                                    </Text>
                                </View>
                                <Image
                                    source={item.image}
                                    className="size-24 rounded-lg"
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </View>
                    <Link href={"/medical/news/news"}>
                        <View className='border-t border-t-neutral-100 pt-6 pb-3 w-full'>
                            <View className='flex-row items-center justify-center ml-2'>
                                <Text className='text-center text-base text-neutral-600 mr-1'>더보기</Text>
                                <AntDesign name="right" size={12} color="#6c6c6c" />
                            </View>
                        </View>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
