import { Stack } from 'expo-router/stack';

export default function MedicalLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}