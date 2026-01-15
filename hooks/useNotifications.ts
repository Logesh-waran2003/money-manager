import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  getNotificationSettings,
  initNotificationSettings,
  requestNotificationPermissions,
  scheduleNotification,
} from "@/services/notifications";

export const useNotifications = (unprocessedCount: number) => {
  const [hasPermission, setHasPermission] = useState(false);
  const notificationSent = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    init();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        notificationSent.current = false;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (hasPermission && !notificationSent.current) {
      checkAndNotify();
    }
  }, [unprocessedCount, hasPermission]);

  const init = async () => {
    await initNotificationSettings();
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
  };

  const checkAndNotify = async () => {
    const settings = await getNotificationSettings();

    if (settings.notifyNewTransactions && unprocessedCount > 0) {
      await scheduleNotification(
        "New Transactions Detected",
        `${unprocessedCount} message${unprocessedCount > 1 ? "s" : ""} need verification`,
        { screen: "inbox" }
      );
      notificationSent.current = true;
    }

    if (settings.notifyPendingVerification && unprocessedCount >= 10) {
      await scheduleNotification(
        "Pending Verification",
        `${unprocessedCount} messages need verification`,
        { screen: "inbox" }
      );
      notificationSent.current = true;
    }
  };

  return { hasPermission };
};
