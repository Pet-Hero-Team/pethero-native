import { Stack } from 'expo-router/stack';

export default function MapsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="search" />
        </Stack>
    );
}