import { Stack } from 'expo-router/stack';

export default function ShoppingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}