"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

/**
 * 错误边界组件
 * 
 * Agent: ui-architect
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("错误边界捕获:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="m-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              出错了
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              组件加载时发生错误，请尝试刷新页面。
            </p>
            {this.state.error && (
              <pre className="bg-muted p-3 rounded text-sm text-gray-700 mb-4 overflow-auto">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset}>
              <RefreshCw className="w-4 h-4 mr-1" />
              重试
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
