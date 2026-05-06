"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";

const publicRoutes = ["/", "/login", "/register"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">
        <Sidebar
          collapsed={isSidebarCollapsed}
          onCollapse={setIsSidebarCollapsed}
        />
      </div>
      <MobileSidebar />
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-60"
        }`}
      >
        <TopNavigation />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
