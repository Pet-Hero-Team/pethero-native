
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          borderTopColor: "#ffffff",
          height: 75,
          paddingTop: 8,
          shadowColor: "#686868",
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.09,
          shadowRadius: 5,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(maps)"
        options={{
          tabBarIcon: () => (
            <>
              <FontAwesome5 name="map-marker-alt" size={21} color="#262626" />
              <Text className="text-neutral-800 mt-1 text-xs">지도</Text>
            </>
          ),
        }}
      />
    </Tabs>
  );
}