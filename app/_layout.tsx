import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UnprocessedProvider } from "@/contexts/UnprocessedContext";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen;
        if (screen === "inbox") {
          router.push("/inbox");
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UnprocessedProvider>
        <View
          className="flex-1 bg-zinc-950"
          style={{ flex: 1, backgroundColor: "#09090B" }}
        >
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="account-details" />
          </Stack>
        </View>
      </UnprocessedProvider>
    </GestureHandlerRootView>
  );
}
