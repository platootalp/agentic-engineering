"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { HoldingWithEstimate } from "@/types";

interface PortfolioChartProps {
  holdings: HoldingWithEstimate[];
  type: "allocation" | "profit" | "trend";
  className?: string;
}

/**
 * 投资组合图表组件
 * 
 * Agent: ui-architect
 * 使用 ECharts 绘制收益和资产配置图表
 */
export function PortfolioChart({ holdings, type, className }: PortfolioChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || holdings.length === 0) return;

    // 动态导入 ECharts
    const initChart = async () => {
      const echarts = await import("echarts");
      
      if (!chartRef.current) return;
      
      // 销毁旧实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }

      chartInstance.current = echarts.init(chartRef.current);

      let option: any;

      if (type === "allocation") {
        // 资产配置饼图
        const data = holdings.map(h => ({
          name: h.fundName,
          value: h.marketValue
        }));

        option = {
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)"
          },
          legend: {
            type: "scroll",
            orient: "vertical",
            right: 10,
            top: 20,
            bottom: 20,
            textStyle: {
              fontSize: 12
            }
          },
          series: [
            {
              type: "pie",
              radius: ["40%", "70%"],
              center: ["40%", "50%"],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2
              },
              label: {
                show: false,
                position: "center"
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: "bold"
                }
              },
              labelLine: {
                show: false
              },
              data
            }
          ]
        };
      } else if (type === "profit") {
        // 收益对比柱状图
        option = {
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
            containLabel: true
          },
          xAxis: {
            type: "category",
            data: holdings.map(h => h.fundName.slice(0, 8)),
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: {
            type: "value",
            name: "收益率 (%)",
            axisLabel: {
              formatter: "{value}%"
            }
          },
          series: [
            {
              type: "bar",
              data: holdings.map(h => ({
                value: h.profitRate,
                itemStyle: {
                  color: h.profit >= 0 ? "#F56C6C" : "#67C23A"
                }
              })),
              barWidth: "60%"
            }
          ]
        };
      } else {
        // 收益趋势折线图（模拟数据）
        const dates = Array.from({ length: 30 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
        const trendData = dates.map((_, i) => {
          const volatility = 0.02;
          return totalValue * (1 + (Math.random() - 0.5) * volatility * (i / 10));
        });

        option = {
          tooltip: {
            trigger: "axis",
            formatter: (params: any) => {
              const val = params[0].value;
              return `${params[0].axisValue}<br/>总资产: ¥${val.toFixed(2)}`;
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: dates
          },
          yAxis: {
            type: "value",
            scale: true
          },
          series: [
            {
              type: "line",
              data: trendData,
              smooth: true,
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(64, 158, 255, 0.3)" },
                    { offset: 1, color: "rgba(64, 158, 255, 0.05)" }
                  ]
                }
              },
              lineStyle: {
                color: "#409EFF",
                width: 2
              },
              itemStyle: {
                color: "#409EFF"
              }
            }
          ]
        };
      }

      chartInstance.current.setOption(option);
    };

    initChart();

    // 响应式
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.current?.dispose();
    };
  }, [holdings, type]);

  return (
    <div 
      ref={chartRef} 
      className={cn("w-full h-[300px]", className)} 
    />
  );
}
