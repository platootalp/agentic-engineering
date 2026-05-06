"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Calculator,
  Trophy,
  GitCompare,
  Upload,
  PanelLeft,
  Sparkles,
  Menu,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "资产概览", href: "/dashboard" },
  { icon: Wallet, label: "持仓明细", href: "/holdings" },
  { icon: TrendingUp, label: "收益分析", href: "/analysis" },
  { icon: Calculator, label: "定投计划", href: "/sip" },
  { icon: Trophy, label: "基金排行", href: "/rankings" },
  { icon: GitCompare, label: "基金对比", href: "/compare" },
  { icon: Upload, label: "数据导入", href: "/import" },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

function NavLink({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
        "hover:bg-accent",
        isActive
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "text-muted-foreground"
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
      {!collapsed && (
        <span className={cn("font-medium text-sm", isActive && "text-primary")}>
          {item.label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border shadow-lg z-50",
          "transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-border",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="ml-3 font-bold text-lg text-foreground">
              Lumira
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={isCollapsed}
              isActive={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleCollapse}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors text-sm",
              !isCollapsed && "justify-start"
            )}
          >
            <PanelLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )}
            />
            {!isCollapsed && <span>收起侧边栏</span>}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="lg:hidden fixed top-4 left-4 z-40 p-2 hover:bg-accent rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 bg-card">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="ml-3 font-bold text-lg text-foreground">
              Lumira
            </span>
          </div>

          <nav className="flex-1 py-4 px-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    "hover:bg-accent",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
