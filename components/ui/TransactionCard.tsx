import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface TransactionCardProps {
  merchant: string;
  amount: string;
  date: string;
  category: string;
  type: "debit" | "credit";
  isNew?: boolean;
}

export function TransactionCard({
  merchant,
  amount,
  date,
  category,
  type,
  isNew,
}: TransactionCardProps) {
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isNew) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isNew]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View className="w-full mb-4 p-4 rounded-2xl bg-zinc-900 border border-white/5 shadow-lg shadow-black/50 overflow-hidden">
      {isNew && (
        <Animated.View
          className="absolute inset-0 bg-neon-primary/10"
          style={glowStyle}
        />
      )}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          {/* Category Icon Placeholder - Neon Glow */}
          <View className="w-10 h-10 rounded-full bg-zinc-800 items-center justify-center border border-white/5 shadow-sm shadow-neon-primary/20">
            <Ionicons name="cart-outline" size={20} color="#00FF94" />
          </View>

          <View>
            <Text className="text-white font-bold text-base tracking-tight">
              {merchant}
            </Text>
            <Text className="text-zinc-500 text-xs">
              {date} • {category}
            </Text>
          </View>
        </View>

        <View>
          <Text
            className={`font-bold text-lg tracking-tighter ${
              type === "credit" ? "text-neon-primary" : "text-white"
            }`}
          >
            {type === "debit" ? "-" : "+"}
            {amount}
          </Text>
        </View>
      </View>
    </View>
  );
}
