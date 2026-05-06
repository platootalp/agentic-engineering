import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import {
  FadeInOnScroll,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/fade-in'
import {
  FileText,
  Sparkles,
  Briefcase,
  User,
  Chrome,
  ArrowRight,
  CheckCircle2,
  Download,
  Layers,
  Cpu,
} from 'lucide-react'

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)',
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0) 70%)',
        }}
        animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0) 70%)',
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  )
}

function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent ${className}`}
      style={{ backgroundSize: '200% auto', animation: 'gradient-shift 3s ease infinite' }}
    >
      {children}
      <style>{`@keyframes gradient-shift { 0%, 100% { background-position: 0% center; } 50% { background-position: 100% center; } }`}</style>
    </span>
  )
}

function HeroPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-2xl" />
      <GlassCard className="relative p-6 lg:p-8" glow="primary">
        <div className="flex items-center gap-4 pb-6 border-b border-indigo-100/50">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Briefcase className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <h3 className="font-heading font-bold text-xl text-slate-900">高级前端工程师</h3>
            <p className="text-sm text-slate-500">某知名互联网公司 · 30-50K</p>
          </div>
          <motion.div
            className="ml-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 500 }}
          >
            匹配度 95%
          </motion.div>
        </div>
        <div className="py-6 space-y-3">
          {['精通 React、TypeScript、Node.js', '5年以上大型项目开发经验', '熟悉前端工程化和性能优化'].map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 text-slate-600"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.15 }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="text-sm">{item}</span>
            </motion.div>
          ))}
        </div>
        <motion.div className="pt-4 border-t border-indigo-100/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
          <div className="flex items-center gap-3">
            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100" whileHover={{ scale: 1.02 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </motion.div>
              <span className="text-sm font-semibold text-indigo-700">AI 已匹配 3 段最佳经历</span>
            </motion.div>
            <motion.div className="flex -space-x-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: React.ElementType; title: string; description: string; color: 'indigo' | 'emerald' | 'purple' | 'orange' }) {
  const colorStyles = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/25',
  }
  return (
    <StaggerItem>
      <GlassCard className="h-full p-6 group cursor-pointer" glow="primary">
        <motion.div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorStyles[color]} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`} whileHover={{ rotate: 5 }}>
          <Icon className="h-7 w-7 text-white" />
        </motion.div>
        <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
      </GlassCard>
    </StaggerItem>
  )
}

function TimelineStep({ number, title, description, icon: Icon, isLast }: { number: number; title: string; description: string; icon: React.ElementType; isLast: boolean }) {
  return (
    <div className="relative flex gap-6">
      {!isLast && (
        <motion.div className="absolute left-7 top-16 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-indigo-200 to-transparent" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} style={{ originY: 0 }} />
      )}
      <motion.div className="relative z-10 flex-shrink-0" initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">{number}</div>
      </motion.div>
      <FadeInOnScroll delay={number * 0.1} direction="left" className="flex-1 pb-12">
        <GlassCard className="p-5">
          <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </GlassCard>
      </FadeInOnScroll>
    </div>
  )
}


