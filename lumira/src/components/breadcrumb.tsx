"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "资产概览",
  "/holdings": "持仓明细",
  "/analysis": "收益分析",
  "/sip": "定投计划",
  "/rankings": "基金排行",
  "/compare": "基金对比",
  "/import": "数据导入",
  "/settings": "设置",
  "/profile": "个人信息",
};

export function Breadcrumb() {
  const pathname = usePathname();
  
  if (pathname === "/dashboard") {
    return (
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span className="font-medium text-foreground">资产概览</span>
      </nav>
    );
  }

  const currentLabel = routeLabels[pathname] || "页面";

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="font-medium text-foreground">{currentLabel}</span>
    </nav>
  );
}
