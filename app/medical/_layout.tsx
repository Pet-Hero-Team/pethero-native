import { Stack } from 'expo-router/stack';

export default function MedicalLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="questions/questions" />
            <Stack.Screen name="questions/[id]" />
            <Stack.Screen name="news/news" />
            <Stack.Screen name="news/[id]" />
        </Stack>
    );
}