export default function HomePage() {
  const { isAuthenticated } = useAuthStore()

  const features = [
    { icon: Briefcase, title: 'JD智能解析', description: '支持Chrome插件自动提取、Web端手动输入、OCR图片识别等多种方式添加职位信息', color: 'indigo' as const },
    { icon: User, title: '经历库管理', description: '统一管理教育经历、工作经历、项目经验，随时调用，智能分类整理', color: 'emerald' as const },
    { icon: Sparkles, title: 'AI简历生成', description: '基于JD要求自动匹配最佳经历，AI智能优化描述，突出核心竞争力', color: 'purple' as const },
    { icon: FileText, title: '多格式导出', description: '支持PDF、Word、Markdown多种格式一键导出，适配各种投递场景', color: 'orange' as const },
  ]

  const steps = [
    { title: '安装 Chrome 插件或添加职位JD', description: '通过Chrome插件一键提取招聘网站职位信息，或手动输入JD内容', icon: Chrome },
    { title: '完善个人经历库', description: '添加你的工作、项目、教育经历，建立完整的个人档案', icon: Layers },
    { title: 'AI自动生成针对性简历', description: '选择目标职位，AI智能分析JD要求，自动匹配最佳经历组合', icon: Cpu },
    { title: '导出并投递心仪岗位', description: '一键导出专业简历PDF，直接投递或保存备用', icon: Download },
  ]

  return (
    <div className="relative min-h-screen bg-[#F5F3FF] overflow-hidden">
      <BackgroundOrbs />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </motion.div>
                <span className="text-sm font-semibold text-indigo-700">AI 驱动的简历生成工具</span>
              </motion.div>

              <motion.h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight mb-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <span className="text-slate-900">让 AI 帮你生成</span>
                <br />
                <GradientText className="block mt-2">完美简历</GradientText>
              </motion.h1>

              <motion.p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                基于岗位JD和个人经历，智能生成针对性优化的简历。告别千篇一律，让每一份简历都精准匹配目标岗位。
              </motion.p>

              <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                {isAuthenticated ? (
                  <GradientButton variant="primary" size="lg">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      进入仪表盘 <ArrowRight className="h-4 w-4" />
                    </Link>
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton variant="primary" size="lg">
                      <Link to="/register" className="flex items-center gap-2">
                        免费开始使用 <ArrowRight className="h-4 w-4" />
                      </Link>
                    </GradientButton>
                    <GradientButton variant="outline" size="lg">
                      <Link to="/login">已有账号？登录</Link>
                    </GradientButton>
                  </>
                )}
              </motion.div>
            </div>

            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <HeroPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInOnScroll className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-4">核心功能</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">智能化简历工作流</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">从职位解析到简历生成，提供全流程的智能化求职解决方案</p>
          </FadeInOnScroll>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInOnScroll className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">使用流程</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4">简单四步，快速上手</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">无需复杂操作，几分钟即可生成专业简历</p>
          </FadeInOnScroll>

          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <TimelineStep
                key={index}
                number={index + 1}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Chrome Extension CTA Section */}
      <section className="relative py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <FadeInOnScroll className="flex-1" direction="right">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-3xl blur-2xl" />
                <GlassCard className="relative p-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-200/50 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="ml-4 text-sm text-slate-500">Boss直聘 - 职位详情</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200/50 rounded w-3/4" />
                    <div className="h-4 bg-slate-200/50 rounded w-1/2" />
                    <div className="h-20 bg-slate-200/50 rounded" />
                    <div className="flex justify-end pt-2">
                      <motion.div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/25"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        一键提取到 Regen
                      </motion.div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </FadeInOnScroll>

            <FadeInOnScroll className="flex-1" direction="left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/25">
                <Chrome className="h-10 w-10 text-white" />
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-4">Chrome 插件</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                安装 Chrome 插件，在浏览招聘网站时一键提取职位信息，自动同步到 Regen。
                支持 Boss直聘、脉脉、拉勾、智联招聘、前程无忧等主流招聘平台。
              </p>
              <GradientButton variant="accent" size="lg">
                <span className="flex items-center gap-2">
                  <Chrome className="h-5 w-5" />
                  下载 Chrome 插件
                </span>
              </GradientButton>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeInOnScroll className="text-center max-w-3xl mx-auto">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="h-4 w-4" />
              立即开始你的求职之旅
            </motion.div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-6">准备好生成你的完美简历了吗？</h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              立即注册，体验 AI 驱动的简历生成，让你的求职之路更加顺畅。免费开始使用，无需信用卡。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/dashboard" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    进入仪表盘 <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/register" 
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      免费注册 <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/login" 
                      className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
                    >
                      已有账号？登录
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </FadeInOnScroll>
        </div>
      </section>
    </div>
  )
}
