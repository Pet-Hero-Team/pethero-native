import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, }}>
      <Tabs.Screen name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Feather name="map-pin" size={24} color="black" />,
        }}
      />

    </Tabs>
  );
}
