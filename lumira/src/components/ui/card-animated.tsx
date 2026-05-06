"use client";

import { motion, type Transition, type TargetAndTransition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { staggerItem, cardHover } from "@/lib/animations";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay,
  onClick,
}: AnimatedCardProps) {
  const motionProps: {
    variants: Variants;
    initial: string;
    animate: string;
    whileHover?: TargetAndTransition;
    transition?: Transition;
    className: string;
    onClick?: () => void;
  } = {
    variants: staggerItem,
    initial: "initial",
    animate: "animate",
    className: cn(
      "rounded-2xl border bg-card text-card-foreground shadow-sm",
      className
    ),
  };

  if (hover) {
    motionProps.whileHover = cardHover.hover as TargetAndTransition;
  }

  if (delay) {
    motionProps.transition = { delay: delay / 1000 } as Transition;
  }

  if (onClick) {
    motionProps.onClick = onClick;
  }

  return <motion.div {...motionProps}>{children}</motion.div>;
}
