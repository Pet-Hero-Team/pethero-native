
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          paddingTop: 10,
          zIndex: 1000,

        },
      }}
    >
      <Tabs.Screen
        name="(maps)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <>
              <Feather name="map-pin" size={size} color={color} />
              <Text className="text-gray-600 mt-1">지도</Text>
            </>
          ),
        }}
      />
    </Tabs>
  );
}