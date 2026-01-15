import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getDb } from "./db";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00FF94",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

export const scheduleNotification = async (
  title: string,
  body: string,
  data?: any
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
};

export const getNotificationSettings = async () => {
  const db = await getDb();
  const result = await db.getFirstAsync<{
    notify_new_transactions: number;
    notify_pending_verification: number;
    notify_weekly_summary: number;
  }>("SELECT * FROM settings WHERE id = 1");

  return {
    notifyNewTransactions: result?.notify_new_transactions === 1,
    notifyPendingVerification: result?.notify_pending_verification === 1,
    notifyWeeklySummary: result?.notify_weekly_summary === 1,
  };
};

export const updateNotificationSettings = async (
  key: string,
  value: boolean
) => {
  const db = await getDb();
  await db.runAsync(
    `UPDATE settings SET ${key} = ? WHERE id = 1`,
    [value ? 1 : 0]
  );
};

export const initNotificationSettings = async () => {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      notify_new_transactions INTEGER DEFAULT 1,
      notify_pending_verification INTEGER DEFAULT 1,
      notify_weekly_summary INTEGER DEFAULT 0
    );
    INSERT OR IGNORE INTO settings (id) VALUES (1);
  `);
};
