import { ShadowView } from '@/components/ShadowView';
import { Fontisto, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';


const ReportItem = () => (
    <View className='flex-row justify-between px-6 mt-8'>
        <View className='flex-1'>
            <Text className='text-lg font-bold text-neutral-800'>주황색 보더콜리를 봤었습니다.</Text>
            <Text className='leading-6 text-neutral-500 mt-1' numberOfLines={2}>
                서울숲 공원에서 발견했구요, 목줄이 착용되어있었습니다. 이름은 적혀있지않았고 사람손을 많이 탄걸로보여요 짖지도 않고 사람을 좋아하는거같아요
            </Text>
            <View className='flex-row items-center mt-4 justify-between pr-1'>
                <View className="flex-row items-center bg-neutral-100 px-2 py-1 rounded-md">
                    <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                    <Text className="text-xs text-neutral-600 ml-1">부천상동</Text>
                </View>
            </View>
        </View>
        <Image
            source={{ uri: "https://picsum.photos/seed/puppy4/400/400" }}
            className='size-28 rounded-2xl ml-4'
            resizeMode='contain'
        />
    </View>
);

const tabs = [
    { id: 'group', label: '최신순' },
    { id: 'personal', label: '인기순' },
];

export default function ReportsScreen() {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const topSectionRef = useRef(null);
    const [topSectionHeight, setTopSectionHeight] = useState(0);

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrolled(offsetY > topSectionHeight);
    };

    const handleLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        setTopSectionHeight(height);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-100">
            <View className={`px-6 py-3 transition-colors duration-100 ${scrolled ? 'bg-white' : 'bg-slate-100'}`}>
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} hitSlop={12}>
                        <Ionicons name="chevron-back" size={28} color="#222" />
                    </Pressable>
                    <Link href="/home/report/report">
                        <MaterialCommunityIcons name="pencil-box-multiple-outline" size={30} color="#222" />
                    </Link>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View
                    className='bg-slate-100 pt-8 pb-14 px-9 flex-row items-center'
                    onLayout={handleLayout}
                    ref={topSectionRef}
                >
                    <Image
                        source={require('@/assets/images/2.png')}
                        className="size-16"
                        resizeMode="contain"
                    />
                    <View className='ml-6 flex-1'>
                        <Text className='text-lg text-orange-500 font-bold'>실제 유저가 올린</Text>
                        <Text className='text-2xl font-bold'>실시간 제보를 확인하세요</Text>
                    </View>
                </View>

                <ShadowView className='bg-white flex-1 rounded-3xl pb-12'>
                    <View className="flex-row justify-between mt-3">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id)}
                                className="flex-1 py-3 items-center"
                            >
                                <Text className={`text-base ${activeTab === tab.id ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                                    {tab.label}
                                </Text>
                                {activeTab === tab.id && (
                                    <View className="w-6 h-0.5 bg-neutral-800 mt-1" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                    <ReportItem />
                    <ReportItem />
                    <ReportItem />
                    <ReportItem />
                    <ReportItem />
                </ShadowView>
            </ScrollView>
        </SafeAreaView>
    );
}