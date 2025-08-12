
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface ModalContainerProps {
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function ModalContainer({ isVisible, onClose, children }: ModalContainerProps) {
    const animatedTranslateY = useSharedValue(0);

    // 모달이 닫힐 때 애니메이션 값 초기화
    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                animatedTranslateY.value = 0;
            }, 300); // animationOutTiming과 동일하게 설정
            return () => clearTimeout(timer);
        }
    }, [isVisible, animatedTranslateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // 아래로 드래그할 때만 반응
            if (event.translationY > 0) {
                animatedTranslateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            const closeThreshold = 100;
            if (event.translationY > closeThreshold) {
                runOnJS(onClose)();
            } else {
                // 원래 위치로 복귀
                animatedTranslateY.value = withSpring(0, { damping: 15, stiffness: 120 });
            }
        });

    const animatedModalContentStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: animatedTranslateY.value }],
        };
    });

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            style={styles.modal}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={300}
            animationOutTiming={300}
            backdropOpacity={0.5}
        >
            <Animated.View className={"bg-white rounded-3xl overflow-hidden"} style={[animatedModalContentStyle]}>
                <GestureDetector gesture={panGesture}>
                    <View className="items-center py-4">
                        <View className="w-10 h-1 bg-gray-300 rounded-full" />
                    </View>
                </GestureDetector>
                {children}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        marginHorizontal: 24,
        marginBottom: 30,
    },
    contentContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        overflow: 'hidden',
    },
});
