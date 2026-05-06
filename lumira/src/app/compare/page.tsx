"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X, TrendingUp, Search, Trophy } from "lucide-react";
import Link from "next/link";
import { searchFunds, getFundEstimate } from "@/services/fund";
import type { Fund, FundEstimate } from "@/types";

interface CompareFund extends Fund {
  estimate?: FundEstimate;
}

/**
 * 基金对比页
 * 
 * Agent: ui-architect + fund-analyst
 */
export default function ComparePage() {
  const router = useRouter();
  const [selectedFunds, setSelectedFunds] = useState<CompareFund[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Fund[]>([]);
  const [_isSearching, setIsSearching] = useState(false);

  const maxCompare = 5;

  // 搜索基金
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchFunds(query);
      // 过滤已选的
      const filtered = results.filter(
        r => !selectedFunds.find(s => s.id === r.id)
      );
      setSearchResults(filtered.slice(0, 10));
    } catch (error) {
      console.error("搜索失败:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // 添加基金到对比
  const addFund = async (fund: Fund) => {
    if (selectedFunds.length >= maxCompare) {
      alert(`最多对比 ${maxCompare} 只基金`);
      return;
    }
    try {
      const estimate = await getFundEstimate(fund.id);
      setSelectedFunds([...selectedFunds, { ...fund, estimate }]);
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      setSelectedFunds([...selectedFunds, fund]);
    }
  };

  // 移除基金
  const removeFund = (fundId: string) => {
    setSelectedFunds(selectedFunds.filter(f => f.id !== fundId));
  };

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
              <h1 className="text-xl font-bold text-foreground">基金对比</h1>
            </div>
            <div className="flex gap-2">
              <Link href="/rankings">
                <Button variant="outline" size="sm">
                  <Trophy className="w-4 h-4 mr-1" />
                  排行
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 搜索添加 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              添加基金对比 ({selectedFunds.length}/{maxCompare})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索基金名称或代码"
                disabled={selectedFunds.length >= maxCompare}
                className="pl-10"
              />
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg divide-y">
                {searchResults.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => addFund(fund)}
                    className="w-full text-left p-3 hover:bg-accent flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{fund.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {fund.id} · {fund.company}
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                ))}
              </div>
            )}

            {/* 已选基金 */}
            {selectedFunds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedFunds.map((fund) => (
                  <div
                    key={fund.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    <span className="truncate max-w-[150px]">{fund.name}</span>
                    <button
                      onClick={() => removeFund(fund.id)}
                      className="hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 对比表格 */}
        {selectedFunds.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>对比详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground w-32">
                        对比项目
                      </th>
                      {selectedFunds.map((fund) => (
                        <th
                          key={fund.id}
                          className="text-left py-3 px-4 font-medium min-w-[200px]"
                        >
                          <div className="font-bold text-foreground">{fund.name}</div>
                          <div className="text-sm text-muted-foreground">{fund.id}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {/* 实时涨跌幅 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">实时涨跌幅</td>
                      {selectedFunds.map((fund) => {
                        const change = fund.estimate?.estimateChangePercent || 0;
                        const isUp = change >= 0;
                        return (
                          <td key={fund.id} className="py-3 px-4">
                            <span
                              className={cn(
                                "font-medium",
                                isUp ? "text-red-500" : "text-green-500"
                              )}
                            >
                              {isUp ? "+" : ""}
                              {change.toFixed(2)}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>

                    {/* 最新净值 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">最新净值</td>
                      {selectedFunds.map((fund) => (
                        <td key={fund.id} className="py-3 px-4 font-mono">
                          {fund.nav?.toFixed(4) || "-"}
                        </td>
                      ))}
                    </tr>

                    {/* 实时估值 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">实时估值</td>
                      {selectedFunds.map((fund) => (
                        <td key={fund.id} className="py-3 px-4 font-mono">
                          {fund.estimate?.estimateNav?.toFixed(4) || "-"}
                        </td>
                      ))}
                    </tr>

                    {/* 基金类型 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">基金类型</td>
                      {selectedFunds.map((fund) => (
                        <td key={fund.id} className="py-3 px-4">
                          <span className="px-2 py-1 bg-muted rounded text-sm">
                            {fund.type}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* 基金公司 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">基金公司</td>
                      {selectedFunds.map((fund) => (
                        <td key={fund.id} className="py-3 px-4 text-sm">
                          {fund.company}
                        </td>
                      ))}
                    </tr>

                    {/* 管理费率 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">管理费率</td>
                      {selectedFunds.map((fund) => (
                        <td key={fund.id} className="py-3 px-4">
                          {fund.feeRate?.management
                            ? `${(fund.feeRate.management * 100).toFixed(2)}%`
                            : "-"}
                        </td>
                      ))}
                    </tr>

                    {/* 申购费率 */}
                    <tr>
                      <td className="py-3 px-4 text-muted-foreground">申购费率</td>
                      {selectedFunds.map((fund) => (
                        <td key={fund.id} className="py-3 px-4">
                          {fund.feeRate?.buy
                            ? `${(fund.feeRate.buy * 100).toFixed(2)}%`
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                开始基金对比
              </h3>
              <p className="text-muted-foreground mb-4">
                搜索并添加基金，对比它们的业绩表现
              </p>
              <p className="text-sm text-muted-foreground">最多可同时对比 {maxCompare} 只基金</p>
            </CardContent>
          </Card>
        )}
      </div>
      </main>
      </main>
  );
}
