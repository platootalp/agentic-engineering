"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHANNEL_OPTIONS } from "@/types/import";
import type { ImportPreviewItem } from "@/types/import";
import { AlertCircle, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportPreviewProps {
  items: ImportPreviewItem[];
  onUpdate: (id: string, updates: Partial<ImportPreviewItem>) => void;
  onRemove: (id: string) => void;
  onImport: () => void;
  isImporting: boolean;
}

export function ImportPreview({
  items,
  onUpdate,
  onRemove,
  onImport,
  isImporting,
}: ImportPreviewProps) {
  const validItems = items.filter((item) => item.valid);
  const invalidItems = items.filter((item) => !item.valid);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{validItems.length}</span> 条有效
          {invalidItems.length > 0 && (
            <span className="text-destructive ml-2">
              ({invalidItems.length} 条有误)
            </span>
          )}
        </div>
        <Button
          onClick={onImport}
          disabled={validItems.length === 0 || isImporting}
        >
          {isImporting ? (
            <>导入中...</>
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              导入 {validItems.length} 条记录
            </>
          )}
        </Button>
      </div>

      <div className="border border-input rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-foreground">
                基金
              </th>
              <th className="px-3 py-2 text-left font-medium text-foreground w-24">
                份额
              </th>
              <th className="px-3 py-2 text-left font-medium text-foreground w-24">
                成本
              </th>
              <th className="px-3 py-2 text-left font-medium text-foreground w-32">
                渠道
              </th>
              <th className="px-3 py-2 text-center font-medium text-foreground w-10">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "hover:bg-muted",
                  !item.valid && "bg-destructive/10"
                )}
              >
                <td className="px-3 py-2">
                  <div className="space-y-1">
                    <Input
                      type="text"
                      value={item.fundName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate(item.id, { fundName: e.target.value })
                      }
                      placeholder="基金名称"
                    />
                    <Input
                      type="text"
                      value={item.fundId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onUpdate(item.id, { fundId: e.target.value })
                      }
                      placeholder="代码"
                      className="w-24"
                    />
                    {!item.valid && item.errors.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="w-3 h-3" />
                        {item.errors.join(", ")}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.totalShares || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate(item.id, {
                        totalShares: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    min="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={item.avgCost || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onUpdate(item.id, {
                        avgCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.0001"
                    min="0"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={item.channel || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      onUpdate(item.id, { channel: e.target.value })
                    }
                    className="w-full h-7 text-sm px-2 bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  >
                    {CHANNEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-1 hover:bg-destructive/20 rounded text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
