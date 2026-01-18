/**
 * Money Manager - Premium Business Design System
 *
 * Philosophy: "Invisible Design" - Content first, high contrast, tactile.
 * Dark Mode Strategy: True Black (#000000) for OLED efficiency and depth.
 */

import { Platform } from "react-native";

const Palette = {
  // Monochrome (Slate / Zinc scale)
  black: "#000000",
  zinc950: "#09090B", // Secondary Background
  zinc900: "#18181B", // Card Surface
  zinc800: "#27272A", // Borders
  zinc700: "#3F3F46", // Icon Inactive
  zinc500: "#71717A", // Secondary Text
  zinc400: "#A1A1AA", // Placeholders
  zinc300: "#D4D4D8",
  zinc100: "#F4F4F5", // Primary Text (Dark Mode)
  white: "#FFFFFF",

  // Accents (Business Professional)
  blue600: "#2563EB", // Action Blue
  emerald500: "#10B981", // Success / Income
  rose500: "#F43F5E", // Error / Expense
  amber500: "#F59E0B", // Warning
  violet500: "#8B5CF6", // Brand Accent (Subtle)
};

export const Theme = {
  colors: {
    // Backgrounds
    background: Palette.black,
    backgroundSecondary: Palette.zinc950,
    surface: Palette.zinc900,
    surfaceHighlight: Palette.zinc800,

    // Text
    textPrimary: Palette.white,
    textSecondary: Palette.zinc400, // Improved contrast (was zinc500)
    textTertiary: Palette.zinc500, // Improved contrast (was zinc700)
    textInverse: Palette.black,

    // Borders & Dividers
    border: Palette.zinc800,
    borderSubtle: Palette.zinc900,

    // Interactive
    primary: Palette.white, // High contrast actions
    primaryForeground: Palette.black,
    accent: Palette.violet500,

    // Status
    success: Palette.emerald500,
    error: Palette.rose500,
    warning: Palette.amber500,
    info: Palette.blue600,

    // Overlays
    overlay: "rgba(0, 0, 0, 0.7)",
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    fontFamily: {
      sans: "Inter_400Regular",
      medium: "Inter_500Medium",
      semibold: "Inter_600SemiBold",
      bold: "Inter_700Bold",
      mono: Platform.select({
        ios: "Menlo",
        android: "monospace",
        default: "monospace",
      }),
    },
    sizes: {
      xs: 12,
      sm: 13,
      base: 15,
      lg: 18,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    },
  },
};

// Backwards compatibility for existing code (temporary)
export const Colors = {
  light: {
    text: Palette.black,
    background: Palette.white,
    tint: Palette.blue600,
    icon: Palette.zinc700,
    tabIconDefault: Palette.zinc400,
    tabIconSelected: Palette.blue600,
  },
  dark: {
    text: Palette.white,
    background: Palette.black,
    tint: Palette.white,
    icon: Palette.zinc500,
    tabIconDefault: Palette.zinc700,
    tabIconSelected: Palette.white,
  },
};
