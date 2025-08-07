import { Stack } from 'expo-router/stack';

export default function HomeLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="rescues" />
            <Stack.Screen name="my-pet" />
            <Stack.Screen name="donation" />
            <Stack.Screen name="events" />
        </Stack>
    );
}