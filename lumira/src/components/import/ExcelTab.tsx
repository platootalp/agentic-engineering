"use client";

import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { fundDb, holdingDb } from "@/lib/db";
import { ImportPreview } from "./ImportPreview";
import type { ImportPreviewItem } from "@/types/import";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";

interface ExcelTabProps {
  onSuccess?: () => void;
}

interface ParsedRow {
  fundName: string;
  fundCode: string;
  shares: number;
  avgCost: number;
  nav: number | undefined;
  source: string;
}

const COLUMN_MAPPINGS: Record<string, string[]> = {
  fundName: ["基金名称", "产品名称", "名称", "fundName", "name"],
  fundCode: ["基金代码", "产品代码", "代码", "fundCode", "code", "基金代号"],
  shares: ["持有份额", "份额", "持有数量", "数量", "shares", "quantity"],
  avgCost: ["持仓成本价", "成本单价", "成本价", "买入均价", "avgCost", "cost"],
  nav: ["当前净值", "最新净值", "净值", "nav", "单位净值"],
};

export function ExcelTab({ onSuccess }: ExcelTabProps) {
  const { showToast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectPlatform = (headers: string[]): string => {
    const headerStr = headers.join(",").toLowerCase();
    if (headerStr.includes("蚂蚁") || headerStr.includes("ant")) return "ant";
    if (headerStr.includes("支付宝") || headerStr.includes("alipay")) return "alipay";
    if (headerStr.includes("微信") || headerStr.includes("wechat")) return "wechat";
    return "unknown";
  };

  const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().trim();
      for (const name of possibleNames) {
        if (header.includes(name.toLowerCase())) {
          return i;
        }
      }
    }
    return -1;
  };

  const parseExcelFile = useCallback(async (file: File): Promise<ParsedRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];

          if (jsonData.length < 2) {
            reject(new Error("Excel文件为空或格式不正确"));
            return;
          }

          const headers = jsonData[0].map((h) => String(h).trim());
          const platform = detectPlatform(headers);

          const nameIdx = findColumnIndex(headers, COLUMN_MAPPINGS.fundName);
          const codeIdx = findColumnIndex(headers, COLUMN_MAPPINGS.fundCode);
          const sharesIdx = findColumnIndex(headers, COLUMN_MAPPINGS.shares);
          const costIdx = findColumnIndex(headers, COLUMN_MAPPINGS.avgCost);
          const navIdx = findColumnIndex(headers, COLUMN_MAPPINGS.nav);

          if (nameIdx === -1 || codeIdx === -1) {
            reject(new Error("无法识别Excel格式，请确保包含基金名称和代码列"));
            return;
          }

          const rows: ParsedRow[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row[codeIdx]) continue;

            rows.push({
              fundName: String(row[nameIdx] || "").trim(),
              fundCode: String(row[codeIdx] || "").trim(),
              shares: sharesIdx >= 0 ? parseFloat(String(row[sharesIdx])) || 0 : 0,
              avgCost: costIdx >= 0 ? parseFloat(String(row[costIdx])) || 0 : 0,
              nav: navIdx >= 0 ? parseFloat(String(row[navIdx])) || 0 : undefined,
              source: platform,
            });
          }

          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const validateAndConvert = useCallback((rows: ParsedRow[]): ImportPreviewItem[] => {
    return rows.map((row) => {
      const errors: string[] = [];

      if (!row.fundCode || !/^\d{6}$/.test(row.fundCode)) {
        errors.push("基金代码必须是6位数字");
      }

      if (!row.fundName) {
        errors.push("基金名称不能为空");
      }

      if (row.shares <= 0) {
        errors.push("持有份额必须大于0");
      }

      if (row.avgCost <= 0) {
        errors.push("成本单价必须大于0");
      }

      return {
        id: crypto.randomUUID(),
        fundId: row.fundCode,
        fundName: row.fundName,
        totalShares: row.shares,
        avgCost: row.avgCost,
        totalCost: row.shares * row.avgCost,
        valid: errors.length === 0,
        errors,
        rawData: row as unknown as Record<string, unknown>,
      };
    });
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setParseError(null);
      try {
        const rows = await parseExcelFile(file);
        const items = validateAndConvert(rows);
        setPreviewItems(items);
      } catch (error) {
        setParseError((error as Error).message);
      }
    },
    [parseExcelFile, validateAndConvert]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        handleFileSelect(file);
      } else {
        setParseError("请上传Excel文件(.xlsx或.xls)");
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUpdateItem = useCallback((id: string, updates: Partial<ImportPreviewItem>) => {
    setPreviewItems((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        // Re-validate
        const errors: string[] = [];
        if (!updated.fundId || !/^\d{6}$/.test(updated.fundId)) {
          errors.push("基金代码必须是6位数字");
        }
        if (!updated.fundName) {
          errors.push("基金名称不能为空");
        }
        if (updated.totalShares <= 0) {
          errors.push("持有份额必须大于0");
        }
        if (updated.avgCost <= 0) {
          errors.push("成本单价必须大于0");
        }
        updated.valid = errors.length === 0;
        updated.errors = errors;
        updated.totalCost = updated.totalShares * updated.avgCost;
        return updated;
      })
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setPreviewItems((items) => items.filter((item) => item.id !== id));
  }, []);

  const handleImport = useCallback(async () => {
    const validItems = previewItems.filter((item) => item.valid);
    if (validItems.length === 0) return;

    setIsImporting(true);
    try {
      for (const item of validItems) {
        // Save fund info
        const now = new Date();
        await fundDb.put({
          id: item.fundId,
          name: item.fundName,
          type: "MIX",
          riskLevel: "MEDIUM",
          company: "",
          managerId: "",
          nav: 0,
          accumNav: 0,
          navDate: now.toISOString().split("T")[0],
          feeRate: { buy: 0, sell: 0, management: 0 },
          createdAt: now,
          updatedAt: now,
        });

        // Save holding
        await holdingDb.create({
          fundId: item.fundId,
          fundName: item.fundName,
          totalShares: item.totalShares,
          avgCost: item.avgCost,
          totalCost: item.totalCost,
          ...(item.channel ? { channel: item.channel } : {}),
          ...(item.group ? { group: item.group } : {}),
        });
      }

      showToast({
        type: "success",
        title: "导入成功",
        message: `成功导入 ${validItems.length} 条记录`,
      });
      setPreviewItems([]);
      onSuccess?.();
    } catch (error) {
      console.error("导入失败:", error);
      showToast({
        type: "error",
        title: "导入失败",
        message: "导入失败: " + (error as Error).message,
      });
    } finally {
      setIsImporting(false);
    }
  }, [previewItems, onSuccess]);

  return (
    <div className="space-y-4">
      {previewItems.length === 0 ? (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/10"
                : "border-input hover:border-ring hover:bg-muted"
            )}
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              拖拽Excel文件到此处，或点击上传
            </p>
            <p className="text-xs text-muted-foreground/70">
              支持支付宝、微信理财通、蚂蚁财富导出的Excel格式
            </p>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />

          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {parseError}
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-2 text-foreground">支持的格式说明：</p>
            <ul className="space-y-1 text-xs">
              <li>• 支付宝：基金名称、基金代码、持有份额、持仓成本价</li>
              <li>• 微信理财通：产品名称、产品代码、持有数量、成本单价</li>
              <li>• 蚂蚁财富：基金名称、基金代码、持有份额、成本单价</li>
            </ul>
          </div>
        </>
      ) : (
        <ImportPreview
          items={previewItems}
          onUpdate={handleUpdateItem}
          onRemove={handleRemoveItem}
          onImport={handleImport}
          isImporting={isImporting}
        />
      )}
    </div>
  );
}
