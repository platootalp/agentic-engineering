# UI Components

**Scope**: Base UI components built on Radix UI primitives with Tailwind styling.

## Overview

15+ reusable UI components using `class-variance-authority` for variant management. All components support dark mode via CSS variables.

## Component Patterns

### Structure
```typescript
"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1. Define variants with cva
const componentVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" }
});

// 2. Define props interface
export interface ComponentProps extends
  React.HTMLAttributes<HTML Element>,
  VariantProps<typeof componentVariants> {
  asChild?: boolean;
}

// 3. Forward ref component
const Component = React.forwardRef<HTML Element, ComponentProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(componentVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Component.displayName = "Component";

export { Component, componentVariants };
```

### Key Conventions

| Pattern | Implementation |
|---------|---------------|
| **Variants** | Use `cva()` for all style variants |
| **Class merging** | Always use `cn()` from `@/lib/utils` |
| **Ref forwarding** | Use `React.forwardRef` for all interactive elements |
| **Polymorphic** | Support `asChild` prop via Radix Slot |
| **Display name** | Always set `displayName` for debugging |

### Available Components

| Component | Primitives | Variants |
|-----------|-----------|----------|
| `button` | Radix Slot | default, destructive, outline, secondary, ghost, link |
| `card` | - | Compound: Card, Header, Title, Content, Footer |
| `input` | - | Standard form input with focus states |
| `tabs` | Radix Tabs | Standard tab interface |
| `dialog` | Radix Dialog | Modal with overlay |
| `sheet` | Radix Dialog | Slide-out panel |
| `dropdown-menu` | Radix Menu | Context menus |
| `toast` | Radix Toast | Notifications |
| `tooltip` | Radix Tooltip | Hover hints |
| `avatar` | Radix Avatar | User avatars |
| `separator` | Radix Separator | Visual dividers |
| `label` | Radix Label | Form labels |
| `radio-group` | Radix Radio | Selection groups |

## Styling Rules

1. **Use CSS variables** from globals.css, never hardcode colors
2. **Dark mode support** via `.dark` class variants
3. **Focus states** with `focus-visible:ring-2`
4. **Transitions** with `duration-200` for interactions
5. **Disabled states** with `disabled:opacity-50 disabled:pointer-events-none`

## Anti-Patterns

- ❌ Don't use inline styles
- ❌ Don't hardcode colors (use `hsl(var(--primary))`)
- ❌ Don't forget `displayName`
- ❌ Don't use `any` for props (extend proper HTML types)
