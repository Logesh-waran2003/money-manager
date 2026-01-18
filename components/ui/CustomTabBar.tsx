import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {/* 
        BlurView provides the "Glass" effect. 
        Note: On Android, 'regular' or 'light' blur can be resource intensive or look different.
        We use a fallback background for consistency if needed, but try Blur first.
      */}
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabRow}>
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
                // Haptic feedback for "Tactile" feel
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            const getIconName = () => {
              // Custom icon mapping based on route names
              if (route.name === "index")
                return isFocused ? "home" : "home-outline";
              if (route.name === "analytics")
                return isFocused ? "pie-chart" : "pie-chart-outline";
              if (route.name === "settings")
                return isFocused ? "settings" : "settings-outline";
              return "square";
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={(options as any).tabBarTestID}
                onPress={onPress}
                style={styles.tabItem}
              >
                <View
                  style={[styles.iconContainer, isFocused && styles.iconActive]}
                >
                  <Ionicons
                    name={getIconName() as any}
                    size={24}
                    color={
                      isFocused
                        ? Theme.colors.primary
                        : Theme.colors.textTertiary
                    }
                  />
                </View>
                {/* Optional: Add a small dot for the active indicator instead of changing icon color entirely? 
                    For now, keeping it minimal with just color/icon change. 
                */}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    alignItems: "center",
  },
  blurContainer: {
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)", // Very subtle glass border
    backgroundColor: "rgba(9, 9, 11, 0.7)", // Fallback tint (zinc-950 alpha)
  },
  tabRow: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    minWidth: 200, // ensure it has some width
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle highlight behind active icon
  },
});
