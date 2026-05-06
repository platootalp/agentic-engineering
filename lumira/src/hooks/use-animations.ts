"use client";

import { useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  fadeInUp,
  fadeIn,
  slideInLeft,
  slideInRight,
  scaleIn,
  staggerContainer,
  staggerItem,
  pageTransition,
  cardHover,
  buttonTap,
  reducedMotionVariants,
} from "@/lib/animations";

export interface UseAnimationsReturn {
  /** 从下方淡入动画变体 */
  fadeInUp: Variants;
  /** 淡入动画变体 */
  fadeIn: Variants;
  /** 从左侧滑入动画变体 */
  slideInLeft: Variants;
  /** 从右侧滑入动画变体 */
  slideInRight: Variants;
  /** 缩放淡入动画变体 */
  scaleIn: Variants;
  /** 列表 stagger 容器配置 */
  staggerContainer: Variants;
  /** 列表 stagger 子项配置 */
  staggerItem: Variants;
  /** 页面过渡动画变体 */
  pageTransition: Variants;
  /** 卡片悬停效果配置 */
  cardHover: Variants;
  /** 按钮点击效果配置 */
  buttonTap: Variants;
  /** 是否启用了减少动画 */
  isReducedMotion: boolean;
}

/**
 * 动画 Hook - 提供带无障碍支持的动画变体
 *
 * 自动检测用户是否偏好减少动画，如果启用则返回空动画变体
 * 用于支持 prefers-reduced-motion 无障碍需求
 *
 * @example
 * ```tsx
 * const { fadeInUp, isReducedMotion } = useAnimations();
 *
 * return (
 *   <motion.div
 *     variants={fadeInUp}
 *     initial="initial"
 *     animate="animate"
 *   >
 *     Content
 *   </motion.div>
 * );
 * ```
 */
export function useAnimations(): UseAnimationsReturn {
  const prefersReducedMotion = useReducedMotion();
  const isReducedMotion = prefersReducedMotion ?? false;

  if (isReducedMotion) {
    return {
      fadeInUp: reducedMotionVariants,
      fadeIn: reducedMotionVariants,
      slideInLeft: reducedMotionVariants,
      slideInRight: reducedMotionVariants,
      scaleIn: reducedMotionVariants,
      staggerContainer: reducedMotionVariants,
      staggerItem: reducedMotionVariants,
      pageTransition: reducedMotionVariants,
      cardHover: reducedMotionVariants,
      buttonTap: reducedMotionVariants,
      isReducedMotion: true,
    };
  }

  return {
    fadeInUp,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleIn,
    staggerContainer,
    staggerItem,
    pageTransition,
    cardHover,
    buttonTap,
    isReducedMotion: false,
  };
}
