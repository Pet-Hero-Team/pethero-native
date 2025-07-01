import { isExpoNotificationStreamVideoEvent, oniOSExpoNotificationEvent } from "@stream-io/video-react-native-sdk";
import * as Notifications from "expo-notifications";
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthProvider from '../providers/AuthProvider';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "ios") {
      const subscription = Notifications.addNotificationReceivedListener(
        (notification) => {
          if (isExpoNotificationStreamVideoEvent(notification)) {
            oniOSExpoNotificationEvent(notification);
          } else {
            // your other notifications (if any)
          }
        },
      );
      return () => {
        subscription.remove();
      };
    }
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
