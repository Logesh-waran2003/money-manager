# Money Manager Design System

## Overview
This design system provides guidelines for creating consistent, accessible, and visually appealing interfaces across both web and mobile platforms for the Money Manager application.

## Brand Identity

### Logo
- Simple, recognizable icon representing financial management
- Consistent usage across platforms
- Scalable for different sizes (favicon to splash screen)

### Color Palette

#### Primary Colors
- **Primary**: `#0070F3` (Blue) - Main brand color, used for primary actions and navigation
- **Secondary**: `#6B46C1` (Purple) - Used for secondary actions and highlights

#### Semantic Colors
- **Success/Income**: `#10B981` (Green) - For positive balances, income, successful actions
- **Error/Expense**: `#EF4444` (Red) - For negative balances, expenses, errors
- **Warning**: `#F59E0B` (Amber) - For warnings, pending states
- **Info/Transfer**: `#3B82F6` (Blue) - For transfers, information
- **Credit/Loan**: `#8B5CF6` (Purple) - For credit-related items
- **Recurring**: `#F97316` (Orange) - For recurring payments

#### Neutral Colors
- **Background**: `#FFFFFF` (White) - Main background
- **Card Background**: `#F9FAFB` (Light Gray) - Card and elevated elements
- **Border**: `#E5E7EB` (Light Gray) - Borders and dividers
- **Text Primary**: `#111827` (Near Black) - Primary text
- **Text Secondary**: `#6B7280` (Gray) - Secondary text
- **Text Tertiary**: `#9CA3AF` (Light Gray) - Placeholder text

#### Dark Mode Colors
- **Background Dark**: `#111827` (Dark Gray)
- **Card Background Dark**: `#1F2937` (Dark Gray)
- **Border Dark**: `#374151` (Gray)
- **Text Primary Dark**: `#F9FAFB` (Off White)
- **Text Secondary Dark**: `#D1D5DB` (Light Gray)
- **Text Tertiary Dark**: `#9CA3AF` (Gray)

### Typography

#### Font Family
- **Primary Font**: Inter (Web), SF Pro (iOS), Roboto (Android)
- **Monospace**: SF Mono (for numbers, especially financial figures)

#### Font Sizes
- **Display**: 36px/2.25rem (large headings)
- **H1**: 30px/1.875rem (page titles)
- **H2**: 24px/1.5rem (section headings)
- **H3**: 20px/1.25rem (card titles)
- **Body**: 16px/1rem (regular text)
- **Small**: 14px/0.875rem (secondary text)
- **XSmall**: 12px/0.75rem (captions, labels)

#### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Spacing System
- **4px/0.25rem**: Minimum spacing
- **8px/0.5rem**: Tight spacing (between related items)
- **12px/0.75rem**: Default spacing
- **16px/1rem**: Standard spacing (between unrelated items)
- **24px/1.5rem**: Large spacing (between sections)
- **32px/2rem**: Extra large spacing (page margins)
- **48px/3rem**: Huge spacing (between major sections)

## Components

### Core Components

#### Buttons
- **Primary**: Filled with primary color, high emphasis
- **Secondary**: Outlined with primary color, medium emphasis
- **Tertiary**: Text only, low emphasis
- **Danger**: Filled with error color for destructive actions
- **Icon**: Circle or square with icon only
- **Sizes**: Small (32px), Medium (40px), Large (48px)

#### Form Elements
- **Text Input**: With clear formatting for currency
- **Select/Dropdown**: With search for long lists
- **Date Picker**: Calendar-based with quick selections
- **Toggle/Switch**: For binary options
- **Radio Group**: For single selection from visible options
- **Checkbox**: For multiple selections
- **Slider**: For range selection

#### Cards
- **Standard Card**: For content grouping
- **Account Card**: For displaying account information
- **Transaction Card**: For displaying transaction information
- **Summary Card**: For displaying summary information

#### Navigation
- **Sidebar** (Web): Collapsible, with sections
- **Bottom Navigation** (Mobile): 4-5 main sections
- **Tabs**: For switching between related content
- **Breadcrumbs** (Web): For deep navigation paths

#### Feedback
- **Toast Notifications**: For confirmations and alerts
- **Loading States**: Skeleton screens and spinners
- **Empty States**: Helpful messaging when no data
- **Error States**: Clear error messaging with recovery actions

### Domain-Specific Components

#### Financial Components
- **Balance Display**: Clearly shows positive/negative with color
- **Transaction List Item**: Shows key transaction info at a glance
- **Currency Input**: Specialized for money entry
- **Account Selector**: Quick selection between accounts
- **Category Selector**: Visual selection of transaction categories
- **Payment Method Selector**: Selection of payment methods

#### Data Visualization
- **Line Chart**: For balance history, trends
- **Bar Chart**: For monthly comparisons
- **Pie/Donut Chart**: For category breakdowns
- **Progress Indicator**: For budget tracking, credit repayment

## Interaction Patterns

### Web Interactions
- **Hover States**: Subtle indication of interactive elements
- **Focus States**: Clear indication for keyboard navigation
- **Active States**: Feedback when elements are activated
- **Loading States**: Indication of processing
- **Transitions**: Smooth transitions between states (200-300ms)

### Mobile Interactions
- **Touch Targets**: Minimum 44×44 points
- **Gestures**: Swipe, pinch, tap, long press
- **Haptic Feedback**: Subtle vibration for confirmations
- **Pull-to-Refresh**: For data updates
- **Bottom Sheets**: For selection menus and details

## Accessibility Guidelines

### Color Contrast
- Text meets WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
- Interactive elements have sufficient contrast
- Don't rely on color alone to convey information

### Screen Readers
- All interactive elements have appropriate ARIA labels
- Images have alt text
- Form elements have proper labels

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus order is logical
- Focus states are clearly visible

### Touch Accessibility
- Touch targets are large enough
- Sufficient spacing between interactive elements
- Alternative to complex gestures

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 639px
- **Tablet**: 640px - 1023px
- **Desktop**: 1024px and above

### Layout Principles
- Mobile-first approach
- Fluid layouts that adapt to screen size
- Critical content prioritized on smaller screens
- Touch-friendly on mobile, keyboard-friendly on desktop

## Implementation Guidelines

### CSS Architecture
- Use CSS variables for theme values
- Component-based styling
- Consistent naming convention
- Responsive utilities

### Component Implementation
- Build components with accessibility in mind
- Test across devices and browsers
- Document component usage and props
- Include examples and variants

### Design Tokens
- Store colors, typography, spacing as design tokens
- Use tokens consistently across the application
- Make tokens available to both design and development teams

## Resources
- Component library documentation
- Design file templates
- Icon library
- Example implementations
