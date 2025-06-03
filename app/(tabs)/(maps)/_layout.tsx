import { Stack } from 'expo-router';

export default function MapsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="search" />
            <Stack.Screen name="search-results" />
        </Stack>
    );
}