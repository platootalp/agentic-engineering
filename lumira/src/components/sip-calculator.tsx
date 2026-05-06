"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

interface SIPCalculatorProps {
  className?: string;
}

/**
 * 定投计算器组件
 * 
 * Agent: fund-analyst
 * 计算定期定额投资的收益情况
 */
export function SIPCalculator({ className }: SIPCalculatorProps) {
  const [monthlyAmount, setMonthlyAmount] = useState("1000");
  const [months, setMonths] = useState("12");
  const [annualRate, setAnnualRate] = useState("8");
  const [currentNav, setCurrentNav] = useState("1.5");

  const result = useMemo(() => {
    const amount = parseFloat(monthlyAmount) || 0;
    const period = parseInt(months) || 0;
    const rate = (parseFloat(annualRate) || 0) / 100 / 12; // 月利率
    const nav = parseFloat(currentNav) || 1;

    if (amount <= 0 || period <= 0) return null;

    // 计算总投入
    const totalInvested = amount * period;

    // 计算未来价值 (年金终值公式)
    // FV = PMT * ((1 + r)^n - 1) / r * (1 + r)
    const futureValue = amount * (Math.pow(1 + rate, period) - 1) / rate * (1 + rate);

    // 计算获得份额
    const shares = futureValue / nav;

    // 计算总收益
    const totalReturn = futureValue - totalInvested;
    const returnRate = (totalReturn / totalInvested) * 100;

    // 计算平均成本
    const avgCost = totalInvested / shares;

    return {
      totalInvested,
      futureValue,
      shares,
      totalReturn,
      returnRate,
      avgCost
    };
  }, [monthlyAmount, months, annualRate, currentNav]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          定投计算器
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 输入区域 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                每月定投金额 (元)
              </label>
              <Input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                定投月数
              </label>
              <Input
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                min="1"
                max="360"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.floor(parseInt(months) / 12)} 年 {parseInt(months) % 12} 个月
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                预期年化收益率 (%)
              </label>
              <Input
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                预期未来净值 (可选)
              </label>
              <Input
                type="number"
                value={currentNav}
                onChange={(e) => setCurrentNav(e.target.value)}
                step="0.0001"
                min="0.0001"
              />
            </div>
          </div>

          {/* 结果展示 */}
          {result && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">总投入</p>
                  <p className="text-xl font-mono font-medium">
                    ¥{formatNumber(result.totalInvested)}
                  </p>
                </div>
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">预估总资产</p>
                  <p className="text-xl font-mono font-medium text-green-600">
                    ¥{formatNumber(result.futureValue)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">预估收益</p>
                  <p className="text-xl font-mono font-medium text-fund-up">
                    +¥{formatNumber(result.totalReturn)}
                  </p>
                  <p className="text-sm text-fund-up">
                    +{result.returnRate.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">获得份额</p>
                  <p className="text-xl font-mono font-medium">
                    {formatNumber(result.shares, 2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    平均成本 ¥{result.avgCost.toFixed(4)}
                  </p>
                </div>
              </div>

              {/* 定投说明 */}
              <div className="bg-amber-500/10 p-4 rounded-lg text-sm text-amber-700">
                <p className="font-medium mb-1">💡 定投提示</p>
                <ul className="space-y-1 text-xs">
                  <li>• 年化收益率 {annualRate}% 仅为假设，实际收益可能不同</li>
                  <li>• 定投可以平摊成本，降低择时风险</li>
                  <li>• 建议定投周期至少3年以上</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
