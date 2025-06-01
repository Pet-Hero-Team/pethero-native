
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
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
          paddingTop: 10,
          shadowColor: "#939393",
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.09,
          shadowRadius: 5,
          elevation: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarIcon: () => (
            <>
              <FontAwesome name="home" size={24} color="black" />
              <Text className="text-neutral-800 mt-2 text-xs">홈</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="(maps)"
        options={{
          tabBarIcon: () => (
            <>
              <FontAwesome5 name="map-marker-alt" size={21} color="#262626" />
              <Text className="text-neutral-800 mt-2 text-xs">지도</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="(chats)"
        options={{
          tabBarIcon: () => (
            <>
              <Ionicons name="chatbox-ellipses" size={21} color="#262626" />
              <Text className="text-neutral-800 mt-2 text-xs">채팅</Text>
            </>
          ),
        }}
      />

    </Tabs>
  );
}