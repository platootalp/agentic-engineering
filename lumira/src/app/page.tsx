"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
} from "@/lib/animations";
import {
  Sparkles,
  TrendingUp,
  Wallet,
  Calculator,
  BarChart3,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "资产概览",
    description: "实时跟踪您的投资组合，一目了然查看总资产、累计收益和今日预估收益",
  },
  {
    icon: TrendingUp,
    title: "持仓管理",
    description: "精细化管理每只基金的持仓情况，支持添加、编辑和删除持仓记录",
  },
  {
    icon: Calculator,
    title: "定投计划",
    description: "智能定投计算器，帮助您规划定期定额投资策略，预估未来收益",
  },
  {
    icon: BarChart3,
    title: "数据分析",
    description: "多维度的数据可视化分析，包括资产配置、收益分布和收益走势图表",
  },
];

const highlights = [
  "实时基金估值数据",
  "完整的交易记录管理",
  "基金对比分析工具",
  "基金排行榜查询",
  "Excel 数据导入导出",
  "截图 OCR 智能识别",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/90 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">
                Lumira
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                登录
              </Link>
              <Button asChild size="sm">
                <Link href="/register">注册</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            面向散户投资者的基金持仓管理工具
          </motion.div>
          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            智能管理您的
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              基金投资
            </span>
          </motion.h1>
          <motion.p
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Lumira 帮助您轻松跟踪基金持仓、分析投资收益、制定定投计划，
            让投资决策更加科学和高效。
          </motion.p>
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/register">
                免费开始使用
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/login">已有账户？登录</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">核心功能</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              全方位的基金投资管理工具，满足您从持仓跟踪到收益分析的各种需求
            </p>
          </motion.div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={staggerItem}
                  className="group p-6 bg-background rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.h2
                variants={staggerItem}
                className="text-3xl font-bold text-foreground mb-6"
              >
                为什么选择 Lumira？
              </motion.h2>
              <motion.p
                variants={staggerItem}
                className="text-muted-foreground mb-8 leading-relaxed"
              >
                我们致力于提供最优质的基金投资管理体验，通过实时数据同步、
                智能分析工具和便捷的数据管理功能，帮助您做出更明智的投资决策。
              </motion.p>
              <motion.div
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {highlights.map((item) => (
                  <motion.div
                    key={item}
                    variants={staggerItem}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform rotate-3" />
              <div className="relative bg-background p-8 rounded-3xl border border-border/50 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/90 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">安全可靠</h3>
                    <p className="text-sm text-muted-foreground">您的数据安全是我们的首要任务</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <span className="text-muted-foreground">数据加密存储</span>
                    <CheckCircle className="w-5 h-5 text-fund-down" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <span className="text-muted-foreground">JWT 身份认证</span>
                    <CheckCircle className="w-5 h-5 text-fund-down" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <span className="text-muted-foreground">本地数据备份</span>
                    <CheckCircle className="w-5 h-5 text-fund-down" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-20 bg-gradient-to-br from-blue-600 to-purple-600"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            开始您的基金投资之旅
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            立即注册，免费使用所有功能。无需信用卡，随时随地管理您的投资组合。
          </p>
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base bg-background text-primary hover:bg-primary/10"
          >
            <Link href="/register">
              立即注册
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.section>

      <footer className="py-12 bg-muted text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/90 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">Lumira</span>
            </div>
            <p className="text-sm">
              数据仅供参考，不构成投资建议。市场有风险，投资需谨慎。
            </p>
            <p className="text-sm"> 2024 Lumira. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
