"use client";

import { useEffect, useMemo } from "react";
import { useSpring, useTransform, motion, useReducedMotion } from "framer-motion";
import { formatNumber } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  prefix?: string | undefined;
  suffix?: string | undefined;
  decimals?: number | undefined;
  duration?: number | undefined;
  className?: string | undefined;
}

/**
 * 动画数字组件
 * 数字变化时平滑过渡到新值
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 1.2,
  className,
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();
  const springConfig = useMemo(() => ({
    stiffness: 50,
    damping: 20,
    duration: prefersReducedMotion ? 0 : duration,
  }), [duration, prefersReducedMotion]);
  const spring = useSpring(0, springConfig);

  const display = useTransform(spring, (current) =>
    `${prefix}${formatNumber(current, decimals)}${suffix}`
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  // 如果用户偏好减少动画，直接显示数字
  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}{formatNumber(value, decimals)}{suffix}
      </span>
    );
  }

  return <motion.span className={className}>{display}</motion.span>;
}

interface AnimatedCurrencyProps {
  value: number;
  currency?: string | undefined;
  decimals?: number | undefined;
  className?: string | undefined;
}

/**
 * 货币显示组件 - 用于金额
 */
export function AnimatedCurrency({
  value,
  currency = "¥",
  decimals = 2,
  className,
}: AnimatedCurrencyProps) {
  const isPositive = value >= 0;

  return (
    <AnimatedNumber
      value={Math.abs(value)}
      prefix={isPositive ? currency : `-${currency}`}
      decimals={decimals}
      className={className}
    />
  );
}

interface AnimatedPercentProps {
  value: number;
  decimals?: number | undefined;
  className?: string | undefined;
}

/**
 * 百分比显示组件 - 用于收益率
 */
export function AnimatedPercent({
  value,
  decimals = 2,
  className,
}: AnimatedPercentProps) {
  return (
    <AnimatedNumber
      value={value}
      prefix={value >= 0 ? "+" : ""}
      suffix="%"
      decimals={decimals}
      className={className}
    />
  );
}
