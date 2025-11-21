import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View className="absolute bottom-8 left-4 right-4 h-20 rounded-3xl overflow-hidden bg-zinc-900/90 border border-white/10 shadow-2xl shadow-black">
      {/* Glassmorphism Background - simplified for stability, can add BlurView if needed */}
      <View className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl" />

      <View className="flex-row items-center justify-between h-full px-2">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name, route.params);
            }
          };

          // Icon mapping based on route name
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "index") iconName = "home";
          else if (route.name === "analytics") iconName = "bar-chart";
          else if (route.name === "settings") iconName = "settings";

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              className="flex-1 items-center justify-center h-full"
            >
              <Animated.View
                className={`items-center justify-center w-12 h-12 rounded-full ${
                  isFocused ? "bg-zinc-800" : ""
                }`}
                style={
                  isFocused
                    ? {
                        shadowColor: "#00FF94",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 10,
                        elevation: 5,
                      }
                    : {}
                }
              >
                <Ionicons
                  name={isFocused ? iconName : (`${iconName}-outline` as any)}
                  size={24}
                  color={isFocused ? "#00FF94" : "#71717a"}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
