"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createWorker } from "tesseract.js";
import { fundDb, holdingDb } from "@/lib/db";
import { ImportPreview } from "./ImportPreview";
import type { ImportPreviewItem, OcrMode, BaiduOcrConfig } from "@/types/import";
import { Camera, AlertCircle, Loader2, Cloud, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface OcrTabProps {
  onSuccess?: () => void;
}

const BAIDU_OCR_CONFIG_KEY = "baidu_ocr_config";

export function OcrTab({ onSuccess }: OcrTabProps) {
  const { showToast } = useToast();
  const [mode, setMode] = useState<OcrMode>("client");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(BAIDU_OCR_CONFIG_KEY);
    if (saved) {
      try {
        const config: BaiduOcrConfig = JSON.parse(saved);
        setApiKey(config.apiKey || "");
        setSecretKey(config.secretKey || "");
      } catch {
        // ignore
      }
    }
  }, []);

  const saveBaiduConfig = useCallback(() => {
    const config: BaiduOcrConfig = { apiKey, secretKey };
    localStorage.setItem(BAIDU_OCR_CONFIG_KEY, JSON.stringify(config));
  }, [apiKey, secretKey]);

  const extractFundData = (text: string): ImportPreviewItem[] => {
    const items: ImportPreviewItem[] = [];
    const codePattern = /\b\d{6}\b/g;
    const codeMatches = Array.from(text.matchAll(codePattern));

    for (const match of codeMatches) {
      const code = match[0];
      const codeIndex = match.index || 0;
      const contextStart = Math.max(0, codeIndex - 100);
      const contextEnd = Math.min(text.length, codeIndex + 100);
      const context = text.slice(contextStart, contextEnd);

      let fundName = "";
      const namePattern = /[\u4e00-\u9fa5]{2,20}/g;
      const nameMatches = Array.from(context.matchAll(namePattern));
      if (nameMatches.length > 0) {
        fundName = nameMatches.reduce((longest, m) =>
          m[0].length > longest.length ? m[0] : longest
        , "");
      }

      let shares = 0;
      const sharesMatch = context.match(/份额[:\s]*(\d+\.?\d*)/) || 
                         context.match(/(\d+\.?\d*)\s*份/);
      if (sharesMatch) shares = parseFloat(sharesMatch[1]);

      let cost = 0;
      const costMatch = context.match(/成本[价]?[:\s]*[¥￥]?\s*(\d+\.?\d*)/) ||
                       context.match(/[¥￥]\s*(\d+\.?\d*)\s*元/);
      if (costMatch) cost = parseFloat(costMatch[1]);

      const errors: string[] = [];
      if (!fundName) errors.push("未识别基金名称");
      if (shares <= 0) errors.push("份额无效");
      if (cost <= 0) errors.push("成本无效");

      items.push({
        id: crypto.randomUUID(),
        fundId: code,
        fundName: fundName || `基金${code}`,
        totalShares: shares,
        avgCost: cost,
        totalCost: shares * cost,
        valid: errors.length === 0,
        errors,
        rawData: { context },
      });
    }

    return items;
  };

  const getBaiduAccessToken = async (): Promise<string> => {
    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
      { method: "POST" }
    );
    const data = await response.json();
    if (data.error) throw new Error(data.error_description || "获取AccessToken失败");
    return data.access_token;
  };

  const processWithBaiduOcr = async (base64Image: string): Promise<string> => {
    const accessToken = await getBaiduAccessToken();
    const response = await fetch(
      `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `image=${encodeURIComponent(base64Image)}`,
      }
    );
    const data = await response.json();
    if (data.error_code) throw new Error(data.error_msg || "OCR识别失败");
    return data.words_result.map((w: { words: string }) => w.words).join("\n");
  };

  const processWithTesseract = async (imageUrl: string): Promise<string> => {
    const worker = await createWorker("chi_sim+eng");
    const result = await worker.recognize(imageUrl);
    await worker.terminate();
    return result.data.text;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    setProgress(0);

    try {
      let text = "";

      if (mode === "client") {
        const imageUrl = URL.createObjectURL(file);
        text = await processWithTesseract(imageUrl);
        URL.revokeObjectURL(imageUrl);
      } else {
        if (!apiKey || !secretKey) throw new Error("请先配置百度OCR API密钥");
        saveBaiduConfig();

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });

        setProgress(50);
        text = await processWithBaiduOcr(base64);
        setProgress(100);
      }

      const items = extractFundData(text);
      setPreviewItems(items);
      if (items.length === 0) setError("未识别到基金数据，请尝试上传更清晰的图片");
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<ImportPreviewItem>) => {
    setPreviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (updates.totalShares !== undefined || updates.avgCost !== undefined) {
          updated.totalCost = updated.totalShares * updated.avgCost;
        }
        updated.valid =
          updated.fundId.length === 6 &&
          updated.fundName.length > 0 &&
          updated.totalShares > 0 &&
          updated.avgCost > 0;
        updated.errors = [];
        if (updated.fundId.length !== 6) updated.errors.push("基金代码应为6位");
        if (!updated.fundName) updated.errors.push("基金名称不能为空");
        if (updated.totalShares <= 0) updated.errors.push("份额必须大于0");
        if (updated.avgCost <= 0) updated.errors.push("成本必须大于0");
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setPreviewItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImport = async () => {
    const validItems = previewItems.filter((item) => item.valid);
    if (validItems.length === 0) return;

    setIsImporting(true);
    try {
      for (const item of validItems) {
        await fundDb.put({
          id: item.fundId,
          name: item.fundName,
          type: "MIX",
          riskLevel: "MEDIUM",
          company: "",
          managerId: "",
          nav: 0,
          accumNav: 0,
          navDate: new Date().toISOString().split("T")[0],
          feeRate: { buy: 0, sell: 0, management: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

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

      setPreviewItems([]);
      onSuccess?.();
      showToast({
        type: "success",
        title: "导入成功",
        message: `成功导入 ${validItems.length} 条记录`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "导入失败",
        message: err instanceof Error ? err.message : "导入失败",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setMode("client")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            mode === "client" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Laptop className="w-4 h-4" />
          本地识别
        </button>
        <button
          onClick={() => setMode("cloud")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
            mode === "cloud" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Cloud className="w-4 h-4" />
          百度OCR
        </button>
      </div>

      {mode === "cloud" && (
        <div className="space-y-3 p-4 bg-muted rounded-lg border border-input">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertCircle className="w-4 h-4" />
            百度OCR API配置
          </div>
          <div className="grid gap-3">
            <Input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
            />
            <Input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Secret Key"
            />
          </div>
        </div>
      )}

      {previewItems.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
            isProcessing ? "border-primary/50 bg-primary/5" : "border-input hover:border-ring hover:bg-muted"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
          
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
              <div>
                <p className="text-sm font-medium text-foreground">正在识别...</p>
                <div className="mt-2 w-48 h-2 bg-muted rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{progress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Camera className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">点击上传截图</p>
              <p className="text-xs text-muted-foreground">支持基金持仓截图、交易记录截图等</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {previewItems.length > 0 && (
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
