import { Stack } from 'expo-router/stack';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="signin" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="vet-signup" />
            <Stack.Screen name="vet-signin" />
            <Stack.Screen name="auth-info" />
            <Stack.Screen name="vet-info" />
            <Stack.Screen name="vet-info-custom" />
        </Stack>
    );
}