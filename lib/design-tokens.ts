/**
 * Design Tokens for Money Manager
 * 
 * This file contains all the design tokens used throughout the application.
 * Using a centralized token system ensures consistency across the UI.
 */

export const tokens = {
  // Color Palette based on design-system.md
  colors: {
    // Primary Colors
    primary: {
      DEFAULT: '#0070F3', // Blue - Main brand color
      light: '#3291FF',
      dark: '#0058CC',
      contrast: '#FFFFFF',
    },
    secondary: {
      DEFAULT: '#6B46C1', // Purple - Secondary brand color
      light: '#8B5CF6',
      dark: '#5B34A4',
      contrast: '#FFFFFF',
    },

    // Semantic Colors
    success: {
      DEFAULT: '#10B981', // Green - Income, positive balances
      light: '#34D399',
      dark: '#059669',
      contrast: '#FFFFFF',
    },
    error: {
      DEFAULT: '#EF4444', // Red - Expenses, negative balances
      light: '#F87171',
      dark: '#DC2626',
      contrast: '#FFFFFF',
    },
    warning: {
      DEFAULT: '#F59E0B', // Amber - Warnings, pending states
      light: '#FBBF24',
      dark: '#D97706',
      contrast: '#000000',
    },
    info: {
      DEFAULT: '#3B82F6', // Blue - Transfers, information
      light: '#60A5FA',
      dark: '#2563EB',
      contrast: '#FFFFFF',
    },
    credit: {
      DEFAULT: '#8B5CF6', // Purple - Credit-related items
      light: '#A78BFA',
      dark: '#7C3AED',
      contrast: '#FFFFFF',
    },
    recurring: {
      DEFAULT: '#F97316', // Orange - Recurring payments
      light: '#FB923C',
      dark: '#EA580C',
      contrast: '#FFFFFF',
    },

    // Neutral Colors - Light Mode
    background: {
      DEFAULT: '#FFFFFF',
      card: '#F9FAFB',
      subtle: '#F3F4F6',
    },
    border: {
      DEFAULT: '#E5E7EB',
      strong: '#D1D5DB',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
    },

    // Neutral Colors - Dark Mode
    backgroundDark: {
      DEFAULT: '#111827',
      card: '#1F2937',
      subtle: '#374151',
    },
    borderDark: {
      DEFAULT: '#374151',
      strong: '#4B5563',
    },
    textDark: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
    fontSize: {
      display: '2.25rem', // 36px
      h1: '1.875rem',     // 30px
      h2: '1.5rem',       // 24px
      h3: '1.25rem',      // 20px
      body: '1rem',       // 16px
      small: '0.875rem',  // 14px
      xsmall: '0.75rem',  // 12px
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Spacing System
  spacing: {
    '0': '0',
    '0.5': '0.125rem', // 2px
    '1': '0.25rem',    // 4px
    '2': '0.5rem',     // 8px
    '3': '0.75rem',    // 12px
    '4': '1rem',       // 16px
    '5': '1.25rem',    // 20px
    '6': '1.5rem',     // 24px
    '8': '2rem',       // 32px
    '10': '2.5rem',    // 40px
    '12': '3rem',      // 48px
    '16': '4rem',      // 64px
    '20': '5rem',      // 80px
    '24': '6rem',      // 96px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    '3xl': '1.5rem',   // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Transitions
  transitions: {
    DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Z-index
  zIndex: {
    '0': '0',
    '10': '10',
    '20': '20',
    '30': '30',
    '40': '40',
    '50': '50',
    'auto': 'auto',
  },
};

export default tokens;
