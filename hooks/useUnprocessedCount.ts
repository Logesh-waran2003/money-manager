import { getDb } from "@/services/db";
import * as SmsReader from "sms-reader";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

export const useUnprocessedCount = (refreshTrigger?: number) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadCount();
  }, [refreshTrigger]);

  const loadCount = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setCount(0);
          return;
        }
      }

      const db = await getDb();
      const smsList = await SmsReader.getSms(1000);

      const processedResult = await db.getAllAsync<{ mobile_id?: string }>(
        "SELECT mobile_id FROM transactions"
      );
      const processedIds = new Set(
        processedResult.map((row) => row.mobile_id).filter((id): id is string => !!id)
      );

      const ignoredResult = await db.getAllAsync<{ sms_id?: string }>(
        "SELECT sms_id FROM ignored_sms"
      );
      const ignoredIds = new Set(
        ignoredResult.map((row) => row.sms_id).filter((id): id is string => !!id)
      );

      const unprocessed = smsList.filter((sms: any) => {
        const id = String(sms.id);
        const isTransactional = /(?:Rs\.?|INR|₹|debited|credited|spent|paid)/i.test(sms.body);
        return isTransactional && !processedIds.has(id) && !ignoredIds.has(id);
      });

      setCount(unprocessed.length);
    } catch (error) {
      console.error("Failed to load unprocessed count:", error);
      setCount(0);
    }
  };

  return { count, refresh: loadCount };
};
