"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transitions } from "@/lib/animations";
import { Loader2 } from "lucide-react";

export interface AnimatedButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  form?: string;
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 " +
    "hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-500/30",
  secondary:
    "bg-muted text-foreground hover:bg-accent shadow-sm",
  outline:
    "border border-border bg-card shadow-sm " +
    "hover:bg-accent hover:border-border hover:shadow-md",
  ghost:
    "hover:bg-muted text-foreground hover:text-foreground",
  danger:
    "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25 " +
    "hover:from-red-700 hover:to-red-600 hover:shadow-xl hover:shadow-red-500/30",
};

const sizeStyles = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-8 text-base",
};

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        whileHover={{
          scale: 1.02,
          y: -1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        transition={transitions.spring}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
