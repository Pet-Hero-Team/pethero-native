import { View } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

const RelatedQuestionSkeleton = () => {
    return (
        <SkeletonPlaceholder
            highlightColor="#f3f4f6"
            speed={1000}
        >
            <View style={{ width: '100%', paddingVertical: 32, paddingHorizontal: 24, }}>
                <View style={{ width: '100%', height: 20, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ width: '100%', height: 16, borderRadius: 4, marginBottom: 4 }} />
                <View style={{ width: '80%', height: 16, borderRadius: 4, marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ width: 100, height: 20, borderRadius: 8 }} />
                    <View style={{ width: 50, height: 12, borderRadius: 4 }} />
                </View>
            </View>
        </SkeletonPlaceholder>
    );
};

const AnswerSkeleton = () => {
    return (
        <SkeletonPlaceholder
            highlightColor="#f3f4f6"
            speed={1000}
        >
            <View style={{ paddingHorizontal: 24, paddingBottom: 32, }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ width: 100, height: 16, borderRadius: 4, marginRight: 8 }} />
                            <View style={{ width: 12, height: 12, borderRadius: 6 }} />
                        </View>
                        <View style={{ width: 50, height: 12, borderRadius: 4 }} />
                    </View>
                </View>
                <View>
                    <View style={{ width: '100%', height: 18, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ width: '100%', height: 18, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ width: '80%', height: 18, borderRadius: 4 }} />
                </View>
            </View>
        </SkeletonPlaceholder>
    );
};

const QuestionDetailSkeleton = () => {
    return (
        <SkeletonPlaceholder
            highlightColor="#f3f4f6"
            speed={1000}
        >
            <View style={{ paddingHorizontal: 24, paddingVertical: 32, backgroundColor: '#fff' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' }} />
                    <View style={{ flex: 1 }}>
                        <View style={{ width: '60%', height: 18, borderRadius: 4, marginBottom: 8 }} />
                        <View style={{ width: '40%', height: 12, borderRadius: 4 }} />
                    </View>
                </View>
                <View style={{ marginBottom: 16 }}>
                    <View style={{ width: '80%', height: 20, borderRadius: 4, marginBottom: 8 }} />
                    <View style={{ width: '100%', height: 18, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ width: '100%', height: 18, borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ width: '80%', height: 18, borderRadius: 4 }} />
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, gap: 18 }}>
                    <View style={{ width: '47%', height: 160, borderRadius: 12, padding: 4 }} />
                    <View style={{ width: '47%', height: 160, borderRadius: 12, padding: 4 }} />
                </View>
                <View style={{ flexDirection: 'row', paddingTop: 4 }}>
                    <View style={{ width: 100, height: 20, borderRadius: 8, marginRight: 8 }} />
                    <View style={{ width: 100, height: 20, borderRadius: 8 }} />
                </View>
            </View>
        </SkeletonPlaceholder>
    );
};

export { AnswerSkeleton, QuestionDetailSkeleton, RelatedQuestionSkeleton };

