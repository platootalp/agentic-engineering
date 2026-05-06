import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToastProvider } from "@/components/ui/toast";
import { QueryClientProvider } from "@/components/query-client-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";

export const metadata: Metadata = {
  title: "Lumira - 基金投资助手",
  description: "面向散户投资者的基金持仓管理应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <QueryClientProvider>
            <AuthProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <AppLayout>
                    <PageTransitionWrapper>{children}</PageTransitionWrapper>
                  </AppLayout>
                </ErrorBoundary>
              </ToastProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
