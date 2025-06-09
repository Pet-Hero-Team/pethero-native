import { Stack } from 'expo-router/stack';

export default function ChatLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="group-chat" />
            <Stack.Screen name="personal-chat" />
        </Stack>
    );
}