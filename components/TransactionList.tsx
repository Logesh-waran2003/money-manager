import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TransactionCard } from "./ui/TransactionCard";

const AnimatedItem = ({
  item,
  index,
  scrollY,
}: {
  item: any;
  index: number;
  scrollY: SharedValue<number>;
}) => {
  // Entry Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  // Trigger entry animation on mount
  useState(() => {
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 400 })); // Faster stagger
    translateY.value = withDelay(
      index * 50,
      withSpring(0, { damping: 20, stiffness: 90 }), // Less bounce
    );
  });

  // Scroll Animation (Scale/Dim based on scroll position - specialized for premium feel)
  const animatedStyle = useAnimatedStyle(() => {
    const itemSize = 80; // Approx height + margin
    const offset = index * itemSize;

    const scale = interpolate(
      scrollY.value,
      [offset - 100, offset, offset + 100],
      [1, 1, 0.98], // Very subtle scale effect
      Extrapolation.CLAMP,
    );

    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TransactionCard {...item} />
    </Animated.View>
  );
};

export function TransactionList({ data }: { data?: any[] }) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useAnimatedReaction(
    () => scrollY.value,
    (current, previous) => {
      // Light haptic on overscroll top
      if (current < -80 && (previous ?? 0) >= -80) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    },
  );

  const listData = data || [];

  return (
    <Animated.FlatList
      data={listData}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <AnimatedItem item={item} index={index} scrollY={scrollY} />
      )}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 100,
        paddingTop: 10,
        flexGrow: 1,
      }}
      ListEmptyComponent={
        <Animated.View
          style={{
            marginTop: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center", gap: 12, paddingVertical: 20 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Theme.colors.surfaceHighlight,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 4,
              }}
            >
              <Ionicons
                name="receipt-outline"
                size={24}
                color={Theme.colors.textSecondary}
              />
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: Theme.colors.textSecondary,
                  fontSize: Theme.typography.sizes.base,
                  fontFamily: Theme.typography.fontFamily.medium,
                }}
              >
                No transactions yet
              </Text>
              <Text
                style={{
                  color: Theme.colors.textTertiary,
                  fontSize: Theme.typography.sizes.sm,
                  marginTop: 4,
                }}
              >
                Start spending to see activity
              </Text>
            </View>
          </View>
        </Animated.View>
      }
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}
