"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortfolioChart } from "@/components/portfolio-chart";
import { useHoldings } from "@/hooks/use-holdings";
import { getBatchEstimates, calculateEstimateProfit, getFundYesterdayNav } from "@/services/fund";
import { formatNumber, cn } from "@/lib/utils";
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FundEstimate, HoldingWithEstimate } from "@/types";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { AnimatedCurrency } from "@/components/AnimatedNumber";

function DashboardContent() {
  const { data: holdings = [], error } = useHoldings();
  const [mounted, setMounted] = useState(false);
  const [estimates, setEstimates] = useState<Map<string, FundEstimate>>(new Map());
  const [yesterdayNavs, setYesterdayNavs] = useState<Map<string, number | null>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const holdingsWithEstimates: HoldingWithEstimate[] = holdings.map((holding) => {
    const estimate = estimates.get(holding.fundId);
    const yesterdayNav = yesterdayNavs.get(holding.fundId);
    const estimateNav = estimate?.estimateNav || holding.avgCost;
    const profit = calculateEstimateProfit(
      holding.totalShares,
      holding.avgCost,
      estimateNav,
      yesterdayNav
    );
    return {
      ...holding,
      estimateNav: estimate?.estimateNav,
      estimateTime: estimate?.estimateTime,
      marketValue: profit.marketValue,
      profit: profit.profit,
      profitRate: profit.profitRate,
      todayProfit: profit.todayProfit,
    };
  });

  const summary = {
    totalAssets: holdingsWithEstimates.reduce((sum, h) => sum + h.marketValue, 0),
    totalCost: holdingsWithEstimates.reduce((sum, h) => sum + h.totalCost, 0),
    totalProfit: holdingsWithEstimates.reduce((sum, h) => sum + h.profit, 0),
    todayProfit: holdingsWithEstimates.reduce((sum, h) => sum + h.todayProfit, 0),
    holdingCount: holdings.length
  };

  const totalProfitRate = summary.totalCost > 0 ? (summary.totalProfit / summary.totalCost) * 100 : 0;
  const isProfit = summary.totalProfit >= 0;
  const isTodayProfit = summary.todayProfit >= 0;

  useEffect(() => { setMounted(true); }, []);

  const loadEstimates = useCallback(async () => {
    if (holdings.length === 0) return;
    setIsRefreshing(true);
    try {
      const fundCodes = holdings.map(h => h.fundId);
      const estimatesMap = await getBatchEstimates(fundCodes);

      const yesterdayNavs = new Map<string, number | null>();
      for (const code of fundCodes) {
        const yesterdayNav = await getFundYesterdayNav(code);
        yesterdayNavs.set(code, yesterdayNav);
      }

      setEstimates(estimatesMap);
      setYesterdayNavs(yesterdayNavs);
    } catch (error) {
      console.error("加载估值失败:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [holdings]);

  useEffect(() => { loadEstimates(); }, [loadEstimates]);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">资产概览</h1>
            <p className="text-sm text-muted-foreground">实时跟踪您的投资组合表现</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-blue-500" />
                </div>
                总资产
              </CardDescription>
              <CardTitle className="text-3xl font-bold amount-display text-foreground">
                <AnimatedCurrency value={summary.totalAssets} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  {summary.holdingCount} 只基金
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("group relative overflow-hidden", isProfit ? "border-red-100/50" : "border-emerald-100/50")}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", isProfit ? "bg-gradient-to-br from-red-500/5 to-orange-500/5" : "bg-gradient-to-br from-emerald-500/5 to-teal-500/5")} />
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isProfit ? "bg-red-50" : "bg-emerald-50")}>
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                累计收益
              </CardDescription>
              <CardTitle className={cn("text-3xl font-bold amount-display", isProfit ? "profit-up" : "profit-down")}>
                <AnimatedCurrency value={summary.totalProfit} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold", isProfit ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600")}>
                {isProfit ? "+" : ""}{formatNumber(totalProfitRate)}%
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn("group relative overflow-hidden", isTodayProfit ? "border-red-100/50" : "border-emerald-100/50")}>
            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500", isTodayProfit ? "bg-gradient-to-br from-red-500/5 to-orange-500/5" : "bg-gradient-to-br from-emerald-500/5 to-teal-500/5")} />
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", isTodayProfit ? "bg-red-50" : "bg-emerald-50")}>
                  <Activity className={cn("w-4 h-4", isTodayProfit ? "text-red-500" : "text-emerald-500")} />
                </div>
                今日预估收益
              </CardDescription>
              <CardTitle className={cn("text-3xl font-bold amount-display", isTodayProfit ? "profit-up" : "profit-down")}>
                <AnimatedCurrency value={summary.todayProfit} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">基于实时估值计算</p>
            </CardContent>
          </Card>
        </div>

        {holdings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">图表分析</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadEstimates}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-1.5", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "更新中" : "刷新"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="allocation">
                <TabsList className="mb-6 bg-muted p-1 rounded-xl">
                  <TabsTrigger value="allocation" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    资产配置
                  </TabsTrigger>
                  <TabsTrigger value="profit" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    收益分布
                  </TabsTrigger>
                  <TabsTrigger value="trend" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    收益走势
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="allocation">
                  <PortfolioChart holdings={holdingsWithEstimates} type="allocation" />
                </TabsContent>
                <TabsContent value="profit">
                  <PortfolioChart holdings={holdingsWithEstimates} type="profit" />
                </TabsContent>
                <TabsContent value="trend">
                  <PortfolioChart holdings={holdingsWithEstimates} type="trend" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="bg-red-50/80 border-red-200 mb-8">
            <CardContent className="py-6">
              <p className="text-red-600">加载失败: {error.message}</p>
            </CardContent>
          </Card>
        )}

        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 text-xl">⚠️</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">风险提示</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                本页面展示的基金估值数据仅供参考，实际净值以基金公司官方披露为准。市场有风险，投资需谨慎。过往业绩不代表未来表现。
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
