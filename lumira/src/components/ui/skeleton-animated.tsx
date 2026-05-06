'use client';

import { motion, type MotionStyle } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
}

/**
 * 动画骨架屏组件
 * 支持脉冲动画和 shimmer 流动效果
 */
export function AnimatedSkeleton({
  className,
  width,
  height,
  shimmer = false,
}: AnimatedSkeletonProps) {
  const style: MotionStyle = {
    width: width,
    height: height,
  };

  if (shimmer) {
    return (
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-md bg-muted',
          className
        )}
        style={style}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Shimmer 流动效果层 */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    );
  }

  // 基础脉冲动画效果
  return (
    <motion.div
      className={cn('rounded-md bg-muted', className)}
      style={style}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * 骨架屏文本行组件
 * 用于模拟多行文本加载状态
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineHeight?: number;
  gap?: number;
}

export function SkeletonText({
  lines = 3,
  className,
  lineHeight = 16,
  gap = 8,
}: SkeletonTextProps) {
  return (
    <div className={cn('flex flex-col', className)} style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <AnimatedSkeleton
          key={index}
          height={lineHeight}
          className={cn(
            'w-full',
            index === lines - 1 && lines > 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  );
}

/**
 * 骨架屏卡片组件
 * 用于模拟卡片内容加载状态
 */
interface SkeletonCardProps {
  className?: string;
  header?: boolean;
  contentLines?: number;
  footer?: boolean;
}

export function SkeletonCard({
  className,
  header = true,
  contentLines = 3,
  footer = false,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      {header && (
        <div className="mb-4 flex items-center gap-3">
          <AnimatedSkeleton width={40} height={40} className="rounded-full" />
          <div className="flex-1">
            <AnimatedSkeleton width="60%" height={16} className="mb-2" />
            <AnimatedSkeleton width="40%" height={12} />
          </div>
        </div>
      )}

      <SkeletonText lines={contentLines} lineHeight={14} gap={10} />

      {footer && (
        <div className="mt-4 flex items-center justify-between">
          <AnimatedSkeleton width={80} height={12} />
          <AnimatedSkeleton width={60} height={12} />
        </div>
      )}
    </div>
  );
}

/**
 * 骨架屏列表组件
 * 用于模拟列表加载状态
 */
interface SkeletonListProps {
  count?: number;
  className?: string;
  itemHeight?: number;
  gap?: number;
}

export function SkeletonList({
  count = 5,
  className,
  itemHeight = 60,
  gap = 8,
}: SkeletonListProps) {
  return (
    <div className={cn('flex flex-col', className)} style={{ gap }}>
      {Array.from({ length: count }).map((_, index) => (
        <AnimatedSkeleton
          key={index}
          height={itemHeight}
          className="w-full"
        />
      ))}
    </div>
  );
}
