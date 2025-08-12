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
    const closeThreshold = 100;


    useEffect(() => {
        if (!isVisible) {
            const timer = setTimeout(() => {
                animatedTranslateY.value = 0;
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, animatedTranslateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {

            if (event.translationY > 0) {
                animatedTranslateY.value = event.translationY;
            }

            else {

                animatedTranslateY.value = event.translationY / 6;
            }
        })
        .onEnd((event) => {

            if (event.translationY > closeThreshold) {
                runOnJS(onClose)();
            } else {

                animatedTranslateY.value = withSpring(0, {
                    damping: 15,
                    stiffness: 120,
                    restDisplacementThreshold: 0.1,
                    restSpeedThreshold: 0.1,
                });
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
});