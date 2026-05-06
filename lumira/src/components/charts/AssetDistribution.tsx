"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { HoldingWithEstimate } from "@/types";

interface AssetDistributionProps {
  holdings: HoldingWithEstimate[];
}

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const FUND_TYPE_NAMES: Record<string, string> = {
  STOCK: "股票型",
  BOND: "债券型",
  MIX: "混合型",
  INDEX: "指数型",
  QDII: "QDII",
  FOF: "FOF",
  MONEY: "货币型",
};

export function AssetDistribution({ holdings }: AssetDistributionProps) {
  const groupedData = React.useMemo(() => {
    const groups = new Map<string, number>();

    holdings.forEach((holding) => {
      const type = holding.fundType || "OTHER";
      const currentValue = groups.get(type) || 0;
      groups.set(type, currentValue + holding.marketValue);
    });

    const totalValue = Array.from(groups.values()).reduce(
      (sum, value) => sum + value,
      0
    );

    const data: ChartDataItem[] = Array.from(groups.entries())
      .map(([type, value]) => ({
        name: FUND_TYPE_NAMES[type] || "其他",
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return { data, totalValue };
  }, [holdings]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataItem;
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium text-foreground mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            金额: <span className="font-semibold text-foreground">¥{data.value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            占比: <span className="font-semibold text-foreground">{data.percentage.toFixed(2)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const data = entry.payload as ChartDataItem;
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {data.name} ({data.percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (holdings.length === 0 || groupedData.totalValue === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">暂无资产数据</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          添加持仓后将显示资产分布图表
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={groupedData.data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {groupedData.data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">总资产</p>
            <p className="text-lg font-semibold text-foreground">
              ¥{groupedData.totalValue.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">基金类型</p>
            <p className="text-lg font-semibold text-foreground">
              {groupedData.data.length} 种
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
