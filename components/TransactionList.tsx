import { useState } from "react";
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

import * as Haptics from "expo-haptics";

// Mock Data
const MOCK_TRANSACTIONS = Array.from({ length: 20 }).map((_, i) => ({
  id: i.toString(),
  merchant: i % 2 === 0 ? "Uber" : "Starbucks",
  amount: `$${(Math.random() * 100).toFixed(2)}`,
  date: "Today, 10:23 AM",
  category: i % 2 === 0 ? "Transport" : "Food",
  type: i % 5 === 0 ? "credit" : ("debit" as "credit" | "debit"),
}));

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
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(index * 100, withSpring(0, { damping: 12 }));
  });

  // Scroll Animation (Scale/Dim based on scroll position)
  const animatedStyle = useAnimatedStyle(() => {
    const itemSize = 80; // Approx height + margin
    const offset = index * itemSize;

    // Calculate how far the item is from the top of the scroll view
    const inputRange = [-1, 0, itemSize * index, itemSize * (index + 2)];

    const scale = interpolate(
      scrollY.value,
      [offset - 100, offset, offset + 100],
      [1, 1, 0.9], // Scale down as it goes up
      Extrapolation.CLAMP
    );

    const itemOpacity = interpolate(
      scrollY.value,
      [offset - 100, offset, offset + 100],
      [1, 1, 0.5], // Fade out as it goes up
      Extrapolation.CLAMP
    );

    return {
      opacity: opacity.value * itemOpacity,
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
      if (current < -50 && (previous ?? 0) >= -50) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  );

  const listData = data || MOCK_TRANSACTIONS;

  return (
    <Animated.FlatList
      data={listData}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <AnimatedItem item={item} index={index} scrollY={scrollY} />
      )}
      contentContainerStyle={{ padding: 20, paddingBottom: 200 }}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
    />
  );
}
