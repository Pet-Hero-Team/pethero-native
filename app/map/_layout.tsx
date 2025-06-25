import { Stack } from 'expo-router/stack';

export default function MapLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="reports/[id]" />
            <Stack.Screen name="rescues/[id]" />
        </Stack>
    );
}