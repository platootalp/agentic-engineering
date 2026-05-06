"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { UserMenu } from "@/components/user-menu";

export function TopNavigation() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <div className="flex flex-1 items-center">
          <Breadcrumb />
        </div>
        <div className="flex items-center">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
