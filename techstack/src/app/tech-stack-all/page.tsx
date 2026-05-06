import { Suspense } from 'react'
import { 
  coreFrontendData, 
  coreBackendData,
  coreAIData,
  extendedFrontendData,
  extendedBackendData,
  extendedAIData
} from './data'
import { TechTable, LazySection } from './tech-table'

// 同步加载的核心内容
function CoreContent() {
  return (
    <>
      {/* 头部 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            2025 主流技术栈全景图
          </span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
          前端 · 后端 · AI 开发技术对比
        </p>
      </div>

      {/* 统计卡片 - 轻量级 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">20+</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">前端技术领域</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">5</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">后端语言生态</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">40+</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">AI 技术领域</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">100+</div>
          <div className="text-gray-500 dark:text-gray-400 text-sm">技术工具</div>
        </div>
      </div>
    </>
  )
}

// 前端核心区块 - 首屏渲染
function FrontendCore() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
        <span className="text-2xl">🖥️</span> 前端技术栈 (Frontend)
      </h2>
      <TechTable data={coreFrontendData} title="核心前端技术" />
    </div>
  )
}

// 前端扩展区块 - 延迟加载
function FrontendExtended() {
  return (
    <LazySection delay={100}>
      <TechTable data={extendedFrontendData} title="更多前端技术" collapsible />
    </LazySection>
  )
}

// 后端核心区块
function BackendCore() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
        <span className="text-2xl">⚙️</span> 后端技术栈 (Backend)
      </h2>
      <TechTable data={coreBackendData} title="核心后端框架" />
    </div>
  )
}

// 后端扩展区块
function BackendExtended() {
  return (
    <LazySection delay={200}>
      <TechTable data={extendedBackendData} title="更多后端技术" collapsible />
    </LazySection>
  )
}

// AI核心区块
function AICore() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent flex items-center gap-2">
        <span className="text-2xl">🤖</span> AI 开发技术栈 (AI Development)
      </h2>
      <TechTable data={coreAIData} title="核心AI技术" />
    </div>
  )
}

// AI扩展区块
function AIExtended() {
  return (
    <LazySection delay={300}>
      <TechTable data={extendedAIData} title="更多AI技术" collapsible />
    </LazySection>
  )
}

// 页脚
function Footer() {
  return (
    <div className="text-center mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        💡 提示：技术选型需根据项目需求、团队经验和生态成熟度综合考量
      </p>
    </div>
  )
}

// 页面骨架屏
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部骨架 */}
        <div className="text-center mb-10 animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-md mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded max-w-xl mx-auto"></div>
        </div>
        {/* 卡片骨架 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
        {/* 表格骨架 */}
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
      </div>
    </div>
  )
}

// 主页面 - 使用渐进加载策略
export default function TechStackAllPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* 核心内容 - 立即渲染 */}
          <CoreContent />
          
          {/* 前端核心 - 首屏 */}
          <FrontendCore />
          
          {/* 前端扩展 - 延迟加载 */}
          <FrontendExtended />
          
          {/* 后端核心 - 第二屏 */}
          <BackendCore />
          
          {/* 后端扩展 - 延迟加载 */}
          <BackendExtended />
          
          {/* AI核心 - 第三屏 */}
          <AICore />
          
          {/* AI扩展 - 延迟加载 */}
          <AIExtended />
          
          {/* 页脚 */}
          <Footer />
        </div>
      </div>
    </Suspense>
  )
}
