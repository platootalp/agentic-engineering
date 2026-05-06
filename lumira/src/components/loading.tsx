"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string | undefined;
  text?: string | undefined;
  size?: "sm" | "md" | "lg" | undefined;
}

export function Loading({ className, text = "加载中...", size = "md" }: LoadingProps) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2 className={cn("animate-spin text-primary mb-3", sizeMap[size])} />
      {text && <p className="text-muted-foreground">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ className, text }: LoadingProps) {
  return (
    <div className={cn("fixed inset-0 bg-background/80 flex items-center justify-center z-50", className)}>
      <Loading text={text || "加载中..."} size="lg" />
    </div>
  );
}
