import { requireNativeModule } from "expo-modules-core";

const SmsReader = requireNativeModule("SmsReader");

export interface Sms {
  id: string;
  address: string;
  date: string;
  body: string;
}

export function getSms(limit: number = 20): Sms[] {
  return SmsReader.getSms(limit);
}
