"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Flame, Clock, GitCompare } from "lucide-react";
import Link from "next/link";
import {
  getDailyRisingRanking,
  getDailyDeclineRanking,
  getHotRanking,
  type RankingItem,
} from "@/lib/eastmoney-ranking-api";

type TabType = "daily" | "decline" | "hot";

/**
 * 基金排行榜页
 * 
 * Agent: ui-architect
 */
export default function RankingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("daily");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rankings, setRankings] = useState<{
    daily: RankingItem[];
    decline: RankingItem[];
    hot: RankingItem[];
  }>({
    daily: [],
    decline: [],
    hot: [],
  });

  const loadRankings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [daily, decline, hot] = await Promise.all([
        getDailyRisingRanking(1, 10),
        getDailyDeclineRanking(1, 10),
        getHotRanking(1, 10),
      ]);
      setRankings({
        daily: daily.items,
        decline: decline.items,
        hot: hot.items,
      });
    } catch (err) {
      setError("加载排行榜数据失败，请稍后重试");
      console.error("加载排行榜失败:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

  const tabs = [
    { key: "daily" as TabType, label: "涨幅榜", icon: TrendingUp },
    { key: "decline" as TabType, label: "跌幅榜", icon: TrendingDown },
    { key: "hot" as TabType, label: "热门榜", icon: Flame },
  ];

  const currentData = rankings[activeTab];

  return (
      <main className="min-h-screen bg-background">
      <main className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                基金排行榜
              </h1>
            </div>
            <Link href="/compare">
              <Button variant="outline" size="sm">
                <GitCompare className="w-4 h-4 mr-1" />
                对比
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 标签切换 */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 排行榜列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{tabs.find(t => t.key === activeTab)?.label}</span>
              <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                实时更新
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">加载中...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-red-500 mb-2">⚠️ {error}</div>
                <Button variant="outline" size="sm" onClick={loadRankings}>
                  重试
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTab === "hot" ? (
                  // 热门榜
                  currentData.map((item: RankingItem, index: number) => (
                    <div
                      key={item.code}
                      onClick={() => router.push(`/fund/${item.code}`)}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index < 3 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "font-mono font-medium text-lg",
                          item.changePercent >= 0 ? "text-red-500" : "text-green-500"
                        )}>
                          {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          净值 {item.nav.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // 涨跌幅榜
                  currentData.map((item: RankingItem, index: number) => {
                    const isUp = item.changePercent >= 0;
                    return (
                      <div
                        key={item.code}
                        onClick={() => router.push(`/fund/${item.code}`)}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            index < 3 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.code}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "font-mono font-medium text-lg",
                            isUp ? "text-red-500" : "text-green-500"
                          )}>
                            {isUp ? "+" : ""}{item.changePercent.toFixed(2)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            净值 {item.nav.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 提示 */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">⚠️ 免责声明：</span>
            排行榜数据仅供参考，不构成投资建议。过往业绩不代表未来表现，市场有风险，投资需谨慎。
          </p>
        </div>
      </div>
      </main>
      </main>
  );
}
