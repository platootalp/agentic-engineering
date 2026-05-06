import type { Transition, Variants } from "framer-motion";

// ============================================================================
// 缓动函数 (Easing Functions)
// ============================================================================

export const easing = {
  smooth: [0.4, 0, 0.2, 1] as const, // 通用平滑
  bounce: [0.68, -0.55, 0.265, 1.55] as const, // 弹性
  gentle: [0.25, 0.1, 0.25, 1] as const, // 温和
  exit: [0.4, 0, 1, 1] as const, // 出场
};

// ============================================================================
// 时长规范 (Duration Constants)
// ============================================================================

export const duration = {
  fast: 0.15, // 微交互
  normal: 0.3, // 标准过渡
  slow: 0.5, // 入场动画
  counting: 1.2, // 数字滚动
} as const;

// ============================================================================
// 通用过渡配置 (Transition Configurations)
// ============================================================================

export const transitions = {
  fast: {
    duration: duration.fast,
    ease: easing.smooth,
  } as Transition,

  normal: {
    duration: duration.normal,
    ease: easing.smooth,
  } as Transition,

  slow: {
    duration: duration.slow,
    ease: easing.gentle,
  } as Transition,

  spring: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  } as Transition,

  gentleSpring: {
    type: "spring",
    stiffness: 100,
    damping: 15,
  } as Transition,
};

// ============================================================================
// 入场动画变体 (Entrance Animation Variants)
// ============================================================================

export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
};

export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: transitions.normal,
  },
};

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.normal,
  },
};

export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: transitions.normal,
  },
};

// ============================================================================
// 列表 Stagger 配置 (List Stagger Configurations)
// ============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
};

// ============================================================================
// 页面过渡变体 (Page Transition Variants)
// ============================================================================

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

// ============================================================================
// 卡片悬停效果 (Card Hover Effects)
// ============================================================================

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: transitions.spring,
  },
};

// ============================================================================
// 按钮点击效果 (Button Tap Effects)
// ============================================================================

export const buttonTap: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
};

// ============================================================================
// 减动画支持 (Reduced Motion Support)
// ============================================================================

export const reducedMotionVariants: Variants = {
  initial: {},
  animate: {},
  exit: {},
};
