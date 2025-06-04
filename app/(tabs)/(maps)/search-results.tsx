import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Fuse from 'fuse.js';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';

export default function SearchResultsScreen() {
    const navigation = useNavigation();
    const { query } = useLocalSearchParams<{ query: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedTab, setSelectedTab] = useState('구조요청');
    const tabBarHeight = useBottomTabBarHeight();

    useEffect(() => {
        setSearchQuery(query || '');
    }, [query]);

    const mockResults = [
        { id: '1', title: '골든리트리버 구조 요청 - 서울' },
        { id: '2', title: '유기동물 제보 - 부산' },
        { id: '3', title: '강아지 모임 - 인천' },
        { id: '4', title: '고양이 구조 - 대구' },
        { id: '5', title: '푸들 구조 요청 - 광주' },
        { id: '6', title: '유기 고양이 제보 - 대전' },
        { id: '7', title: '강아지 산책 모임 - 울산' },
        { id: '8', title: '시바견 구조 - 세종' },
        { id: '9', title: '고양이 입양 제보 - 경기' },
        { id: '10', title: '말티즈 모임 - 제주' },
    ];

    const fuse = useMemo(
        () => new Fuse(mockResults, { keys: ['title'], threshold: 0.4, includeScore: true }),
        []
    );

    const handleSearchSubmit = () => {
        setIsTyping(false);
        router.push({ pathname: '/(maps)/search-results', params: { query: searchQuery } });
    };

    const handleSearchInputChange = (text: string) => {
        setSearchQuery(text);
        setIsTyping(!!text.trim());
    };

    const handleSuggestionPress = (title: string) => {
        setSearchQuery(title);
        setIsTyping(false);
        router.push({ pathname: '/(maps)/search-results', params: { query: title } });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsTyping(false);
    };

    const handleTabPress = (tab: string) => {
        setSelectedTab(tab);
    };

    const filteredResults = searchQuery.trim()
        ? fuse.search(searchQuery.trim()).map((result) => result.item)
        : [];

    const renderSearchResult = ({ item }: { item: { id: string; title: string } }) => {
        const query = searchQuery.trim().toLowerCase();
        const title = item.title;
        const index = title.toLowerCase().indexOf(query);
        let beforeMatch = title;
        let match = '';
        let afterMatch = '';

        if (index !== -1 && query.length > 0) {
            beforeMatch = title.slice(0, index);
            match = title.slice(index, index + query.length);
            afterMatch = title.slice(index + query.length);
        }

        return (
            <Pressable onPress={() => handleSuggestionPress(item.title)}>
                <View className="flex-row items-center py-3 px-6">
                    <Fontisto name="search" size={16} color="#525252" />
                    <Text className="ml-3 text-base">
                        <Text className="text-neutral-700">{beforeMatch}</Text>
                        <Text className="text-orange-500">{match}</Text>
                        <Text className="text-neutral-700">{afterMatch}</Text>
                    </Text>
                </View>
            </Pressable>
        );
    };

    const renderSearchResultItem = ({ item }: { item: { id: string; title: string } }) => (
        <View className="py-3 px-6">
            <Text className="text-base text-neutral-700">{item.title}</Text>
        </View>
    );

    const showRecommendations = isTyping && filteredResults.length > 0;

    const tabs = ['구조요청', '제보'];

    return (
        <SafeAreaView
            className="flex-1 bg-white"
            style={{ paddingBottom: Platform.OS === 'android' ? tabBarHeight : 0 }}
        >
            <View className="flex-row items-center pt-2 mx-6">
                <Pressable onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={28} color="#525252" />
                </Pressable>
                <View className="flex-1 flex-row items-center text-neutral-400 justify-between ml-4 bg-neutral-100 rounded-lg pl-6 pr-4 py-4">
                    <TextInput
                        className="flex-1 text-base font-bold text-neutral-700"
                        placeholder="구조, 제보, 모임을 검색해보세요."
                        value={searchQuery}
                        onChangeText={handleSearchInputChange}
                        autoFocus={false}
                        placeholderTextColor="#c7c7c7"
                        returnKeyType="search"
                        onSubmitEditing={handleSearchSubmit}
                    />
                    <Pressable onPress={searchQuery.trim() ? handleClearSearch : handleSearchSubmit}>
                        {searchQuery.trim() ? (
                            <Ionicons name="close-circle" size={20} color="#a3a3a3" className="mr-2" />
                        ) : (
                            <Fontisto name="search" size={18} color="#525252" className="mr-2" />
                        )}
                    </Pressable>
                </View>
            </View>
            {!showRecommendations && (
                <View className="mt-4">
                    <View className="flex-row items-center">
                        {tabs.map((tab) => (
                            <Pressable
                                key={tab}
                                onPress={() => handleTabPress(tab)}
                                className={`w-1/2 py-2 px-4 ${selectedTab === tab ? 'border-b-2 border-neutral-800' : 'border-b border-neutral-200'}`}
                            >
                                <Text
                                    className={`text-base text-center ${selectedTab === tab ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}
                                >
                                    {tab}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}

            <View className="flex-1 mt-4">
                {showRecommendations ? (
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-neutral-800 px-6">추천 검색어</Text>
                        <FlatList
                            data={filteredResults}
                            renderItem={renderSearchResult}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={
                                <View className="px-6 py-4">
                                    <Text className="text-base text-neutral-500">추천 검색어가 없습니다.</Text>
                                </View>
                            }
                        />
                    </View>
                ) : (
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-neutral-800 px-6">검색 결과</Text>
                        <FlatList
                            data={filteredResults}
                            renderItem={renderSearchResultItem}
                            keyExtractor={(item) => item.id}
                            ListEmptyComponent={
                                <View className="flex-1 justify-center items-center">
                                    <Text className="text-base text-neutral-500">검색 결과가 없습니다.</Text>
                                </View>
                            }
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}