"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatNumber, cn } from "@/lib/utils";
import { 
  Calculator, 
  TrendingUp, 
  Wallet,
  Clock,
  Percent,
  Coins
} from "lucide-react";

export default function SIPPage() {
  const [monthlyAmount, setMonthlyAmount] = useState("1000");
  const [years, setYears] = useState("3");
  const [annualRate, setAnnualRate] = useState("8");

  const result = useMemo(() => {
    const amount = parseFloat(monthlyAmount) || 0;
    const period = (parseInt(years) || 0) * 12; // 转换为月
    const rate = (parseFloat(annualRate) || 0) / 100 / 12; // 月利率

    if (amount <= 0 || period <= 0) return null;

    // 总投入
    const totalInvested = amount * period;

    // 年金终值公式
    const futureValue = amount * (Math.pow(1 + rate, period) - 1) / rate * (1 + rate);

    // 总收益
    const totalReturn = futureValue - totalInvested;
    const returnRate = (totalReturn / totalInvested) * 100;

    return {
      totalInvested,
      futureValue,
      totalReturn,
      returnRate,
      period,
    };
  }, [monthlyAmount, years, annualRate]);

  return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">定投计划</h1>
              <p className="text-sm text-muted-foreground">计算定投收益，制定投资计划</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-500" />
                定投计算器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  每月定投金额 (元)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                  <Input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    className="pl-8 text-lg"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  定投年限
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="pl-10 text-lg"
                    placeholder="3"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {["1", "3", "5", "10"].map((y) => (
                    <button
                      key={y}
                      onClick={() => setYears(y)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-lg transition-colors",
                        years === y
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {y}年
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  预期年化收益率 (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(e.target.value)}
                    className="pl-10 text-lg"
                    placeholder="8"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {["5", "8", "10", "15"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAnnualRate(r)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-lg transition-colors",
                        annualRate === r
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      计算结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-muted rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">投入本金</p>
                        <p className="text-2xl font-bold text-foreground">
                          ¥{formatNumber(result.totalInvested)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {monthlyAmount}元 × {result.period}个月
                        </p>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">预期总资产</p>
                        <p className="text-2xl font-bold text-primary">
                          ¥{formatNumber(result.futureValue)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          定投{years}年后
                        </p>
                      </div>
                      <div className="text-center p-4 bg-[hsl(var(--fund-down)/0.1)] rounded-xl">
                        <p className="text-sm text-muted-foreground mb-1">收益金额</p>
                        <p className="text-2xl font-bold text-[hsl(var(--fund-down))]">
                          +¥{formatNumber(result.totalReturn)}
                        </p>
                        <p className="text-xs text-[hsl(var(--fund-down))] mt-1">
                          +{formatNumber(result.returnRate)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      定投说明
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>定投（定期定额投资）可以平摊成本，降低市场波动风险</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>计算结果基于预期年化收益率，实际收益可能有所不同</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>长期定投（3-5年以上）通常能获得更好的平均收益</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>建议根据自身财务状况选择合适的定投金额</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[300px]">
                <CardContent className="text-center text-muted-foreground">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>请输入定投参数查看计算结果</p>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
      </div>
      </div>
      </div>
  );
}
