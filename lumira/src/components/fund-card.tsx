"use client";

import React, { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { HoldingWithEstimate } from "@/types";
import { formatNumber, cn } from "@/lib/utils";
import { staggerItem } from "@/lib/animations";
import { AnimatedCurrency, AnimatedPercent } from "@/components/AnimatedNumber";
import { TrendingUp, TrendingDown, ArrowRight, Building2 } from "lucide-react";

interface FundCardProps {
  holding: HoldingWithEstimate;
  className?: string;
}

export const FundCard = memo(function FundCard({
  holding,
  className
}: FundCardProps) {
  const isProfit = holding.profit >= 0;
  const isTodayProfit = (holding.todayProfit || 0) >= 0;

  return (
    <Link href={`/fund/${holding.fundId}`} className="block group">
      <motion.div
        variants={staggerItem}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Card className={cn("h-full transition-shadow duration-300 hover:shadow-lg", className)}>
          <CardContent className="p-5">
            {/* 顶部：基金信息和收益 */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {holding.fundName}
                  </h3>
                  {holding.group && (
                    <span className="tag tag-primary flex-shrink-0">{holding.group}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono font-medium">{holding.fundId}</span>
                  {holding.channel && (
                    <>
                      <span className="text-muted-foreground/50">|</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {holding.channel}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 收益率 */}
              <div className={cn(
                "flex flex-col items-end ml-4 p-3 rounded-xl",
                isProfit ? "bg-[hsl(var(--fund-up)/0.1)]" : "bg-[hsl(var(--fund-down)/0.1)]"
              )}>
                <div className="flex items-center gap-1 mb-1">
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 text-[hsl(var(--fund-up))]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[hsl(var(--fund-down))]" />
                  )}
                  <span className={cn("text-sm font-medium", isProfit ? "text-[hsl(var(--fund-up))]" : "text-[hsl(var(--fund-down))]")}>
                    <AnimatedPercent value={holding.profitRate} />
                  </span>
                </div>
                <span className={cn("text-xs text-muted-foreground")}>收益率</span>
              </div>
            </div>

            {/* 中部：市值和收益金额 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-muted rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">市值</p>
                <p className="text-lg font-bold amount-display text-foreground">
                  <AnimatedCurrency value={holding.marketValue} />
                </p>
              </div>
              <div className={cn("p-3 rounded-xl", isProfit ? "bg-[hsl(var(--fund-up)/0.1)]" : "bg-[hsl(var(--fund-down)/0.1)]")}>
                <p className={cn("text-xs text-muted-foreground mb-1")}>盈亏</p>
                <p className={cn("text-lg font-bold amount-display", isProfit ? "text-[hsl(var(--fund-up))]" : "text-[hsl(var(--fund-down))]")}>
                  <AnimatedCurrency value={holding.profit} />
                </p>
              </div>
            </div>

            {/* 底部：持仓详情 */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="text-muted-foreground">份额</span>{" "}
                  <span className="font-medium text-foreground">{formatNumber(holding.totalShares, 2)}</span>
                </span>
                <span className="text-border">|</span>
                <span>
                  <span className="text-muted-foreground">成本</span>{" "}
                  <span className="font-mono font-medium text-foreground">¥{formatNumber(holding.avgCost, 4)}</span>
                </span>
              </div>

              {/* 今日预估 */}
              {holding.todayProfit !== 0 && (
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                  isTodayProfit ? "bg-[hsl(var(--fund-up)/0.15)] text-[hsl(var(--fund-up))]" : "bg-[hsl(var(--fund-down)/0.15)] text-[hsl(var(--fund-down))]"
                )}>
                  今日{isTodayProfit ? "+" : "-"}¥{formatNumber(Math.abs(holding.todayProfit))}
                </div>
              )}
            </div>

            {/* 估值信息 */}
            {holding.estimateNav && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">估值</span>
                  <span className="font-mono font-medium text-foreground">{formatNumber(holding.estimateNav, 4)}</span>
                  <span className="text-xs text-muted-foreground">{holding.estimateTime}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
});
