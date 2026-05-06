"use client";

import React, { useMemo, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Helper to get CSS variable value
function getCssVariable(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

interface NavHistoryItem {
  date: string;
  nav: number;
  accumNav: number;
  change?: number;
  changePercent?: number;
}

interface NavHistoryChartProps {
  data: NavHistoryItem[];
  estimateNav?: number;
  estimateTime?: string;
  timeRange?: "1m" | "3m" | "6m" | "1y" | "all";
}

type TimeRangeOption = "1m" | "3m" | "6m" | "1y" | "all";

const TIME_RANGE_OPTIONS: { value: TimeRangeOption; label: string }[] = [
  { value: "1m", label: "1月" },
  { value: "3m", label: "3月" },
  { value: "6m", label: "6月" },
  { value: "1y", label: "1年" },
  { value: "all", label: "全部" },
];

function filterDataByTimeRange(
  data: NavHistoryItem[],
  range: TimeRangeOption
): NavHistoryItem[] {
  if (range === "all" || data.length === 0) {
    return data;
  }

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case "1m":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "3m":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6m":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return data.filter((item) => new Date(item.date) >= cutoffDate);
}

export function NavHistoryChart({
  data,
  estimateNav,
  estimateTime,
  timeRange: initialTimeRange = "3m",
}: NavHistoryChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRangeOption>(initialTimeRange);

  const filteredData = useMemo(() => {
    return filterDataByTimeRange(data, selectedRange);
  }, [data, selectedRange]);

  const chartData = useMemo(() => {
    const dates: string[] = [];
    const navs: number[] = [];
    const changes: number[] = [];

    filteredData.forEach((item) => {
      dates.push(item.date);
      navs.push(item.nav);
      changes.push(item.changePercent || 0);
    });

    // Add estimate point if available and it's today
    if (estimateNav && estimateTime) {
      const today = new Date().toISOString().split("T")[0];
      const lastDataDate = dates[dates.length - 1];
      
      // Only add if estimate is for today and not already in data
      if (estimateTime.startsWith(today) && lastDataDate !== today) {
        dates.push(today);
        navs.push(estimateNav);
        changes.push(0); // Estimate doesn't have change percent
      }
    }

    return { dates, navs, changes };
  }, [filteredData, estimateNav, estimateTime]);

  // Get theme-aware colors for ECharts
  const [themeColors, setThemeColors] = useState({
    foreground: "#1e293b",
    mutedForeground: "#64748b",
    border: "#e2e8f0",
    background: "#ffffff",
  });

  useEffect(() => {
    setThemeColors({
      foreground: getCssVariable("--foreground") || "#1e293b",
      mutedForeground: getCssVariable("--muted-foreground") || "#64748b",
      border: getCssVariable("--border") || "#e2e8f0",
      background: getCssVariable("--background") || "#ffffff",
    });
  }, []);

  const option = useMemo(() => {
    const isPositive =
      chartData.navs.length > 1
        ? chartData.navs[chartData.navs.length - 1] >= chartData.navs[0]
        : true;

    const lineColor = isPositive ? "#F56C6C" : "#67C23A";
    const areaColorStart = isPositive
      ? "rgba(245, 108, 108, 0.3)"
      : "rgba(103, 194, 58, 0.3)";
    const areaColorEnd = isPositive
      ? "rgba(245, 108, 108, 0.05)"
      : "rgba(103, 194, 58, 0.05)";

    return {
      backgroundColor: "transparent",
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "10%",
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: themeColors.background,
        borderColor: themeColors.border,
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          color: themeColors.foreground,
          fontSize: 13,
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const date = chartData.dates[dataIndex];
          const nav = chartData.navs[dataIndex];
          const change = chartData.changes[dataIndex];
          const isEstimate = estimateTime?.startsWith(date) && dataIndex === chartData.dates.length - 1;

          let html = `<div style="font-weight: 600; margin-bottom: 8px; color: ${themeColors.foreground};">${date}</div>`;
          html += `<div style="display: flex; align-items: center; gap: 8px;">`;
          html += `<span style="color: ${themeColors.mutedForeground};">净值:</span>`;
          html += `<span style="font-weight: 600; font-family: monospace; font-size: 14px; color: ${themeColors.foreground};">${nav.toFixed(4)}</span>`;
          if (isEstimate) {
            html += `<span style="background: #3b82f6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">估值</span>`;
          }
          html += `</div>`;

          if (change !== undefined && change !== 0 && !isEstimate) {
            const changeColor = change >= 0 ? "#F56C6C" : "#67C23A";
            const changeSign = change >= 0 ? "+" : "";
            html += `<div style="margin-top: 6px; color: ${changeColor}; font-weight: 500;">`;
            html += `涨跌: ${changeSign}${change.toFixed(2)}%`;
            html += `</div>`;
          }

          return html;
        },
      },
      xAxis: {
        type: "category",
        data: chartData.dates,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: themeColors.border,
          },
        },
        axisLabel: {
          color: themeColors.mutedForeground,
          fontSize: 11,
          formatter: (value: string) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          },
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: themeColors.mutedForeground,
          fontSize: 11,
          formatter: (value: number) => value.toFixed(3),
        },
        splitLine: {
          lineStyle: {
            color: themeColors.border,
            type: "dashed",
          },
        },
      },
      series: [
        {
          name: "净值",
          type: "line",
          data: chartData.navs,
          smooth: true,
          symbol: "circle",
          symbolSize: (_value: number, params: any) => {
            // Highlight estimate point
            const isEstimate =
              estimateTime?.startsWith(chartData.dates[params.dataIndex]) &&
              params.dataIndex === chartData.dates.length - 1;
            return isEstimate ? 10 : 4;
          },
          lineStyle: {
            color: lineColor,
            width: 2,
          },
          itemStyle: {
            color: (params: any) => {
              const isEstimate =
                estimateTime?.startsWith(chartData.dates[params.dataIndex]) &&
                params.dataIndex === chartData.dates.length - 1;
              return isEstimate ? "#3b82f6" : lineColor;
            },
            borderWidth: (params: any) => {
              const isEstimate =
                estimateTime?.startsWith(chartData.dates[params.dataIndex]) &&
                params.dataIndex === chartData.dates.length - 1;
              return isEstimate ? 3 : 2;
            },
            borderColor: themeColors.background,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: areaColorStart },
                { offset: 1, color: areaColorEnd },
              ],
            },
          },
          markPoint: estimateNav
            ? {
                data: [
                  {
                    coord: [
                      chartData.dates[chartData.dates.length - 1],
                      chartData.navs[chartData.navs.length - 1],
                    ],
                    value: "估值",
                    itemStyle: {
                      color: "#3b82f6",
                    },
                    label: {
                      show: true,
                      position: "top",
                      formatter: "估值",
                      fontSize: 10,
                      color: "#3b82f6",
                    },
                  },
                ],
                symbolSize: 0,
              }
            : undefined,
        },
      ],
      animation: true,
      animationDuration: 800,
      animationEasing: "cubicOut",
    };
  }, [chartData, estimateTime, themeColors]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <p>暂无净值历史数据</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {TIME_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={selectedRange === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRange(option.value)}
              className={cn(
                "text-xs px-3 py-1 h-7",
                selectedRange === option.value
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
        {estimateNav && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-background shadow-sm"></span>
            <span className="text-muted-foreground">实时估值: </span>
            <span className="font-mono font-semibold text-foreground">
              {estimateNav.toFixed(4)}
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[320px] w-full">
        <ReactECharts
          option={option}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "canvas" }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#F56C6C] rounded-full"></div>
          <span className="text-xs text-muted-foreground">上涨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#67C23A] rounded-full"></div>
          <span className="text-xs text-muted-foreground">下跌</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-background shadow-sm"></div>
          <span className="text-xs text-muted-foreground">实时估值</span>
        </div>
      </div>
    </div>
  );
}
