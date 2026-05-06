"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHoldings, useCreateHolding } from "@/hooks/use-holdings";
import { useTransactions } from "@/hooks/use-transactions";
import { downloadFile, readFile } from "@/lib/utils";
import { Upload, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { Holding } from "@/types";

interface DataImportExportProps {
  onImportSuccess?: () => void;
}

interface ExportData {
  holdings: Holding[];
  transactions: unknown[];
  exportDate: string;
}

/**
 * 数据导入导出组件
 * 
 * Agent: ui-architect
 */
export function DataImportExport({ onImportSuccess }: DataImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // React Query hooks
  const { data: holdings } = useHoldings();
  const { data: transactionsData } = useTransactions();
  const createHolding = useCreateHolding();

  // 导出 JSON
  const handleExportJSON = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const data: ExportData = {
        holdings: holdings || [],
        transactions: transactionsData?.transactions || [],
        exportDate: new Date().toISOString(),
      };
      const jsonStr = JSON.stringify(data, null, 2);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadFile(jsonStr, `lumira-backup-${timestamp}.json`, "application/json");
      setMessage({ type: "success", text: "数据导出成功！" });
    } catch (error) {
      setMessage({ type: "error", text: "导出失败: " + (error as Error).message });
    } finally {
      setIsExporting(false);
    }
  };

  // 导出 CSV (持仓)
  const handleExportCSV = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const holdingsList = holdings || [];
      
      // 生成持仓 CSV
      const headers = ["基金代码", "基金名称", "持有份额", "平均成本", "总成本", "购买渠道", "分组"];
      const rows = holdingsList.map((h: Holding) => [
        h.fundId,
        h.fundName,
        h.totalShares,
        h.avgCost,
        h.totalCost,
        h.channel || "",
        h.group || ""
      ]);
      
      const csv = [headers.join(","), ...rows.map((r: (string | number)[]) => r.join(","))].join("\n");
      const timestamp = new Date().toISOString().split("T")[0];
      
      // BOM 解决中文乱码
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lumira-holdings-${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: "success", text: "CSV导出成功！" });
    } catch (error) {
      setMessage({ type: "error", text: "导出失败: " + (error as Error).message });
    } finally {
      setIsExporting(false);
    }
  };

  // 导入
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const content = await readFile(file);
      
      if (file.name.endsWith(".json")) {
        // JSON 导入
        const data = JSON.parse(content);
        const holdingsToImport = data.holdings || [];
        
        // Create holdings one by one
        for (const holding of holdingsToImport) {
          await createHolding.mutateAsync({
            fundId: holding.fundId,
            fundName: holding.fundName,
            fundType: holding.fundType || "STOCK",
            totalShares: holding.totalShares,
            avgCost: holding.avgCost,
            totalCost: holding.totalCost,
            ...(holding.channel ? { channel: holding.channel } : {}),
            ...(holding.group ? { group: holding.group } : {}),
          });
        }
        
        setMessage({ type: "success", text: `成功导入 ${holdingsToImport.length} 条持仓数据！` });
        onImportSuccess?.();
      } else if (file.name.endsWith(".csv")) {
        // CSV 导入
        const lines = content.split("\n");
        const headers = lines[0].split(",").map(h => h.trim().replace(/^\ufeff/, ""));
        
        // 解析 CSV
        const holdingsToImport = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(",");
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx]?.trim() || "";
          });
          
          if (row["基金代码"] && row["基金名称"]) {
            const totalShares = parseFloat(row["持有份额"]) || 0;
            const avgCost = parseFloat(row["平均成本"]) || 0;
            const totalCost = parseFloat(row["总成本"]) || (totalShares * avgCost);
            
            holdingsToImport.push({
              fundId: row["基金代码"],
              fundName: row["基金名称"],
              totalShares,
              avgCost,
              totalCost,
              channel: row["购买渠道"] || undefined,
              group: row["分组"] || undefined,
            });
          }
        }
        
        // Create holdings one by one
        for (const holding of holdingsToImport) {
          await createHolding.mutateAsync({
            fundId: holding.fundId,
            fundName: holding.fundName,
            fundType: "STOCK",
            totalShares: holding.totalShares,
            avgCost: holding.avgCost,
            totalCost: holding.totalCost,
            ...(holding.channel ? { channel: holding.channel } : {}),
            ...(holding.group ? { group: holding.group } : {}),
          });
        }
        
        setMessage({ type: "success", text: `成功导入 ${holdingsToImport.length} 条持仓数据！` });
        onImportSuccess?.();
      }
    } catch (error) {
      setMessage({ type: "error", text: "导入失败: " + (error as Error).message });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>数据管理</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 导出区域 */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">导出数据</h4>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileJson className="w-4 h-4" />
              {isExporting ? "导出中..." : "导出JSON"}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {isExporting ? "导出中..." : "导出CSV"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            JSON 包含完整数据，CSV 仅包含持仓信息
          </p>
        </div>

        {/* 分隔线 */}
        <hr className="border-border" />

        {/* 导入区域 */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">导入数据</h4>
          <Input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting || createHolding.isPending}
            className="flex items-center gap-2 w-full justify-center"
          >
            <Upload className="w-4 h-4" />
            {isImporting || createHolding.isPending ? "导入中..." : "选择文件导入 (JSON/CSV)"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            支持从其他基金App导出的数据（需符合格式）
          </p>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg",
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          )}>
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* 格式说明 */}
        <div className="bg-background p-4 rounded-lg">
          <h4 className="text-sm font-medium text-foreground mb-2">CSV 格式要求</h4>
          <p className="text-xs text-muted-foreground mb-2">
            第一行为表头，包含以下字段：
          </p>
          <code className="text-xs bg-muted px-2 py-1 rounded">
            基金代码,基金名称,持有份额,平均成本,总成本,购买渠道,分组
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
