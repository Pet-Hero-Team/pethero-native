import { default as RecommendationList, default as SearchInput } from '@/components/SearchInput';
import { useSearch } from '@/hooks/useSearch';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Platform, Pressable, SafeAreaView, Text, View } from 'react-native';

export default function SearchScreen() {
    const { searchQuery, filteredResults, handleSearchInputChange, handleClearSearch } = useSearch();
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const tabBarHeight = useBottomTabBarHeight();

    const handleSearchSubmit = () => {
        if (!searchQuery.trim()) return;
        if (!recentSearches.includes(searchQuery)) {
            setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
        }
        setShowResults(!!searchQuery.trim());
        router.push({ pathname: '/(maps)/search-results', params: { query: searchQuery } });
    };

    const handleClearRecentSearches = () => {
        setRecentSearches([]);
    };

    const handleRecentSearchPress = (search: string) => {
        handleSearchInputChange(search);
        setShowResults(true);
        router.push({ pathname: '/(maps)/search-results', params: { query: search } });
    };

    const handleDeleteRecentSearch = (search: string) => {
        setRecentSearches(recentSearches.filter((item) => item !== search));
    };

    const handleSuggestionPress = (title: string) => {
        handleSearchInputChange(title);
        setShowResults(true);
        router.push({ pathname: '/(maps)/search-results', params: { query: title } });
    };

    const renderRecentSearch = ({ item }: { item: string }) => (
        <View className="flex-row items-center justify-between py-4 px-6">
            <Pressable onPress={() => handleRecentSearchPress(item)} className="flex-row items-center flex-1">
                <Fontisto name="clock" size={16} color="#525252" />
                <Text className="ml-3 text-base text-neutral-700">{item}</Text>
            </Pressable>
            <Pressable onPress={() => handleDeleteRecentSearch(item)} className="p-2">
                <Ionicons name="close" size={14} color="#525252" />
            </Pressable>
        </View>
    );

    const renderSearchResult = RecommendationList({ searchQuery, filteredResults, onSuggestionPress: handleSuggestionPress });

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
                autoFocus={true}
            />

            <View className="flex-1 mt-6">
                {!showResults && (
                    <View>
                        <View className="flex-row justify-between items-center px-6">
                            <Text className="text-lg font-bold text-neutral-800">최근 검색</Text>
                            <Pressable onPress={handleClearRecentSearches}>
                                <Text className="text-sm text-neutral-500">전체 삭제</Text>
                            </Pressable>
                        </View>
                        {recentSearches.length > 0 && (
                            <FlatList
                                data={recentSearches}
                                renderItem={renderRecentSearch}
                                keyExtractor={(item, index) => index.toString()}
                                scrollEnabled={false}
                            />
                        )}
                    </View>
                )}

                {showResults && (
                    <View className="flex-1">
                        <FlatList
                            data={filteredResults}
                            renderItem={renderSearchResult}
                            keyExtractor={(item) => item.id}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}