---
name: AuraReceipt Design System
colors:
  surface: '#0e150e'
  surface-dim: '#0e150e'
  surface-bright: '#333b33'
  surface-container-lowest: '#091009'
  surface-container-low: '#161d16'
  surface-container: '#1a221a'
  surface-container-high: '#242c24'
  surface-container-highest: '#2f372e'
  on-surface: '#dce5d9'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#dce5d9'
  inverse-on-surface: '#2a322a'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#4ae176'
  primary: '#4be277'
  on-primary: '#003915'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#006e2f'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#d1bdff'
  on-tertiary: '#3c0091'
  tertiary-container: '#b89cff'
  on-tertiary-container: '#4e02b8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#0e150e'
  on-background: '#dce5d9'
  surface-variant: '#2f372e'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system defines a premium, dark-first aesthetic for a next-generation fintech experience. The brand personality is ultra-modern and intelligent, projecting the reliability of a financial institution with the agility of an AI startup. 

The visual style employs **Glassmorphism** and **Corporate Modern** principles. It relies on deep backgrounds, semi-transparent layers, and vibrant accent colors to create a sense of depth and technical sophistication. The user interface should feel fluid, reminiscent of native iOS interactions, utilizing high-quality blurs and subtle gradients to guide the user's focus toward financial insights and automated actions.

## Colors

The palette is anchored in a "Deep Black-Blue" environment to minimize eye strain and elevate the premium feel. 

- **Primary Accent (Green):** Used for growth indicators, success states, and primary calls to action. It symbolizes financial health.
- **Secondary Accent (Blue):** Represents AI intelligence, scanning processes, and data insights.
- **Gradients:** Use a linear transition from Primary Green to Secondary Blue to Tertiary Purple (approx. 135-degree angle) for high-impact elements like scan buttons or premium feature highlights.
- **Glassmorphism:** Cards should use the `surface_card` color with a background blur (12px to 20px) to maintain legibility against the deep background.

## Typography

This design system exclusively uses **Inter** to ensure a systematic, utilitarian, and clean reading experience.

- **Data Impact:** Use `headline-lg` for total spending and currency amounts to create a strong visual anchor.
- **Information Hierarchy:** `headline-md` serves as the primary container title. `body-md` is used for list items and interactive labels, while `body-sm` handles secondary descriptions.
- **Clarity:** Maintain generous line heights to ensure financial data is digestible at a glance, especially when viewed on mobile devices during on-the-go scanning.

## Layout & Spacing

The layout is built on a strict **8pt grid system** to ensure consistency and precision. 

- **Grid Model:** Use a fluid grid for mobile (4 columns) and a 12-column grid for tablet/desktop views.
- **Safe Areas:** Mobile screens should maintain a minimum 20px horizontal margin (`container-margin`).
- **Section Spacing:** Use `stack-lg` (24px) to separate distinct functional areas (e.g., the Scanner preview from the Recent Receipts list).
- **Density:** Maintain a breathable layout. Use `stack-sm` (8px) for internal card padding and `stack-md` (16px) for spacing between related list items.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Base):** `#0B0F14` – The canvas.
2.  **Level 1 (Sub-containers):** `#111827` – Background for grouped content or inset sections.
3.  **Level 2 (Interactive Cards):** Glassmorphic surfaces with a 1px border (`#1F2937`) and a subtle 10% opacity white inner-glow on the top edge to simulate light hitting the glass.
4.  **Shadows:** When necessary for floating elements (like the Bottom Navigation or Action Modals), use extra-diffused shadows with a dark tint: `0px 10px 30px rgba(0, 0, 0, 0.5)`.

## Shapes

The shape language is "Rounded," prioritizing a friendly yet professional feel. 

- **Standard Elements:** Buttons, input fields, and small cards use `rounded-md` (0.5rem / 8px).
- **Container Elements:** Large dashboard cards and modals use `rounded-xl` (1.5rem / 24px) to create a distinct, modern framing.
- **Specialty Elements:** Badges and Category tags are fully pill-shaped (rounded-full) to distinguish them from interactive buttons.

## Components

- **Buttons:** 
  - *Primary:* Gradient-filled (Green-to-Blue) with white text. Apply a subtle outer glow of the primary color on hover/active states.
  - *Secondary:* Glassmorphic background with a semi-transparent white border and white text.
- **Cards:** Must feature `backdrop-filter: blur(16px)` and a thin `#1F2937` border. Content within should follow the 8pt padding rule.
- **Inputs:** Surface should be slightly darker or lighter than the background (`#111827`). On focus, the border transitions to the Secondary Blue with a 4px soft glow.
- **Badges:** Pill-shaped. Use low-opacity versions of category colors (e.g., 15% Green for "Food") with high-saturation text of the same hue for maximum legibility.
- **Icons:** Use 24px viewbox with a 1.5px or 2px stroke width. Icons should be "Outline" style by default, switching to "Solid/Filled" only when indicating an active navigation state.
- **Progress Indicators:** Use thin, sleek lines for scanning animations. The "Scan Line" should use the Primary Green gradient with a trailing motion blur effect.