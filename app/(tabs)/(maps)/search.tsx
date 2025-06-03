import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from 'expo-router';
import Fuse from 'fuse.js';
import { useMemo, useState } from 'react';
import { FlatList, Platform, Pressable, SafeAreaView, Text, TextInput, View } from 'react-native';

export default function SearchScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showResults, setShowResults] = useState(false);
    const tabBarHeight = useBottomTabBarHeight();

    const mockResults = [
        { id: '1', title: '골든리트리버 구조 요청' },
        { id: '2', title: '유기동물 제보' },
        { id: '3', title: '강아지 모임' },
        { id: '4', title: '고양이 구조' },
    ];


    const fuse = useMemo(
        () => new Fuse(mockResults, { keys: ['title'], threshold: 0.4, includeScore: true }),
        []
    );

    const handleSearchSubmit = () => {
        if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
            setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
        }
        setShowResults(!!searchQuery.trim());
        console.log('검색어:', searchQuery);

    };

    const handleClearRecentSearches = () => {
        setRecentSearches([]);
    };

    const handleRecentSearchPress = (search: string) => {
        setSearchQuery(search);
        setShowResults(true);
        handleSearchSubmit();
    };

    const handleDeleteRecentSearch = (search: string) => {
        setRecentSearches(recentSearches.filter((item) => item !== search));
    };

    const handleSearchInputChange = (text: string) => {
        setSearchQuery(text);
        setShowResults(!!text.trim());
    };

    const handleSuggestionPress = (title: string) => {
        setSearchQuery(title);
        setShowResults(true);
        handleSearchSubmit();
    };


    const filteredResults = searchQuery.trim()
        ? fuse.search(searchQuery.trim()).map((result) => result.item)
        : mockResults;

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
                        autoFocus={true}
                        placeholderTextColor="#c7c7c7"
                        returnKeyType="search"
                        onSubmitEditing={handleSearchSubmit}
                    />
                    <Pressable onPress={handleSearchSubmit}>
                        <Fontisto name="search" size={18} color="#525252" />
                    </Pressable>
                </View>
            </View>

            <View className="flex-1 mt-6">
                {!showResults && (
                    <View>
                        <View className="flex-row justify-between items-center px-6">
                            <Text className="text-lg font-bold text-neutral-800">최근 검색</Text>
                            <Pressable onPress={handleClearRecentSearches}>
                                <Text className="text-sm text-neutral-500">전체 삭제</Text>
                            </Pressable>
                        </View>
                        {recentSearches.length > 0 ? (
                            <FlatList
                                data={recentSearches}
                                renderItem={renderRecentSearch}
                                keyExtractor={(item, index) => index.toString()}
                                scrollEnabled={false}
                            />
                        ) : (
                            null
                        )}
                    </View>
                )}

                {showResults && (
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
                )}
            </View>
        </SafeAreaView>
    );
}