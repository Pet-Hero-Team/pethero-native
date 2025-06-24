import RecommendationList from '@/components/RecommendationList';
import SearchInput from '@/components/SearchInput';
import { useSearch } from '@/hooks/useSearch';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Platform, Pressable, SafeAreaView, Text, View } from 'react-native';

export default function SearchResultsScreen() {
    const { query } = useLocalSearchParams<{ query: string }>();
    const {
        searchQuery,
        setSearchQuery,
        filteredResults,
        showRecommendations,
        handleSearchInputChange,
        handleClearSearch,
        setIsTyping,
    } = useSearch(query || '');
    const [selectedTab, setSelectedTab] = useState('구조요청');
    const tabBarHeight = useBottomTabBarHeight();

    useEffect(() => {
        setSearchQuery(query || '');
    }, [query]);

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        setIsTyping(false);
        router.push({ pathname: '/(maps)/search-results', params: { query: searchQuery } });
    };

    const handleSuggestionPress = (title: string) => {
        setSearchQuery(title);
        setIsTyping(false);
        router.push({ pathname: '/(maps)/search-results', params: { query: title } });
    };

    const handleTabPress = (tab: string) => {
        setSelectedTab(tab);
    };

    const tabs = ['구조요청', '발견'];

    return (
        <SafeAreaView
            className="flex-1 bg-white"
            style={{ paddingBottom: Platform.OS === 'android' ? tabBarHeight : 0 }}
        >
            <SearchInput
                searchQuery={searchQuery}
                onChangeText={handleSearchInputChange}
                onSubmit={handleSearchSubmit}
                onClear={handleClearSearch}
                autoFocus={false}
            />

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
                            renderItem={RecommendationList({ searchQuery, onSuggestionPress: handleSuggestionPress })}
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
                        <Text className="text-lg font-bold text-neutral-800 px-6 mb-4">검색 결과</Text>
                        {filteredResults.length === 0 ? (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-base text-neutral-500">검색 결과가 없습니다.</Text>
                            </View>
                        ) : (
                            <View className="px-6">
                                {filteredResults.map((item) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => handleSuggestionPress(item.title)}
                                        className="bg-neutral-100 rounded-lg p-4 mb-3 shadow-sm"
                                    >
                                        <Text className="text-base font-semibold text-neutral-800">{item.title}</Text>
                                        <Text className="text-sm text-neutral-500 mt-1">
                                            {item.title.includes('구조') ? '긴급 구조 요청입니다.' : '발견 또는 모임 정보입니다.'}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}