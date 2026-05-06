"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchFunds } from "@/services/fund";
import type { Fund } from "@/types";
import { debounce } from "@/lib/utils";
import { Search, X, Loader2, Plus } from "lucide-react";

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    fundId: string;
    fundName: string;
    shares: number;
    avgCost: number;
    channel?: string | undefined;
  }) => Promise<void>;
}

/**
 * 添加持仓弹窗组件
 * 
 * Agent: ui-architect
 */
export function AddHoldingModal({ isOpen, onClose, onAdd }: AddHoldingModalProps) {
  const [step, setStep] = useState<"search" | "form">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Fund[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [channel, setChannel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 防抖搜索
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
    // 自动填充当前净值作为成本
    setAvgCost(fund.nav.toString());
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFund) return;
    
    setIsSubmitting(true);
    try {
      await onAdd({
        fundId: selectedFund.id,
        fundName: selectedFund.name,
        shares: parseFloat(shares),
        avgCost: parseFloat(avgCost),
        channel: channel || undefined
      });
      // 重置并关闭
      setSearchQuery("");
      setSearchResults([]);
      setSelectedFund(null);
      setShares("");
      setAvgCost("");
      setChannel("");
      setStep("search");
      onClose();
    } catch (error) {
      console.error("添加失败:", error);
      alert("添加持仓失败: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBack = () => {
    setStep("search");
    setSelectedFund(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {step === "search" ? "搜索基金" : "添加持仓"}
          </CardTitle>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </CardHeader>
        
        <CardContent>
          {step === "search" ? (
            <div className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="输入基金名称或代码"
                  className="pl-10"
                  autoFocus
                />
              </div>
              
              {/* 搜索结果 */}
              <div className="h-[300px] overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    搜索中...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((fund) => (
                      <button
                        key={fund.id}
                        onClick={() => handleSelectFund(fund)}
                        className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/10 transition-colors"
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
              {/* 已选基金 */}
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
              
              {/* 份额 */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
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
              
              {/* 成本价 */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
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
              
              {/* 购买渠道 */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  购买渠道
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                >
                  <option value="">请选择</option>
                  <option value="蚂蚁财富">蚂蚁财富</option>
                  <option value="天天基金">天天基金</option>
                  <option value="且慢">且慢</option>
                  <option value="招商银行">招商银行</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              
              {/* 预估信息 */}
              {shares && avgCost && selectedFund && (
                <div className="bg-primary/10 p-3 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">投入金额:</span>
                    <span className="font-medium">
                      ¥{(parseFloat(shares) * parseFloat(avgCost)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* 提交按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !shares || !avgCost}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      添加中...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      确认添加
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
