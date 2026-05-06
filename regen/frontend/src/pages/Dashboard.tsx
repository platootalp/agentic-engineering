import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { jobService } from '@/services/job.service'
import { useCountUp } from '@/hooks/use-count-up'
import type { Job } from '@/types/job'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { FadeIn, FadeInOnScroll, StaggerContainer, StaggerItem } from '@/components/ui/fade-in'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Plus,
  FileText,
  User,
  Settings,
  Sparkles,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
  Chrome,
  TrendingUp,
  Zap,
  Award,
  Clock,
} from 'lucide-react'

interface Stats {
  totalJobs: number
  totalExperiences: number
  totalResumes: number
  usageQuota: number
}

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  gradient: string
  shadowColor: string
}

interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

interface StatCardProps {
  title: string
  value: number
  suffix?: string
  icon: React.ReactNode
  gradient: string
  shadowColor: string
  delay: number
  loading: boolean
}

function StatCard({ title, value, suffix = '', icon, gradient, shadowColor, delay, loading }: StatCardProps) {
  const { formattedCount } = useCountUp({
    end: value,
    duration: 2000,
    delay: delay + 300,
    suffix,
  })

  return (
    <FadeIn delay={delay} direction="up">
      <GlassCard hover glow="primary" className="h-full">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
              <div className="text-3xl font-bold text-slate-900">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                ) : (
                  formattedCount
                )}
              </div>
            </div>
            <motion.div
              className={`w-14 h-14 rounded-2xl ${gradient} flex items-center justify-center text-white shadow-lg ${shadowColor}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              {icon}
            </motion.div>
          </div>
        </div>
      </GlassCard>
    </FadeIn>
  )
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    totalExperiences: 0,
    totalResumes: 0,
    usageQuota: 0,
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: '安装 Chrome 插件', completed: false },
    { id: '2', label: '添加第一个职位', completed: false },
    { id: '3', label: '完善个人经历', completed: false },
    { id: '4', label: '生成第一份简历', completed: false },
  ])

  const quickActions: QuickAction[] = [
    {
      title: '新建职位',
      description: '添加新的职位信息',
      icon: <Plus className="h-6 w-6" />,
      href: '/jobs/create',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-400',
      shadowColor: 'shadow-blue-500/30',
    },
    {
      title: '管理职位',
      description: '查看和管理所有职位',
      icon: <Briefcase className="h-6 w-6" />,
      href: '/jobs',
      gradient: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      shadowColor: 'shadow-indigo-500/30',
    },
    {
      title: '添加经历',
      description: '完善工作经历和项目',
      icon: <User className="h-6 w-6" />,
      href: '/experiences/create',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-400',
      shadowColor: 'shadow-emerald-500/30',
    },
    {
      title: '生成简历',
      description: '基于职位生成定制简历',
      icon: <FileText className="h-6 w-6" />,
      href: '/resumes/create',
      gradient: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
      shadowColor: 'shadow-violet-500/30',
    },
    {
      title: 'Chrome 插件',
      description: '安装浏览器扩展',
      icon: <Chrome className="h-6 w-6" />,
      href: '/extension-guide',
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-400',
      shadowColor: 'shadow-orange-500/30',
    },
    {
      title: '账户设置',
      description: '管理账户偏好设置',
      icon: <Settings className="h-6 w-6" />,
      href: '/settings',
      gradient: 'bg-gradient-to-br from-slate-600 to-slate-400',
      shadowColor: 'shadow-slate-500/30',
    },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const jobsResponse = await jobService.getJobs({ pageSize: 5 })
        setStats({
          totalJobs: jobsResponse.total,
          totalExperiences: 12,
          totalResumes: 5,
          usageQuota: 75,
        })
        setRecentJobs(jobsResponse.data)

        if (jobsResponse.total > 0) {
          setChecklist(prev =>
            prev.map(item =>
              item.id === '2' ? { ...item, completed: true } : item
            )
          )
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const completedCount = checklist.filter(item => item.completed).length
  const progressPercentage = (completedCount / checklist.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome Header */}
          <FadeIn direction="up" duration={0.6}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 sm:p-10">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      欢迎回来，
                      <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                        {user?.first_name || '用户'}
                      </span>
                    </h1>
                    <p className="text-indigo-100 text-lg">
                      今天也是充满机遇的一天，开始打造您的完美简历吧！
                    </p>
                  </div>
                  <GradientButton variant="accent" className="shadow-xl shadow-emerald-500/20">
                    <Sparkles className="h-4 w-4 mr-2" />
                    快速开始
                  </GradientButton>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-white/80">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm">本周新增 {stats.totalJobs} 个职位</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm">AI 已优化 {stats.totalResumes} 份简历</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Award className="h-5 w-5" />
                    <span className="text-sm">使用额度 {stats.usageQuota}%</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="职位总数"
              value={stats.totalJobs}
              icon={<Briefcase className="h-6 w-6" />}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-400"
              shadowColor="shadow-blue-500/30"
              delay={0.1}
              loading={loading}
            />
            <StatCard
              title="经历总数"
              value={stats.totalExperiences}
              icon={<User className="h-6 w-6" />}
              gradient="bg-gradient-to-br from-emerald-500 to-teal-400"
              shadowColor="shadow-emerald-500/30"
              delay={0.2}
              loading={loading}
            />
            <StatCard
              title="简历总数"
              value={stats.totalResumes}
              icon={<FileText className="h-6 w-6" />}
              gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500"
              shadowColor="shadow-violet-500/30"
              delay={0.3}
              loading={loading}
            />
            <StatCard
              title="使用额度"
              value={stats.usageQuota}
              suffix="%"
              icon={<Sparkles className="h-6 w-6" />}
              gradient="bg-gradient-to-br from-amber-500 to-orange-400"
              shadowColor="shadow-amber-500/30"
              delay={0.4}
              loading={loading}
            />
          </div>

          {/* Quick Actions */}
          <FadeInOnScroll delay={0.1}>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-indigo-500" />
                快速操作
              </h2>
              <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
                {quickActions.map((action, index) => (
                  <StaggerItem key={index}>
                    <Link to={action.href} className="block">
                      <GlassCard hover glow="primary" className="h-full group">
                        <div className="p-5">
                          <div className="flex items-start space-x-4">
                            <motion.div
                              className={`${action.gradient} p-3 rounded-xl text-white shadow-lg ${action.shadowColor} group-hover:scale-110 transition-transform duration-300`}
                              whileHover={{ rotate: 5 }}
                            >
                              {action.icon}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-slate-500 mt-1">
                                {action.description}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </GlassCard>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeInOnScroll>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Recent Activity */}
            <FadeInOnScroll delay={0.2}>
              <GlassCard glow="primary" className="h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-500" />
                        最近活动
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">您最近添加的职位</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="hover:bg-indigo-50 hover:text-indigo-600">
                      <Link to="/jobs">查看全部</Link>
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    </div>
                  ) : recentJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="text-slate-500 mb-4">暂无职位记录</p>
                      <GradientButton variant="primary" size="sm">
                        <Link to="/jobs/create">添加第一个职位</Link>
                      </GradientButton>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentJobs.map((job, index) => (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={`/jobs/${job.id}`}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-all group border border-transparent hover:border-indigo-200"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                {job.position}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                {job.companyName}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-slate-400">
                                {new Date(job.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </FadeInOnScroll>

            {/* Getting Started */}
            <FadeInOnScroll delay={0.3}>
              <GlassCard glow="accent" className="h-full">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                        开始使用
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">完成以下步骤开始使用</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        {completedCount}
                      </span>
                      <span className="text-slate-400 text-lg">/{checklist.length}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3">
                    {checklist.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className="flex items-center space-x-3 w-full text-left p-3 rounded-xl hover:bg-white/60 transition-colors group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-6 w-6 text-slate-300 group-hover:text-emerald-400 flex-shrink-0 transition-colors" />
                          )}
                        </motion.div>
                        <span
                          className={`text-sm ${
                            item.completed
                              ? 'text-slate-400 line-through'
                              : 'text-slate-700'
                          }`}
                        >
                          {item.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  {completedCount === checklist.length && (
                    <motion.div
                      className="flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl mt-4 border border-emerald-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-700">
                        恭喜！您已完成所有入门步骤
                      </span>
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </FadeInOnScroll>
          </div>

          {/* User Info Card */}
          <FadeInOnScroll delay={0.4}>
            <GlassCard glow="primary">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30">
                    {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">个人信息</h2>
                    <p className="text-sm text-slate-500">查看和管理您的个人资料信息</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/50">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      名字
                    </label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {user?.first_name || '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/50">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      姓氏
                    </label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">
                      {user?.last_name || '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/50">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      邮箱
                    </label>
                    <p className="text-lg font-semibold text-slate-900 mt-1 truncate">
                      {user?.email || '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/50">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      用户ID
                    </label>
                    <p className="text-sm font-mono text-slate-600 mt-1 truncate">
                      {user?.id || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </FadeInOnScroll>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
