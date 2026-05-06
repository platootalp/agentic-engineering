"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, Search, FileSpreadsheet, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchTab } from "@/components/import/SearchTab";
import { ManualTab } from "@/components/import/ManualTab";
import { ExcelTab } from "@/components/import/ExcelTab";
import { OcrTab } from "@/components/import/OcrTab";
import { ProtectedRoute } from "@/components/auth/protected-route";

type ImportTab = "search" | "manual" | "excel" | "ocr";

interface TabItem {
  key: ImportTab;
  label: string;
  icon: React.ElementType;
}

const tabs: TabItem[] = [
  { key: "search", label: "搜索添加", icon: Search },
  { key: "manual", label: "手动输入", icon: Upload },
  { key: "excel", label: "Excel导入", icon: FileSpreadsheet },
  { key: "ocr", label: "截图识别", icon: Camera },
];

function ImportContent() {
  const [activeTab, setActiveTab] = useState<ImportTab>("search");

  const handleSuccess = () => {
    console.log("Import successful");
  };

  return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">数据导入</h1>
              <p className="text-sm text-muted-foreground">多种方式添加基金持仓</p>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-0">
              <div className="flex space-x-1 p-1 bg-muted rounded-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                        activeTab === tab.key
                          ? "bg-white text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "search" && <SearchTab onSuccess={handleSuccess} />}
              {activeTab === "manual" && <ManualTab onSuccess={handleSuccess} />}
              {activeTab === "excel" && <ExcelTab onSuccess={handleSuccess} />}
              {activeTab === "ocr" && <OcrTab onSuccess={handleSuccess} />}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
  );
}

export default function ImportPage() {
  return (
    <ProtectedRoute>
      <ImportContent />
    </ProtectedRoute>
  );
}
