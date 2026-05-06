"use client";

import React, { useState, useRef, useCallback } from "react";
import { searchFunds } from "@/services/fund";
import { useCreateHolding } from "@/hooks/use-holdings";
import type { Fund } from "@/types";
import { debounce } from "@/lib/utils";
import { Search, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface SearchTabProps {
  onSuccess?: () => void;
}

const CHANNEL_OPTIONS = [
  "蚂蚁财富",
  "天天基金",
  "且慢",
  "招商银行",
  "其他"
];

export function SearchTab({ onSuccess }: SearchTabProps) {
  const { showToast } = useToast();
  const createHolding = useCreateHolding();
  const [step, setStep] = useState<"search" | "form">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Fund[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [channel, setChannel] = useState("");

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchFunds(query);
        setSearchResults(results);
      } catch (error) {
        console.error("搜索失败:", error);
        showToast({
          type: "error",
          title: "搜索失败",
          message: "搜索基金失败，请稍后重试",
        });
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSelectFund = (fund: Fund) => {
    setSelectedFund(fund);
    setStep("form");
    setAvgCost(fund.nav.toString());
  };

  const calculateTotalInvestment = useCallback(() => {
    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);
    if (isNaN(sharesNum) || isNaN(avgCostNum) || sharesNum <= 0 || avgCostNum <= 0) {
      return null;
    }
    return sharesNum * avgCostNum;
  }, [shares, avgCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund) return;

    const sharesNum = parseFloat(shares);
    const avgCostNum = parseFloat(avgCost);

    if (isNaN(sharesNum) || sharesNum <= 0) {
      showToast({
        type: "warning",
        title: "输入错误",
        message: "请输入有效的持有份额",
      });
      return;
    }

    if (isNaN(avgCostNum) || avgCostNum <= 0) {
      showToast({
        type: "warning",
        title: "输入错误",
        message: "请输入有效的成本单价",
      });
      return;
    }

    try {
      await createHolding.mutateAsync({
        fundId: selectedFund.id,
        fundName: selectedFund.name,
        fundType: selectedFund.type,
        totalShares: sharesNum,
        avgCost: avgCostNum,
        totalCost: sharesNum * avgCostNum,
        ...(channel ? { channel } : {}),
      });

      showToast({
        type: "success",
        title: "添加成功",
        message: `成功添加持仓：${selectedFund.name}`,
      });

      setSearchQuery("");
      setSearchResults([]);
      setSelectedFund(null);
      setShares("");
      setAvgCost("");
      setChannel("");
      setStep("search");

      onSuccess?.();
    } catch (error) {
      console.error("保存持仓失败:", error);
      showToast({
        type: "error",
        title: "保存失败",
        message: "保存持仓失败: " + (error as Error).message,
      });
    }
  };

  const handleBack = () => {
    setStep("search");
    setSelectedFund(null);
    setShares("");
    setAvgCost("");
    setChannel("");
  };

  const totalInvestment = calculateTotalInvestment();


  return (
    <div className="space-y-4">
      {step === "search" ? (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="输入基金名称或代码搜索"
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="h-[300px] overflow-y-auto border border-input rounded-lg bg-background">
            {isSearching ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                搜索中...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-border">
                {searchResults.map((fund) => (
                  <button
                    key={fund.id}
                    onClick={() => handleSelectFund(fund)}
                    className="w-full text-left p-3 hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-foreground">{fund.name}</div>
                    <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                      <span>{fund.id}</span>
                      <span>{fund.company}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                未找到相关基金
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Search className="w-12 h-12 mb-2 opacity-50" />
                <p>输入基金名称或6位基金代码</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="font-medium text-foreground">{selectedFund?.name}</div>
            <div className="flex justify-between mt-1 text-sm text-muted-foreground">
              <span>{selectedFund?.id}</span>
              <span>最新净值: {selectedFund?.nav}</span>
            </div>
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-primary mt-2 hover:underline"
            >
              重新选择
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              持有份额 <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              成本单价 (元) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              placeholder="0.0000"
              step="0.0001"
              min="0.0001"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              已自动填充最新净值，请根据实际成本修改
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              购买渠道
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="">请选择</option>
              {CHANNEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {totalInvestment !== null && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">投入金额:</span>
                <span className="font-medium text-primary">
                  ¥{totalInvestment.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-foreground"
            >
              返回
            </button>
            <button
              type="submit"
              disabled={createHolding.isPending || !shares || !avgCost}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {createHolding.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  确认添加
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
