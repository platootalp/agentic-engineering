"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHoldings } from "@/hooks/use-holdings";
import { useTransactionsByHolding } from "@/hooks/use-transactions";
import { getFundEstimate, fetchNavHistory } from "@/services/fund";
import { formatNumber, cn } from "@/lib/utils";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Plus } from "lucide-react";
import { TransactionForm } from "@/components/transaction-form";
import { NavHistoryChart } from "@/components/charts/NavHistoryChart";
import { AnimatedNumber, AnimatedCurrency, AnimatedPercent } from "@/components/AnimatedNumber";

import type { FundEstimate } from "@/types";

/**
 * 基金详情页
 * 
 * Agent: ui-architect
 */
export default function FundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fundCode = params.code as string;
  
  const [estimate, setEstimate] = useState<FundEstimate | null>(null);
  const [navHistory, setNavHistory] = useState<any[]>([]);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  // 使用 React Query 获取持仓数据
  const { data: holdings = [], isLoading: isLoadingHoldings } = useHoldings();

  // 根据 fundCode 过滤持仓
  const holding = useMemo(() => {
    return holdings.find(h => h.fundId === fundCode) || null;
  }, [holdings, fundCode]);

  // 使用 React Query 获取交易记录
  const { data: transactions = [], isLoading: isLoadingTransactions } = useTransactionsByHolding(holding?.id || "");

  // 加载估值和净值历史数据（这些调用外部 API）
  useEffect(() => {
    if (fundCode) {
      loadEstimateData();
    }
  }, [fundCode]);

  const loadEstimateData = async () => {
    setIsLoadingEstimate(true);
    try {
      // 获取估值
      const est = await getFundEstimate(fundCode);
      setEstimate(est);

      // 获取净值历史
      const history = await fetchNavHistory(fundCode, 90);
      setNavHistory(history.history || []);
    } catch (error) {
      console.error("加载基金估值失败:", error);
    } finally {
      setIsLoadingEstimate(false);
    }
  };

  // 计算收益
  const calculateProfit = () => {
    if (!holding || !estimate) return null;
    
    const marketValue = holding.totalShares * estimate.estimateNav;
    const profit = marketValue - holding.totalCost;
    const profitRate = (profit / holding.totalCost) * 100;
    
    return {
      marketValue,
      profit,
      profitRate,
      estimateNav: estimate.estimateNav
    };
  };

  const profit = calculateProfit();
  const isProfit = profit ? profit.profit >= 0 : true;

  const isLoading = isLoadingHoldings || isLoadingEstimate;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">无法获取基金信息</p>
          <Button onClick={() => router.push("/")}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
      <main className="min-h-screen bg-background">
      <main className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              返回
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {estimate.fundName}
              </h1>
              <p className="text-sm text-muted-foreground">{fundCode}</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowTransactionForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              添加交易
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 估值卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>最新净值</CardDescription>
              <CardTitle className="text-2xl font-mono">
                <AnimatedNumber value={estimate.lastNav} decimals={4} />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">{estimate.lastNavDate}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>实时估值</CardDescription>
              <CardTitle className={cn(
                "text-2xl font-mono",
                estimate.estimateChangePercent >= 0 ? "text-red-500" : "text-green-500"
              )}>
                <AnimatedNumber 
                  value={estimate.estimateNav} 
                  decimals={4}
                  className={estimate.estimateChangePercent >= 0 ? "text-red-500" : "text-green-500"}
                />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className={cn(
                "text-sm font-medium",
                estimate.estimateChangePercent >= 0 ? "text-red-500" : "text-green-500"
              )}>
                <AnimatedPercent 
                  value={estimate.estimateChangePercent}
                  className={estimate.estimateChangePercent >= 0 ? "text-red-500" : "text-green-500"}
                />
              </p>
            </CardContent>
          </Card>


          {profit && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>持仓市值</CardDescription>
                  <CardTitle className="text-2xl font-mono">
                    <AnimatedCurrency value={profit.marketValue} />
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {holding?.totalShares.toFixed(2)} 份
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="flex items-center gap-1">
                    持仓收益
                    {isProfit ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    )}
                  </CardDescription>
                  <CardTitle className={cn(
                    "text-2xl font-mono",
                    isProfit ? "text-red-500" : "text-green-500"
                  )}>
                    <AnimatedCurrency 
                      value={profit.profit}
                      className={isProfit ? "text-red-500" : "text-green-500"}
                    />
                    </CardTitle>
                  </CardHeader>

                <CardContent>
                  <p className={cn(
                    "text-sm font-medium",
                    isProfit ? "text-red-500" : "text-green-500"
                  )}>
                    <AnimatedPercent 
                      value={profit.profitRate}
                      className={isProfit ? "text-red-500" : "text-green-500"}
                    />
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 详情标签页 */}
        <Tabs defaultValue="history">
          <TabsList>
            <TabsTrigger value="history">净值走势</TabsTrigger>
            <TabsTrigger value="transactions">交易记录</TabsTrigger>
            <TabsTrigger value="analysis">收益分析</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>净值走势</CardTitle>
              </CardHeader>
              <CardContent>
                {navHistory.length > 0 ? (
                  <NavHistoryChart
                    data={navHistory}
                    estimateNav={estimate?.estimateNav}
                    estimateTime={estimate?.estimateTime}
                  />
                ) : (
                  <p className="text-muted-foreground">暂无净值历史数据</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>交易记录</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>加载中...</p>
                  </div>
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-background rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            tx.type === "BUY" ? "bg-blue-100" : "bg-orange-100"
                          )}>
                            {tx.type === "BUY" ? (
                              <DollarSign className="w-5 h-5 text-blue-600" />
                            ) : (
                              <span className="text-orange-600 font-medium">赎</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.type === "BUY" ? "买入" : "卖出"}
                            </p>
                            <p className="text-sm text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {tx.type === "BUY" ? "-" : "+"}¥{formatNumber(tx.amount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.shares.toFixed(2)} 份 @ {tx.price.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>暂无交易记录</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>收益分析</CardTitle>
              </CardHeader>
              <CardContent>
                {holding ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">总成本</p>
                        <p className="text-xl font-mono font-medium">
                          <AnimatedCurrency value={holding.totalCost} />
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">平均成本</p>
                        <p className="text-xl font-mono font-medium">
                          <AnimatedNumber value={holding.avgCost} decimals={4} />
                        </p>
                      </div>
                    </div>
                    
                    {profit && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-background rounded-lg">
                          <p className="text-sm text-muted-foreground">当前市值</p>
                          <p className="text-xl font-mono font-medium">
                            <AnimatedCurrency value={profit.marketValue} />
                          </p>
                        </div>
                        <div className="p-4 bg-background rounded-lg">
                          <p className="text-sm text-muted-foreground">盈亏金额</p>
                          <p className={cn(
                            "text-xl font-mono font-medium",
                            isProfit ? "text-red-500" : "text-green-500"
                          )}>
                            <AnimatedCurrency 
                              value={profit.profit}
                              className={isProfit ? "text-red-500" : "text-green-500"}
                            />
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {holding.channel && (
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">购买渠道</p>
                        <p className="font-medium">{holding.channel}</p>
                      </div>
                    )}
                    
                    {holding.group && (
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">分组</p>
                        <p className="font-medium">{holding.group}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">您尚未持有该基金</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 添加交易弹窗 */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <TransactionForm
            fundId={fundCode}
            fundName={estimate.fundName}
            holdingId={holding?.id}
            onSuccess={() => {
              setShowTransactionForm(false);
            }}
            onCancel={() => setShowTransactionForm(false)}
          />
        </div>
      )}
      </main>
      </main>
  );
}

// CardDescription 兼容组件
function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}
