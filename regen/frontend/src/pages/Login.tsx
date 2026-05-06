import { Link } from 'react-router-dom'
import { Sparkles, Github, Chrome } from 'lucide-react'

import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { FadeIn } from '@/components/ui/fade-in'
import { LoginForm } from '@/components/auth/LoginForm'

export function LoginPage() {
  // Set page title
  document.title = '登录 - Regen'

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/30 via-transparent to-fuchsia-500/30 blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/30 via-transparent to-indigo-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-12">
        <FadeIn direction="up" duration={0.6}>
          <div className="mx-auto flex w-full flex-col items-center justify-center space-y-8 sm:w-[420px]">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-lg group-hover:bg-white/30 transition-all duration-300" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-lg">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white tracking-tight">Regen</span>
                <span className="text-xs text-white/70">AI智能简历生成器</span>
              </div>
            </Link>

            {/* Glass Card */}
            <GlassCard 
              className="w-full p-8 shadow-2xl shadow-black/20" 
              glow="primary"
              hover={false}
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
                  <p className="text-sm text-gray-500">
                    输入您的邮箱和密码登录账户
                  </p>
                </div>

                {/* Login Form */}
                <LoginForm />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-gray-500">或使用以下方式登录</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <GradientButton
                    variant="outline"
                    className="w-full"
                    onClick={() => {}}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </GradientButton>
                  <GradientButton
                    variant="outline"
                    className="w-full"
                    onClick={() => {}}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </GradientButton>
                </div>
              </div>
            </GlassCard>

            {/* Register Link */}
            <p className="text-center text-sm text-white/80">
              还没有账户？{' '}
              <Link
                to="/register"
                className="font-semibold text-white hover:text-white/90 underline underline-offset-4 transition-colors"
              >
                立即注册
              </Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

export default LoginPage
