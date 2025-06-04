import Fontisto from '@expo/vector-icons/Fontisto';
import { ListRenderItemInfo, Pressable, Text, View } from 'react-native';


interface SearchItem {
    id: string;
    title: string;
}


type RecommendationListProps = {
    searchQuery: string;
    onSuggestionPress: (title: string) => void;
};


const RecommendationList = ({ searchQuery, onSuggestionPress }: RecommendationListProps) => {

    const renderItem = ({ item }: ListRenderItemInfo<SearchItem>) => {
        const query = searchQuery.trim().toLowerCase();
        const title = item.title;
        const titleWords = title.toLowerCase().split(' ');
        const queryWords = query.split(' ');
        let resultText = title;
        let styledText: JSX.Element[] = [];


        titleWords.forEach((word, index) => {
            const isMatch = queryWords.some((qWord) => word.startsWith(qWord));
            if (isMatch && queryWords.length > 0) {
                const startIndex = title.indexOf(word, index === 0 ? 0 : titleWords.slice(0, index).join(' ').length);
                const match = title.slice(startIndex, startIndex + word.length);
                styledText.push(
                    <Text key={startIndex} className="text-orange-500">
                        {match}
                    </Text>
                );
                if (startIndex + word.length < title.length) {
                    styledText.push(
                        <Text key={startIndex + word.length} className="text-neutral-700">
                            {title.slice(startIndex + word.length, titleWords[index + 1] ? title.indexOf(titleWords[index + 1]) : undefined)}
                        </Text>
                    );
                }
            } else if (index === 0 || styledText.length > 0) {
                const prevEnd = styledText.length > 0 ? styledText[styledText.length - 1].props.children.length + (styledText[styledText.length - 1].key as number) : 0;
                styledText.push(
                    <Text key={prevEnd} className="text-neutral-700">
                        {word + (index < titleWords.length - 1 ? ' ' : '')}
                    </Text>
                );
            }
        });


        if (styledText.length === 0) {
            styledText = [<Text key={0} className="text-neutral-700">{title}</Text>];
        }

        return (
            <Pressable onPress={() => onSuggestionPress(item.title)}>
                <View className="flex-row items-center py-3 px-6">
                    <Fontisto name="search" size={16} color="#525252" />
                    <Text className="ml-3 text-base">{styledText}</Text>
                </View>
            </Pressable>
        );
    };

    return renderItem;
};


RecommendationList.displayName = 'RecommendationList';

export default RecommendationList;