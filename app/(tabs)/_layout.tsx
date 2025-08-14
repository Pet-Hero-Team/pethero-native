import { FontAwesome6 } from '@expo/vector-icons';
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
          borderTopColor: '#ffffff',
          height: 75,
          paddingTop: 10,
          shadowColor: '#939393',
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
          tabBarIcon: ({ focused }) => (
            <>
              <FontAwesome name="home" size={24} color={focused ? '#404040' : '#a3a3a3'} />
              <Text className={`mt-2 text-xs ${focused ? 'text-neutral-700' : 'text-neutral-400'}`}>홈</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="(medical)"
        options={{
          tabBarIcon: ({ focused }) => (
            <>
              <FontAwesome6 name="briefcase-medical" size={20} color={focused ? '#404040' : '#a3a3a3'} />
              <Text className={`mt-2 text-xs ${focused ? 'text-neutral-700' : 'text-neutral-400'}`}>의료</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="(maps)"
        options={{
          tabBarIcon: ({ focused }) => (
            <>
              <FontAwesome5 name="map-marker-alt" size={21} color={focused ? '#404040' : '#a3a3a3'} />
              <Text className={`mt-2 text-xs ${focused ? 'text-neutral-700' : 'text-neutral-400'}`}>지도</Text>
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="(chats)"
        options={{
          tabBarIcon: ({ focused }) => (
            <>
              <Ionicons name="chatbox-ellipses" size={21} color={focused ? '#404040' : '#a3a3a3'} />
              <Text className={`mt-2 text-xs ${focused ? 'text-neutral-700' : 'text-neutral-400'}`}>채팅</Text>
            </>
          ),
        }}
      />
    </Tabs>
  );
}