import { cn } from '@/utils/tailwind';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';

type ShadowViewProps = ViewProps & {
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
    elevation?: number;
};

export const ShadowViewLight = ({
    children,
    className,
    shadowColor = '#f2f2f2',
    shadowOffset = { width: 0, height: 3 },
    shadowOpacity = 0.27,
    shadowRadius = 4.65,
    elevation = 6,
    ...props
}: ShadowViewProps) => {
    return (
        <View
            className={cn(className)}
            style={[
                Platform.select({
                    ios: styles.iosShadow,
                    android: styles.androidShadow,
                }),
                {
                    shadowColor,
                    shadowOffset,
                    shadowOpacity,
                    shadowRadius,
                    elevation,
                },
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    iosShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
    },
    androidShadow: {
        elevation: 6,
    },
});
