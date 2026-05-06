"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateHolding, useUpdateHolding } from "@/hooks/use-holdings";
import { useCreateTransaction, useTransactionsByHolding } from "@/hooks/use-transactions";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Minus } from "lucide-react";
import type { TransactionType } from "@/types";

interface TransactionFormProps {
  fundId: string;
  fundName: string;
  holdingId?: string | undefined;
  onSuccess?: () => void;
  onCancel?: () => void;
  onHoldingCreated?: (holdingId: string) => void;
}

/**
 * 交易记录表单
 * 
 * Agent: ui-architect
 */
export function TransactionForm({
  fundId,
  fundName,
  holdingId: existingHoldingId,
  onSuccess,
  onCancel,
  onHoldingCreated
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("BUY");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("");
  const [notes, setNotes] = useState("");

  const amount = shares && price ? parseFloat(shares) * parseFloat(price) : 0;

  // React Query mutations
  const createHolding = useCreateHolding();
  const updateHolding = useUpdateHolding();
  const createTransaction = useCreateTransaction();
  const { data: existingTransactions = [] } = useTransactionsByHolding(existingHoldingId || "");

  const isSubmitting = createHolding.isPending || createTransaction.isPending || updateHolding.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shares || !price) return;

    try {
      let holdingId = existingHoldingId;

      // 如果没有持仓，创建新持仓
      if (!holdingId && type === "BUY") {
        const newHolding = await createHolding.mutateAsync({
          fundId,
          fundName,
          totalShares: 0,
          avgCost: 0,
          totalCost: 0
        });
        holdingId = newHolding.id;
        onHoldingCreated?.(holdingId);
      }

      if (!holdingId) {
        throw new Error("未找到持仓记录");
      }

      // 创建交易记录
      await createTransaction.mutateAsync({
        holdingId,
        fundId,
        fundName,
        type,
        date,
        shares: parseFloat(shares),
        price: parseFloat(price),
        amount,
        fee: fee ? parseFloat(fee) : 0,
        notes
      });

      // 计算新的持仓信息
      const allTransactions = [...existingTransactions];
      if (type === "BUY") {
        allTransactions.push({
          id: "temp",
          holdingId,
          fundId,
          type,
          date,
          shares: parseFloat(shares),
          price: parseFloat(price),
          amount,
          fee: fee ? parseFloat(fee) : 0,
          notes,
          createdAt: new Date()
        } as any);
      }

      const totalShares = allTransactions.reduce((sum: number, tx: any) => {
        return tx.type === "BUY" ? sum + tx.shares : sum - tx.shares;
      }, 0);

      const totalCost = allTransactions
        .filter((tx: any) => tx.type === "BUY")
        .reduce((sum: number, tx: any) => sum + tx.amount, 0);

      const avgCost = totalShares > 0 ? totalCost / totalShares : 0;

      // 更新持仓
      await updateHolding.mutateAsync({
        id: holdingId,
        changes: {
          totalShares,
          avgCost,
          totalCost
        }
      });

      onSuccess?.();
    } catch (error) {
      console.error("添加交易失败:", error);
      alert("添加交易失败: " + (error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加交易记录 - {fundName}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 交易类型 */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              交易类型
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("BUY")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2",
                  type === "BUY"
                    ? "bg-primary/10 border-primary text-primary"
                    : "hover:bg-muted"
                )}
              >
                <Plus className="w-4 h-4" />
                买入
              </button>
              <button
                type="button"
                onClick={() => setType("SELL")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2",
                  type === "SELL"
                    ? "bg-orange-500/10 border-orange-500 text-orange-600"
                    : "hover:bg-muted"
                )}
              >
                <Minus className="w-4 h-4" />
                卖出
              </button>
            </div>
          </div>

          {/* 交易日期 */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              交易日期 <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* 份额和价格 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                份额 <span className="text-destructive">*</span>
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
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                单价 <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.0000"
                step="0.0001"
                min="0.0001"
                required
              />
            </div>
          </div>

          {/* 手续费和备注 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                手续费
              </label>
              <Input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                备注
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="选填"
              />
            </div>
          </div>

          {/* 金额预览 */}
          {amount > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">交易金额:</span>
                <span className="font-medium">
                  {type === "BUY" ? "-" : "+"}¥{amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !shares || !price}
              className={cn(
                "flex-1",
                type === "SELL" && "bg-orange-600 hover:bg-orange-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认添加"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
