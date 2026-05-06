/**
 * TechStack Panorama - 技术档案数据库
 * 
 * 完整的技术栈档案数据，包含深度内容和归档状态
 * 所有评分数据来源于 score-data.ts
 */

import type { TechDetail, TechDeepDive, ArchiveReason } from './types'
import { llmAlgorithmData, llmApplicationData } from './llm-data'

// ============================================
// 深度内容定义
// ============================================

const createDeepDive = (
  features: TechDeepDive['features'],
  resources: TechDeepDive['resources'],
  bestPractices: TechDeepDive['bestPractices'],
  comparisons: TechDeepDive['comparisons'],
  useCases: TechDeepDive['useCases']
): TechDeepDive => ({
  features,
  resources,
  bestPractices,
  comparisons,
  useCases
})

// React 深度内容
const reactDeepDive = createDeepDive(
  [
    { title: '组件化架构', description: 'React 采用组件化开发模式，将UI拆分为独立、可复用的组件。每个组件管理自己的状态，通过props进行数据传递，实现高内聚低耦合的代码结构。' },
    { title: '虚拟 DOM', description: '通过虚拟DOM机制，React 在内存中维护一个虚拟的DOM树，通过Diff算法计算最小变更集，批量更新真实DOM，大幅提升渲染性能。' },
    { title: 'Hooks API', description: 'Hooks 让函数组件拥有状态管理能力。useState、useEffect、useContext 等 Hook 提供了强大的功能，同时保持代码的简洁和可测试性。' },
    { title: '并发特性', description: 'React 18 引入并发渲染，允许React中断渲染过程以处理高优先级更新。Suspense、Transitions 等新特性提供更好的用户体验。' }
  ],
  [
    { type: 'official', title: 'React 官方文档', url: 'https://react.dev', description: '最权威的学习资源' },
    { type: 'tutorial', title: 'React 实战教程', url: 'https://react.dev/learn', description: '官方交互式学习路径' },
    { type: 'video', title: 'React Conf', url: 'https://www.youtube.com/reactconf', description: '最新技术动态' },
    { type: 'community', title: 'GitHub Discussions', url: 'https://github.com/reactjs/react.dev/discussions', description: '社区讨论' }
  ],
  [
    { category: '组件设计', items: ['保持组件单一职责', 'Props 向下传递，事件向上传递', '避免过深的组件嵌套', '合理使用 React.memo'] },
    { category: '状态管理', items: ['优先使用本地状态', '使用 Context 避免 Props Drilling', '考虑使用 Zustand/Jotai'] },
    { category: '性能优化', items: ['使用 React DevTools Profiler', '虚拟列表处理大数据', '代码分割和懒加载'] }
  ],
  [
    { techId: 'vue', techName: 'Vue.js', strengths: ['更灵活的模板语法', '学习曲线更平缓', '官方生态更完整'], weaknesses: ['TypeScript 支持不如 React', '大型企业级应用经验相对较少'], whenToChoose: '需要渐进式框架或团队前端经验不统一时' },
    { techId: 'angular', techName: 'Angular', strengths: ['完整的企业级框架', '依赖注入系统', '强类型优先'], weaknesses: ['学习曲线陡峭', '概念繁多复杂'], whenToChoose: '需要企业级完整解决方案时' }
  ],
  [
    { scenario: '大型单页应用(SPA)', description: 'React 的组件化和状态管理能力非常适合复杂的SPA开发', recommended: true },
    { scenario: '跨平台移动应用', description: '配合 React Native 开发 iOS/Android 应用', recommended: true },
    { scenario: '桌面应用', description: '配合 Electron 开发桌面应用', recommended: true },
    { scenario: '简单静态页面', description: '对于简单的营销页面，React 可能过于重量级', recommended: false }
  ]
)

// Vue 深度内容
const vueDeepDive = createDeepDive(
  [
    { title: '响应式系统', description: 'Vue 3 使用 Proxy 实现响应式，自动追踪依赖关系。当数据变化时，自动更新相关视图。' },
    { title: '组合式 API', description: 'Composition API 提供 setup() 函数和一组响应式API，让逻辑复用更加灵活。' },
    { title: '单文件组件(SFC)', description: '.vue 文件将模板、脚本、样式封装在一起，支持 scoped CSS、CSS Modules。' },
    { title: '指令系统', description: 'v-if、v-for、v-model 等内置指令简洁强大，同时支持自定义指令扩展功能。' }
  ],
  [
    { type: 'official', title: 'Vue.js 官方文档', url: 'https://vuejs.org', description: '中文支持优秀' },
    { type: 'tutorial', title: 'Vue Mastery', url: 'https://www.vuemastery.com', description: '高质量视频教程' },
    { type: 'book', title: 'Vue.js 设计与实现', url: 'https://book.vuejs.org', description: '深入理解 Vue 原理' }
  ],
  [
    { category: '项目结构', items: ['按功能组织文件', '提取可复用的 composables', '使用 Pinia 进行状态管理'] }
  ],
  [
    { techId: 'react', techName: 'React', strengths: ['更庞大的生态系统', 'React Native 跨平台', '更多企业采用'], weaknesses: ['需要额外学习 JSX', 'Hooks 规则较复杂'], whenToChoose: '需要最大生态系统或 React Native 时' }
  ],
  [
    { scenario: '渐进式项目升级', description: '可以从简单页面开始，逐步引入复杂功能', recommended: true },
    { scenario: '中小型项目', description: '开箱即用的体验非常适合中小型项目', recommended: true },
    { scenario: '企业级后台系统', description: '配合 Element Plus/Ant Design Vue 快速构建', recommended: true }
  ]
)


// Next.js 深度内容
const nextjsDeepDive = createDeepDive(
  [
    { title: '混合渲染模式', description: '支持 SSR、SSG、ISR、CSR 多种渲染策略，可按页面选择最优方案。App Router 提供 Server Components 支持。' },
    { title: '文件系统路由', description: '基于文件系统的路由约定，pages/index.tsx 自动映射到 /，pages/blog/[slug].tsx 处理动态路由。' },
    { title: 'API Routes', description: 'pages/api/* 自动成为 API 端点，可构建全栈应用。App Router 使用 Route Handlers。' },
    { title: '图像优化', description: '内置 Image 组件自动优化图片，支持懒加载、响应式图片、WebP 转换。' },
    { title: '中间件支持', description: 'Middleware 可以在请求到达页面之前执行逻辑，实现认证、重定向、A/B测试等功能。' }
  ],
  [
    { type: 'official', title: 'Next.js 文档', url: 'https://nextjs.org/docs', description: '详尽的官方文档' },
    { type: 'tutorial', title: 'Next.js Learn', url: 'https://nextjs.org/learn', description: '官方免费课程' },
    { type: 'community', title: 'Next.js Discord', url: 'https://nextjs.org/discord', description: '活跃的社区支持' }
  ],
  [
    { category: '渲染策略', items: ['内容稳定的页面使用 SSG', '用户特定内容使用 SSR', '高频更新的数据使用 ISR', '交互组件使用客户端渲染'] },
    { category: '性能优化', items: ['使用 next/image 优化图片', '动态导入 heavy 组件', '监控 Core Web Vitals'] }
  ],
  [
    { techId: 'nuxtjs', techName: 'Nuxt.js', strengths: ['Vue 生态系统', '更简单的配置', '优秀的模块系统'], weaknesses: ['社区规模较小', '第三方集成相对较少'], whenToChoose: '选择 Vue 作为前端框架时' },
    { techId: 'astro', techName: 'Astro', strengths: ['零 JavaScript 默认', '更好的性能', '支持多框架'], weaknesses: ['生态相对较新', '交互性需要岛屿架构'], whenToChoose: '需要内容优先的网站时' }
  ],
  [
    { scenario: '电商网站', description: 'SEO 友好，支持服务端渲染和静态生成', recommended: true },
    { scenario: '内容网站', description: '博客、文档站点，配合 ISR 实现实时更新', recommended: true },
    { scenario: '全栈应用', description: 'API Routes + 前端，一站式解决方案', recommended: true },
    { scenario: '纯静态展示页', description: '可以使用更轻量的方案如 Astro', recommended: false }
  ]
)

// TypeScript 深度内容
const typescriptDeepDive = createDeepDive(
  [
    { title: '静态类型检查', description: '在编译时捕获类型错误，避免运行时错误。IDE 提供智能提示和自动补全。' },
    { title: '高级类型系统', description: '支持泛型、联合类型、交叉类型、条件类型、映射类型等高级特性。' },
    { title: '类型推断', description: '强大的类型推断能力，在很多情况下无需显式注解类型，代码依然类型安全。' },
    { title: '装饰器支持', description: '实验性支持装饰器语法，常用于 Angular、NestJS 等框架。' }
  ],
  [
    { type: 'official', title: 'TypeScript 文档', url: 'https://www.typescriptlang.org', description: '官方手册' },
    { type: 'book', title: 'TypeScript 入门教程', url: 'https://ts.xcatliu.com', description: '中文入门教程' }
  ],
  [
    { category: '类型定义', items: ['优先使用 interface 定义对象类型', '使用 type 定义联合/交叉类型', '避免使用 any'] },
    { category: '项目配置', items: ['启用 strict 模式', '配置合理的 tsconfig.json', '使用绝对路径导入'] }
  ],
  [
    { techId: 'javascript', techName: 'JavaScript', strengths: ['无需编译', '更快的开发速度', '更低的入门门槛'], weaknesses: ['运行时错误难以发现', '重构困难', '大型项目维护成本高'], whenToChoose: '极小型项目或快速原型' }
  ],
  [
    { scenario: '大型前端项目', description: '团队协作、代码可维护性的最佳选择', recommended: true },
    { scenario: 'Node.js 后端', description: '类型安全的服务端开发', recommended: true },
    { scenario: '工具库开发', description: '为使用者提供类型定义', recommended: true },
    { scenario: '简单脚本', description: '可以使用 JavaScript 快速编写', recommended: false }
  ]
)

// Tailwind CSS 深度内容
const tailwindcssDeepDive = createDeepDive(
  [
    { title: '原子化 CSS', description: '提供大量实用类，直接在 HTML 中组合使用，无需编写自定义 CSS。' },
    { title: '响应式设计', description: '内置断点前缀（sm:, md:, lg: 等），轻松实现响应式布局。' },
    { title: '主题定制', description: '通过 tailwind.config.js 完全定制设计系统：颜色、字体、间距等。' },
    { title: 'JIT 引擎', description: 'Just-In-Time 编译器按需生成样式，开发速度快，产物体积小。' }
  ],
  [
    { type: 'official', title: 'Tailwind CSS 文档', url: 'https://tailwindcss.com', description: '完整的类名参考' },
    { type: 'tutorial', title: 'Tailwind Labs', url: 'https://www.youtube.com/tailwindlabs', description: '官方视频教程' }
  ],
  [
    { category: '类名管理', items: ['使用 @apply 提取重复模式', '配置自定义主题', '使用插件扩展功能'] },
    { category: '性能优化', items: ['启用 JIT 模式', '配置 content 路径', '使用 purgecss'] }
  ],
  [
    { techId: 'bootstrap', techName: 'Bootstrap', strengths: ['组件丰富', '文档完善', '上手简单'], weaknesses: ['样式难以定制', '所有站点看起来相似', '体积较大'], whenToChoose: '需要快速原型或简单后台时' }
  ],
  [
    { scenario: '现代 Web 应用', description: '快速构建自定义设计系统', recommended: true },
    { scenario: '设计系统实现', description: '与设计稿完美匹配', recommended: true },
    { scenario: '快速原型', description: '比传统 CSS 更快构建界面', recommended: true },
    { scenario: '小型静态页面', description: '传统 CSS 可能更简单', recommended: false }
  ]
)


// Vite 深度内容
const viteDeepDive = createDeepDive(
  [
    { title: '极速冷启动', description: '基于原生 ESM，无需打包，开发服务器启动速度极快。' },
    { title: '即时热更新', description: '精确的 HMR，模块更新速度快，保持应用状态不丢失。' },
    { title: '优化的构建', description: '使用 Rollup 进行生产构建，支持代码分割和 tree-shaking。' },
    { title: '丰富的插件生态', description: '兼容 Rollup 插件，官方提供 Vue、React、Svelte 等插件。' }
  ],
  [
    { type: 'official', title: 'Vite 文档', url: 'https://vitejs.dev', description: '中文文档优秀' },
    { type: 'community', title: 'Vite GitHub', url: 'https://github.com/vitejs/vite', description: '问题反馈和讨论' }
  ],
  [
    { category: '配置优化', items: ['配置 alias 路径别名', '优化依赖预构建', '配置环境变量'] },
    { category: '生产构建', items: ['配置 rollup 选项', '优化 chunk 分割', '开启 gzip/brotli 压缩'] }
  ],
  [
    { techId: 'webpack', techName: 'Webpack', strengths: ['生态系统最成熟', 'Loader/Plugin 丰富', '企业采用率高'], weaknesses: ['配置复杂', '构建速度慢', '学习曲线陡峭'], whenToChoose: '需要复杂构建流程或遗留项目时' }
  ],
  [
    { scenario: '现代前端项目', description: 'Vue、React 等新项目的最佳选择', recommended: true },
    { scenario: '快速原型开发', description: '几秒钟启动开发服务器', recommended: true },
    { scenario: '大型项目优化', description: '生产构建优化效果显著', recommended: true },
    { scenario: '遗留项目迁移', description: '可能需要大量配置调整', recommended: false }
  ]
)

// Angular 深度内容
const angularDeepDive = createDeepDive(
  [
    { title: '完整框架', description: '内置路由、表单、HTTP客户端、动画等，开箱即用。' },
    { title: '依赖注入', description: '强大的 DI 系统，便于测试和代码复用。' },
    { title: 'TypeScript 优先', description: '框架本身使用 TypeScript 编写，类型支持优秀。' },
    { title: 'RxJS 集成', description: '内置响应式编程支持，适合复杂的异步操作。' }
  ],
  [
    { type: 'official', title: 'Angular 文档', url: 'https://angular.io', description: '详尽的官方指南' },
    { type: 'tutorial', title: 'Angular University', url: 'https://angular-university.io', description: '高质量课程' }
  ],
  [
    { category: '架构设计', items: ['使用模块化组织代码', '智能组件和展示组件分离', '使用服务共享状态'] },
    { category: '性能优化', items: ['使用 OnPush 变更检测', '懒加载模块', '服务端渲染(Universal)'] }
  ],
  [
    { techId: 'react', techName: 'React', strengths: ['更灵活的生态系统', '更轻量', '更多第三方库'], weaknesses: ['需要自己选择路由/状态管理', '缺乏官方最佳实践'], whenToChoose: '需要灵活架构时' }
  ],
  [
    { scenario: '大型企业应用', description: '完整解决方案，规范性强', recommended: true },
    { scenario: '团队经验统一', description: '强约束确保代码质量', recommended: true },
    { scenario: '快速原型', description: '学习曲线陡峭，不适合快速开发', recommended: false },
    { scenario: '小型项目', description: '过于重量级', recommended: false }
  ]
)

// Astro 深度内容
const astroDeepDive = createDeepDive(
  [
    { title: '零 JS 默认', description: '页面默认不加载 JavaScript，只有在需要交互的组件才加载。' },
    { title: '岛屿架构', description: '将页面拆分为静态内容和交互式岛屿，优化性能。' },
    { title: '多框架支持', description: '可以在同一个项目中使用 React、Vue、Svelte 等组件。' },
    { title: '内容集合', description: '内置对 Markdown、MDX 的支持，适合内容网站。' }
  ],
  [
    { type: 'official', title: 'Astro 文档', url: 'https://docs.astro.build', description: '详尽的文档' },
    { type: 'community', title: 'Astro Discord', url: 'https://astro.build/chat', description: '友好的社区' }
  ],
  [
    { category: '性能优化', items: ['使用 Islands 架构', '优化图片加载', '预获取关键资源'] },
    { category: '内容管理', items: ['使用 Content Collections', '配置 MDX 支持', '集成 CMS'] }
  ],
  [
    { techId: 'nextjs', techName: 'Next.js', strengths: ['更大的生态系统', 'React 优先', '更多企业采用'], weaknesses: ['默认加载更多 JS', '学习曲线更陡'], whenToChoose: '需要丰富交互功能时' }
  ],
  [
    { scenario: '内容网站', description: '博客、文档、营销页面', recommended: true },
    { scenario: '性能敏感应用', description: 'Core Web Vitals 优秀', recommended: true },
    { scenario: '电商展示', description: '快速加载的商品页面', recommended: true },
    { scenario: '复杂 Web 应用', description: '需要大量客户端交互', recommended: false }
  ]
)

// NestJS 深度内容
const nestjsDeepDive = createDeepDive(
  [
    { title: '企业级架构', description: '受 Angular 启发，提供模块化、依赖注入、装饰器等特性。' },
    { title: 'TypeScript 优先', description: '原生支持 TypeScript，类型安全，开发体验好。' },
    { title: '丰富的生态', description: '官方支持 GraphQL、WebSocket、微服务、队列等。' },
    { title: '可扩展性', description: '基于 Express/Fastify，可自定义底层平台。' }
  ],
  [
    { type: 'official', title: 'NestJS 文档', url: 'https://docs.nestjs.com', description: '详尽的官方文档' },
    { type: 'tutorial', title: 'NestJS 中文文档', url: 'https://docs.nestjs.cn', description: '中文社区翻译' }
  ],
  [
    { category: '架构设计', items: ['使用模块化组织代码', '使用 DTO 进行数据验证', '使用拦截器/守卫实现横切关注点'] },
    { category: '性能优化', items: ['使用 Fastify 适配器', '启用缓存', '数据库连接池'] }
  ],
  [
    { techId: 'express', techName: 'Express', strengths: ['轻量简单', '生态系统最大', '学习曲线平缓'], weaknesses: ['缺乏架构约束', '容易写出混乱代码', 'TypeScript 支持需配置'], whenToChoose: '小型项目或快速原型时' }
  ],
  [
    { scenario: '企业级后端', description: '大型 Node.js 应用的首选', recommended: true },
    { scenario: 'API 服务', description: 'RESTful API 和 GraphQL API', recommended: true },
    { scenario: '微服务', description: '内置微服务支持', recommended: true },
    { scenario: '简单脚本', description: '过于重量级', recommended: false }
  ]
)


// FastAPI 深度内容
const fastapiDeepDive = createDeepDive(
  [
    { title: '高性能异步', description: '基于 Starlette 和 Pydantic，支持异步请求处理，性能优秀。' },
    { title: '自动 API 文档', description: '自动生成 OpenAPI 文档和 Swagger UI，无需额外配置。' },
    { title: '数据验证', description: '基于 Pydantic，自动进行请求/响应数据的验证和序列化。' },
    { title: '类型提示', description: '完全基于 Python 类型提示，IDE 支持友好。' }
  ],
  [
    { type: 'official', title: 'FastAPI 文档', url: 'https://fastapi.tiangolo.com', description: '优秀的中文文档' },
    { type: 'tutorial', title: 'FastAPI 教程', url: 'https://fastapi.tiangolo.com/tutorial/', description: '官方教程' }
  ],
  [
    { category: '项目结构', items: ['使用依赖注入系统', '合理组织路由', '使用后台任务处理耗时操作'] },
    { category: '生产部署', items: ['使用 Gunicorn + Uvicorn', '配置 Nginx 反向代理', '使用 Docker 部署'] }
  ],
  [
    { techId: 'django', techName: 'Django', strengths: ['功能最完整', 'admin 后台强大', '生态系统成熟'], weaknesses: ['性能相对较低', '同步为主', '学习曲线陡峭'], whenToChoose: '需要快速开发完整功能的后台时' }
  ],
  [
    { scenario: '高性能 API', description: '需要异步处理的现代 API 服务', recommended: true },
    { scenario: '机器学习服务', description: '与 ML 库集成方便', recommended: true },
    { scenario: '实时应用', description: '配合 WebSocket 处理实时数据', recommended: true },
    { scenario: '传统 CMS', description: 'Django 的 admin 更适合', recommended: false }
  ]
)

// Django 深度内容
const djangoDeepDive = createDeepDive(
  [
    { title: '全功能框架', description: '包含 ORM、admin、认证、表单等，开箱即用。' },
    { title: 'admin 后台', description: '自动生成强大的后台管理界面，节省开发时间。' },
    { title: '安全特性', description: '内置防护 CSRF、XSS、SQL 注入等安全威胁。' },
    { title: '生态系统', description: '丰富的第三方包，Django REST framework 等。' }
  ],
  [
    { type: 'official', title: 'Django 文档', url: 'https://docs.djangoproject.com', description: '详尽的官方文档' },
    { type: 'tutorial', title: 'Django Girls', url: 'https://tutorial.djangogirls.org', description: '适合初学者的教程' }
  ],
  [
    { category: '项目结构', items: ['使用 Django REST framework 构建 API', '配置 Celery 处理异步任务', '使用缓存框架'] },
    { category: '性能优化', items: ['使用 select_related/prefetch_related', '配置数据库索引', '使用 Redis 缓存'] }
  ],
  [
    { techId: 'fastapi', techName: 'FastAPI', strengths: ['性能更好', '异步支持', '类型提示'], weaknesses: ['生态相对较小', '缺乏 admin 后台'], whenToChoose: '需要高性能异步 API 时' }
  ],
  [
    { scenario: '内容管理系统', description: 'admin 后台强大，适合 CMS 开发', recommended: true },
    { scenario: '电商网站', description: '完整的用户、订单、支付管理', recommended: true },
    { scenario: '企业后台', description: '快速开发管理后台', recommended: true },
    { scenario: '高并发 API', description: 'FastAPI 更适合异步场景', recommended: false }
  ]
)

// Spring Boot 深度内容
const springBootDeepDive = createDeepDive(
  [
    { title: '自动配置', description: '根据类路径自动配置 Spring 应用，大幅减少样板代码。' },
    { title: '内嵌服务器', description: '内置 Tomcat/Jetty/Undertow，无需部署 WAR 文件。' },
    { title: 'Actuator 监控', description: '提供生产级监控和管理端点。' },
    { title: 'Spring 生态', description: '与 Spring Cloud、Spring Security 等无缝集成。' }
  ],
  [
    { type: 'official', title: 'Spring 文档', url: 'https://spring.io/guides', description: '官方指南' },
    { type: 'tutorial', title: 'Baeldung', url: 'https://www.baeldung.com', description: '高质量教程' }
  ],
  [
    { category: '架构设计', items: ['使用分层架构', '配置多环境', '使用 Spring Profiles'] },
    { category: '生产优化', items: ['配置连接池', '使用缓存', '配置健康检查'] }
  ],
  [
    { techId: 'quarkus', techName: 'Quarkus', strengths: ['启动更快', '内存占用低', '云原生'], weaknesses: ['生态较新', '企业采用率低'], whenToChoose: '云原生/Kubernetes 环境' }
  ],
  [
    { scenario: '企业级应用', description: 'Java 企业开发的标准选择', recommended: true },
    { scenario: '微服务架构', description: '配合 Spring Cloud 使用', recommended: true },
    { scenario: '传统单体应用', description: '适合大型单体项目', recommended: true },
    { scenario: 'Serverless', description: 'Quarkus 更适合冷启动场景', recommended: false }
  ]
)


// Svelte 深度内容
const svelteDeepDive = createDeepDive(
  [
    { title: '编译时优化', description: '在构建时将组件编译为高效的命令式代码，无虚拟DOM开销。' },
    { title: '真正的响应式', description: '使用赋值语句即可触发更新，无需 setState 或 ref。' },
    { title: '内置功能', description: '内置动画、过渡、存储等，无需额外库。' },
    { title: 'SvelteKit', description: '官方元框架，提供路由、服务端渲染等功能。' }
  ],
  [
    { type: 'official', title: 'Svelte 教程', url: 'https://svelte.dev/tutorial', description: '交互式学习' },
    { type: 'official', title: 'SvelteKit 文档', url: 'https://kit.svelte.dev', description: '元框架文档' }
  ],
  [
    { category: '性能优化', items: ['利用编译优化', '使用存储管理状态', '代码分割'] },
    { category: '开发体验', items: ['使用 VS Code 插件', '配置 ESLint', '使用 TypeScript'] }
  ],
  [
    { techId: 'react', techName: 'React', strengths: ['生态系统更大', '更多工作机会', '企业采用率高'], weaknesses: ['虚拟 DOM 开销', '需要更多样板代码'], whenToChoose: '需要稳定生态系统时' }
  ],
  [
    { scenario: '性能敏感应用', description: '编译优化带来更小的包体积', recommended: true },
    { scenario: '嵌入式组件', description: '可以作为 Web Components 使用', recommended: true },
    { scenario: '数据可视化', description: '流畅的动画和过渡效果', recommended: true },
    { scenario: '大型团队项目', description: '招聘和生态可能受限', recommended: false }
  ]
)

// Hono 深度内容
const honoDeepDive = createDeepDive(
  [
    { title: '极致轻量', description: '核心仅数KB，但功能完整，适合边缘计算。' },
    { title: '多平台支持', description: '支持 Cloudflare Workers、Deno、Bun、Node.js 等。' },
    { title: 'TypeScript 优先', description: '类型安全的路由定义，开发体验优秀。' },
    { title: '中间件系统', description: '类似 Express 的中间件，易于理解和使用。' }
  ],
  [
    { type: 'official', title: 'Hono 文档', url: 'https://hono.dev', description: '官方文档' },
    { type: 'community', title: 'Hono Discord', url: 'https://discord.gg/hono', description: '社区支持' }
  ],
  [
    { category: '性能优化', items: ['利用边缘计算', '最小化依赖', '使用缓存'] },
    { category: '部署', items: ['部署到 Cloudflare Workers', '使用 Deno Deploy', 'Docker 部署'] }
  ],
  [
    { techId: 'express', techName: 'Express', strengths: ['生态系统最成熟', '学习资源丰富', '企业采用率高'], weaknesses: ['TypeScript 支持需配置', '性能相对较低'], whenToChoose: '传统 Node.js 项目' }
  ],
  [
    { scenario: '边缘计算', description: 'Cloudflare Workers、Deno Deploy 等', recommended: true },
    { scenario: '无服务器函数', description: 'Vercel、Netlify Functions', recommended: true },
    { scenario: '高性能 API', description: '轻量级带来低延迟', recommended: true },
    { scenario: '复杂业务逻辑', description: 'NestJS 更适合', recommended: false }
  ]
)

// Gin 深度内容
const ginDeepDive = createDeepDive(
  [
    { title: '高性能', description: '基于 httprouter，路由性能优秀，内存占用低。' },
    { title: '中间件支持', description: '类似 Express 的中间件链，支持全局和路由级中间件。' },
    { title: 'JSON 验证', description: '内置请求解析和验证，支持 JSON、XML、表单等。' },
    { title: '错误管理', description: '方便的错误处理和恢复机制。' }
  ],
  [
    { type: 'official', title: 'Gin GitHub', url: 'https://github.com/gin-gonic/gin', description: '官方仓库和文档' },
    { type: 'tutorial', title: 'Gin 示例', url: 'https://github.com/gin-gonic/examples', description: '官方示例代码' }
  ],
  [
    { category: '项目结构', items: ['使用 MVC 分层', '使用中间件处理横切关注点', '配置优雅关机'] },
    { category: '性能优化', items: ['使用 sync.Pool 复用对象', '配置 pprof 分析', '优化 GC'] }
  ],
  [
    { techId: 'echo', techName: 'Echo', strengths: ['功能更丰富', '官方中间件更多', '文档更完善'], weaknesses: ['性能略低', '社区规模稍小'], whenToChoose: '需要更多内置功能时' }
  ],
  [
    { scenario: '高性能 API', description: 'Go 的高性能适合高并发 API', recommended: true },
    { scenario: '微服务', description: '轻量级适合微服务架构', recommended: true },
    { scenario: '企业级应用', description: 'Go-Zero 功能更完整', recommended: false }
  ]
)


// Nuxt.js 深度内容
const nuxtjsDeepDive = createDeepDive(
  [
    { title: '约定优于配置', description: '自动路由、自动导入，开发效率高。' },
    { title: '渲染模式', description: '支持 SSR、SSG、CSR，可按路由配置。' },
    { title: '模块生态', description: '丰富的 Nuxt 模块，快速集成各种功能。' },
    { title: 'Nitro 引擎', description: '新的服务端引擎，支持多种部署目标。' }
  ],
  [
    { type: 'official', title: 'Nuxt 文档', url: 'https://nuxt.com', description: 'Nuxt 3 文档' },
    { type: 'community', title: 'Nuxt 模块', url: 'https://nuxt.com/modules', description: '官方模块库' }
  ],
  [
    { category: '开发', items: ['使用组合式函数', '配置 TypeScript', '使用 Nuxt DevTools'] },
    { category: '部署', items: ['配置 Nitro 预设', '使用 Vercel/Netlify', 'Docker 部署'] }
  ],
  [
    { techId: 'nextjs', techName: 'Next.js', strengths: ['React 生态更大', 'Vercel 优先支持', '企业采用率高'], weaknesses: ['Vue 开发者需学习 React'], whenToChoose: '选择 React 作为框架时' }
  ],
  [
    { scenario: 'Vue 全栈应用', description: 'Vue 生态的 Next.js 替代品', recommended: true },
    { scenario: '内容网站', description: '配合 Nuxt Content 使用', recommended: true },
    { scenario: '电商平台', description: 'SEO 友好的电商方案', recommended: true },
    { scenario: '非 Vue 项目', description: '需要 Vue 作为基础', recommended: false }
  ]
)

// Go-Zero 深度内容
const goZeroDeepDive = createDeepDive(
  [
    { title: '微服务框架', description: '内置服务发现、负载均衡、熔断降级等微服务特性。' },
    { title: '代码生成', description: '通过 api 文件生成服务端代码，提高开发效率。' },
    { title: '高性能', description: '优化的 HTTP 和 RPC 性能，适合高并发场景。' },
    { title: '工具链', description: '提供 goctl 工具，快速生成项目和代码。' }
  ],
  [
    { type: 'official', title: 'Go-Zero 文档', url: 'https://go-zero.dev', description: '中文文档优秀' },
    { type: 'tutorial', title: 'Go-Zero 示例', url: 'https://github.com/zeromicro/zero-examples', description: '官方示例' }
  ],
  [
    { category: '微服务', items: ['使用 etcd 做服务发现', '配置熔断和限流', '链路追踪'] },
    { category: '性能', items: ['优化连接池', '使用缓存', '配置合理的超时'] }
  ],
  [
    { techId: 'gin', techName: 'Gin', strengths: ['更简单轻量', '学习曲线平缓', '社区更大'], weaknesses: ['缺乏微服务特性', '需自行实现服务治理'], whenToChoose: '单体应用或简单 API' }
  ],
  [
    { scenario: '微服务架构', description: '内置完整的微服务支持', recommended: true },
    { scenario: '高并发系统', description: '优化的性能和限流机制', recommended: true },
    { scenario: '快速开发', description: '代码生成提高效率', recommended: true },
    { scenario: '小型项目', description: 'Gin 更简单', recommended: false }
  ]
)

// Quarkus 深度内容
const quarkusDeepDive = createDeepDive(
  [
    { title: '云原生 Java', description: '为 Kubernetes 和 Serverless 优化的 Java 框架。' },
    { title: '快速启动', description: 'GraalVM 原生镜像支持，毫秒级启动。' },
    { title: '低内存', description: '优化的内存使用，适合容器环境。' },
    { title: '开发模式', description: '实时重载，开发体验优秀。' }
  ],
  [
    { type: 'official', title: 'Quarkus 文档', url: 'https://quarkus.io/guides', description: '官方指南' },
    { type: 'community', title: 'Quarkus GitHub', url: 'https://github.com/quarkusio/quarkus', description: '源代码' }
  ],
  [
    { category: '云原生', items: ['配置 Kubernetes 扩展', '使用 GraalVM 构建原生镜像', '配置健康检查'] },
    { category: '性能', items: ['使用 Mutiny 响应式编程', '配置连接池', '启用缓存'] }
  ],
  [
    { techId: 'spring-boot', techName: 'Spring Boot', strengths: ['生态系统最成熟', '企业采用率最高', '学习资源丰富'], weaknesses: ['启动较慢', '内存占用较高'], whenToChoose: '传统企业应用' }
  ],
  [
    { scenario: 'Serverless', description: '快速启动适合函数计算', recommended: true },
    { scenario: 'Kubernetes', description: '云原生优化设计', recommended: true },
    { scenario: '微服务', description: '内置微服务支持', recommended: true },
    { scenario: '传统企业应用', description: 'Spring Boot 生态更成熟', recommended: false }
  ]
)

// ============================================
// 已归档技术（示例）
// ============================================

const axumDeepDive = createDeepDive(
  [
    { title: 'Tower 生态系统', description: '基于 Tower 构建，与 Rust 异步生态深度集成。' },
    { title: '类型安全路由', description: '利用 Rust 类型系统，编译时保证路由安全。' }
  ],
  [
    { type: 'official', title: 'Axum 文档', url: 'https://docs.rs/axum', description: 'API 文档' }
  ],
  [
    { category: '开发', items: ['使用 Tower Service', '配置中间件', '处理错误'] }
  ],
  [
    { techId: 'actix-web', techName: 'Actix-web', strengths: ['性能极高', '历史悠久'], weaknesses: ['维护者变动', '社区活跃度下降'], whenToChoose: 'Actix-web 目前更成熟' }
  ],
  [
    { scenario: 'Rust Web 开发', description: '目前被 Actix-web 替代中', recommended: false }
  ]
)


// ============================================
// 技术数据库
// ============================================

export const techDatabase: Record<string, TechDetail> = {
  // ===== Frontend Technologies =====
  react: {
    id: 'react',
    name: 'React',
    category: 'frontend',
    subcategory: '框架',
    description: '用于构建用户界面的 JavaScript 库，采用组件化和声明式编程范式',
    tagline: '组件化 UI 开发的标准',
    version: '18.3.1',
    pros: ['庞大的生态系统', 'React Native 跨平台', '强大的社区支持', 'Facebook 维护', '灵活性高'],
    cons: ['学习曲线较陡', '需要额外学习 JSX', 'Hooks 规则限制', '状态管理方案选择困难'],
    bestFor: ['大型单页应用', '跨平台移动应用', '复杂交互界面', '企业级项目'],
    notFor: ['简单静态页面', 'SEO 优先的轻量网站'],
    learningCurve: 'intermediate',
    ecosystemScore: 98,
    popularity: { githubStars: 228000, npmDownloads: 22000000 },
    companyUsers: ['Facebook', 'Instagram', 'Netflix', 'Airbnb', 'Uber'],
    createdYear: 2013,
    maintainedBy: 'Meta (Facebook)',
    officialUrl: 'https://react.dev',
    githubUrl: 'https://github.com/facebook/react',
    documentationUrl: 'https://react.dev',
    alternatives: ['vue', 'angular', 'svelte'],
    scores: {
      popularity: 95, maintenance: 92, ecosystem: 98, learningCurve: 75, enterpriseAdoption: 90,
      total: 91, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: reactDeepDive
  },

  vue: {
    id: 'vue',
    name: 'Vue.js',
    category: 'frontend',
    subcategory: '框架',
    description: '渐进式 JavaScript 框架，易于上手，灵活性高',
    tagline: '渐进式 JavaScript 框架',
    version: '3.4.21',
    pros: ['学习曲线平缓', '模板语法直观', '优秀的官方生态', '中文文档优秀', '性能优秀'],
    cons: ['企业采用率较低', '大型项目经验相对较少', 'TypeScript 支持不如 React'],
    bestFor: ['中小型项目', '渐进式升级', '快速原型开发', '后台管理系统'],
    notFor: ['超大型企业应用', '需要最多工作机会'],
    learningCurve: 'beginner',
    ecosystemScore: 90,
    popularity: { githubStars: 207000 },
    companyUsers: ['Alibaba', 'Xiaomi', 'Bilibili', 'GitLab', 'Nintendo'],
    createdYear: 2014,
    maintainedBy: 'Evan You',
    officialUrl: 'https://vuejs.org',
    githubUrl: 'https://github.com/vuejs/core',
    documentationUrl: 'https://vuejs.org',
    alternatives: ['react', 'angular', 'svelte'],
    scores: {
      popularity: 88, maintenance: 85, ecosystem: 90, learningCurve: 85, enterpriseAdoption: 75,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: vueDeepDive
  },

  angular: {
    id: 'angular',
    name: 'Angular',
    category: 'frontend',
    subcategory: '框架',
    description: 'Google 开发的企业级前端框架，提供完整的解决方案',
    tagline: '企业级前端开发平台',
    version: '17.2.0',
    pros: ['完整的企业级框架', 'TypeScript 优先', '依赖注入系统', '强大的 CLI 工具', '长期支持'],
    cons: ['学习曲线陡峭', '概念繁多复杂', '样板代码较多', '灵活性较低'],
    bestFor: ['大型企业应用', '团队规模较大', '需要强约束的项目', '长期维护项目'],
    notFor: ['快速原型开发', '小型项目', '灵活度要求高的项目'],
    learningCurve: 'advanced',
    ecosystemScore: 85,
    popularity: { githubStars: 96000 },
    companyUsers: ['Google', 'Microsoft', 'Forbes', 'PayPal', 'Samsung'],
    createdYear: 2016,
    maintainedBy: 'Google',
    officialUrl: 'https://angular.io',
    githubUrl: 'https://github.com/angular/angular',
    documentationUrl: 'https://angular.io/docs',
    alternatives: ['react', 'vue'],
    scores: {
      popularity: 82, maintenance: 88, ecosystem: 85, learningCurve: 60, enterpriseAdoption: 88,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: angularDeepDive
  },

  nextjs: {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    subcategory: '元框架',
    description: '基于 React 的全栈框架，支持 SSR、SSG、ISR 等多种渲染模式',
    tagline: 'React 全栈框架',
    version: '14.2.0',
    pros: ['多种渲染模式', '优秀的开发体验', 'Vercel 生态', '自动路由', '图像优化'],
    cons: ['Vercel 锁定风险', '学习成本较高', 'App Router 迁移成本'],
    bestFor: ['SEO 友好网站', '全栈应用', '电商平台', '内容网站'],
    notFor: ['纯静态展示页', '简单 SPA'],
    learningCurve: 'intermediate',
    ecosystemScore: 88,
    popularity: { githubStars: 123000 },
    companyUsers: ['Netflix', 'Uber', 'Starbucks', 'TikTok', 'Nike'],
    createdYear: 2016,
    maintainedBy: 'Vercel',
    officialUrl: 'https://nextjs.org',
    githubUrl: 'https://github.com/vercel/next.js',
    documentationUrl: 'https://nextjs.org/docs',
    alternatives: ['nuxtjs', 'astro', 'remix'],
    scores: {
      popularity: 92, maintenance: 90, ecosystem: 88, learningCurve: 70, enterpriseAdoption: 85,
      total: 88, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: nextjsDeepDive
  },

  svelte: {
    id: 'svelte',
    name: 'Svelte',
    category: 'frontend',
    subcategory: '框架',
    description: '编译时优化的前端框架，无虚拟 DOM，包体积小',
    tagline: '控制论增强的 Web 应用',
    version: '4.2.12',
    pros: ['编译时优化', '无虚拟 DOM 开销', '包体积小', '真正的响应式', '内置动画'],
    cons: ['生态系统较小', '工作机会较少', '大型项目验证不足'],
    bestFor: ['性能敏感应用', '嵌入式组件', '数据可视化', '小型项目'],
    notFor: ['超大型应用', '团队规模较大'],
    learningCurve: 'beginner',
    ecosystemScore: 70,
    popularity: { githubStars: 80000 },
    companyUsers: ['The New York Times', 'Spotify', 'Apple'],
    createdYear: 2016,
    maintainedBy: 'Rich Harris (Vercel)',
    officialUrl: 'https://svelte.dev',
    githubUrl: 'https://github.com/sveltejs/svelte',
    documentationUrl: 'https://svelte.dev/docs',
    alternatives: ['react', 'vue', 'solidjs'],
    scores: {
      popularity: 75, maintenance: 80, ecosystem: 70, learningCurve: 90, enterpriseAdoption: 55,
      total: 75, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: svelteDeepDive
  },


  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    category: 'frontend',
    subcategory: '语言',
    description: 'JavaScript 的超集，提供静态类型检查和现代语言特性',
    tagline: '带类型的 JavaScript',
    version: '5.3.3',
    pros: ['静态类型检查', '优秀的 IDE 支持', '强大的类型系统', '渐进式采用', '大型项目必备'],
    cons: ['需要编译步骤', '初期配置复杂', '学习曲线存在', '第三方库类型定义不完整'],
    bestFor: ['大型前端项目', 'Node.js 后端', '工具库开发', '团队协作'],
    notFor: ['简单脚本', '快速原型', '极小型项目'],
    learningCurve: 'intermediate',
    ecosystemScore: 96,
    popularity: { githubStars: 101000, npmDownloads: 50000000 },
    companyUsers: ['Microsoft', 'Google', 'Slack', 'Asana', 'Shopify'],
    createdYear: 2012,
    maintainedBy: 'Microsoft',
    officialUrl: 'https://www.typescriptlang.org',
    githubUrl: 'https://github.com/microsoft/TypeScript',
    documentationUrl: 'https://www.typescriptlang.org/docs',
    alternatives: ['javascript', 'flow', 'reason'],
    scores: {
      popularity: 94, maintenance: 95, ecosystem: 96, learningCurve: 72, enterpriseAdoption: 92,
      total: 91, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: typescriptDeepDive
  },

  tailwindcss: {
    id: 'tailwindcss',
    name: 'Tailwind CSS',
    category: 'frontend',
    subcategory: '样式方案',
    description: '实用优先的 CSS 框架，通过组合原子类构建界面',
    tagline: '无需离开 HTML 即可构建现代网站',
    version: '3.4.1',
    pros: ['开发速度快', '包体积小', '高度可定制', '无需命名困难', '响应式友好'],
    cons: ['HTML 类名冗长', '学习曲线存在', '可复用性挑战', '设计系统约束'],
    bestFor: ['现代 Web 应用', '快速原型开发', '设计系统实现', '响应式设计'],
    notFor: ['极小型项目', '复杂自定义动画'],
    learningCurve: 'intermediate',
    ecosystemScore: 82,
    popularity: { githubStars: 82000 },
    companyUsers: ['Vercel', 'GitHub', 'Netflix', 'Shopify', 'Loom'],
    createdYear: 2017,
    maintainedBy: 'Tailwind Labs',
    officialUrl: 'https://tailwindcss.com',
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss',
    documentationUrl: 'https://tailwindcss.com/docs',
    alternatives: ['bootstrap', 'chakra-ui', 'emotion'],
    scores: {
      popularity: 90, maintenance: 88, ecosystem: 82, learningCurve: 88, enterpriseAdoption: 78,
      total: 86, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: tailwindcssDeepDive
  },

  vite: {
    id: 'vite',
    name: 'Vite',
    category: 'frontend',
    subcategory: '构建工具',
    description: '下一代前端构建工具，极速冷启动和热更新',
    tagline: '下一代前端工具链',
    version: '5.1.4',
    pros: ['极速冷启动', '即时热更新', '优化的生产构建', '丰富的插件生态', 'TypeScript 支持'],
    cons: ['生态不如 Webpack 成熟', '某些高级配置需自定义', '大型项目可能需要调优'],
    bestFor: ['现代前端项目', '快速原型开发', 'Vue/React 项目', '库开发'],
    notFor: ['遗留 Webpack 项目', '需要复杂自定义构建'],
    learningCurve: 'beginner',
    ecosystemScore: 80,
    popularity: { githubStars: 68000 },
    companyUsers: ['Vue', 'Svelte', 'Nuxt', 'VitePress'],
    createdYear: 2020,
    maintainedBy: 'Evan You',
    officialUrl: 'https://vitejs.dev',
    githubUrl: 'https://github.com/vitejs/vite',
    documentationUrl: 'https://vitejs.dev/guide',
    alternatives: ['webpack', 'parcel', 'esbuild'],
    scores: {
      popularity: 85, maintenance: 88, ecosystem: 80, learningCurve: 92, enterpriseAdoption: 70,
      total: 84, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: viteDeepDive
  },

  astro: {
    id: 'astro',
    name: 'Astro',
    category: 'frontend',
    subcategory: '元框架',
    description: '内容驱动的网站构建工具，零 JavaScript 默认',
    tagline: '内容驱动，极速网站',
    version: '4.4.0',
    pros: ['零 JS 默认', '岛屿架构', '多框架支持', '性能优秀', '内容优先'],
    cons: ['生态相对较新', '交互性需特殊处理', '企业采用率低'],
    bestFor: ['内容网站', '博客', '文档站点', '营销页面'],
    notFor: ['复杂 Web 应用', '高交互性需求'],
    learningCurve: 'beginner',
    ecosystemScore: 65,
    popularity: { githubStars: 43000 },
    companyUsers: ['The Guardian', 'NordVPN', 'Trivago'],
    createdYear: 2021,
    maintainedBy: 'Astro Team',
    officialUrl: 'https://astro.build',
    githubUrl: 'https://github.com/withastro/astro',
    documentationUrl: 'https://docs.astro.build',
    alternatives: ['nextjs', 'gatsby', 'eleventy'],
    scores: {
      popularity: 72, maintenance: 85, ecosystem: 65, learningCurve: 88, enterpriseAdoption: 50,
      total: 74, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: astroDeepDive
  },

  nuxtjs: {
    id: 'nuxtjs',
    name: 'Nuxt.js',
    category: 'frontend',
    subcategory: '元框架',
    description: '基于 Vue 的直观 Web 框架，支持 SSR 和 SSG',
    tagline: '直观的 Vue 框架',
    version: '3.10.3',
    pros: ['Vue 生态集成', '约定优于配置', 'Nitro 引擎', '自动导入', '丰富的模块'],
    cons: ['Vue 生态限制', '企业采用率较低', 'Next.js 竞争'],
    bestFor: ['Vue 全栈应用', '内容网站', '电商平台'],
    notFor: ['非 Vue 项目', 'React 团队'],
    learningCurve: 'intermediate',
    ecosystemScore: 78,
    popularity: { githubStars: 53000 },
    companyUsers: ['GitLab', 'Upwork', 'Ecosia'],
    createdYear: 2016,
    maintainedBy: 'Nuxt Labs',
    officialUrl: 'https://nuxt.com',
    githubUrl: 'https://github.com/nuxt/nuxt',
    documentationUrl: 'https://nuxt.com/docs',
    alternatives: ['nextjs', 'vue', 'remix'],
    scores: {
      popularity: 75, maintenance: 82, ecosystem: 78, learningCurve: 82, enterpriseAdoption: 60,
      total: 77, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: nuxtjsDeepDive
  },


  // ===== Frontend: State Management =====
  zustand: {
    id: 'zustand',
    name: 'Zustand',
    category: 'frontend',
    subcategory: '状态管理',
    description: '轻量、简单、强大的 React 状态管理库，基于 Hooks',
    tagline: '极简的 React 状态管理',
    version: '4.5.0',
    pros: ['极简 API', '无样板代码', 'TypeScript 支持好', '体积小巧', '易于学习'],
    cons: ['生态相对较小', '复杂场景需自行组合', '调试工具不如 Redux'],
    bestFor: ['中小型项目', '快速原型', '简单状态管理', '现代 React 项目'],
    notFor: ['复杂时间旅行调试', '需要严格架构约束'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 42000, npmDownloads: 1200000 },
    companyUsers: ['Vercel', 'GitHub', 'Linear', 'Arc'],
    createdYear: 2019,
    maintainedBy: 'Poimandres',
    officialUrl: 'https://zustand-demo.pmnd.rs',
    githubUrl: 'https://github.com/pmndrs/zustand',
    documentationUrl: 'https://docs.pmnd.rs/zustand',
    alternatives: ['redux', 'jotai', 'recoil', 'mobx'],
    scores: {
      popularity: 82, maintenance: 85, ecosystem: 75, learningCurve: 92, enterpriseAdoption: 70,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '极简 API', description: '仅需创建一个 store，无需 Provider 包裹，直接通过 hooks 访问状态。' },
        { title: '无样板代码', description: '不需要写 actions、reducers，直接修改状态即可。' },
        { title: '优秀的 TypeScript 支持', description: '类型推断完善，无需额外类型定义。' }
      ],
      [
        { type: 'official', title: 'Zustand 文档', url: 'https://docs.pmnd.rs/zustand', description: '官方文档' },
        { type: 'community', title: 'Zustand GitHub', url: 'https://github.com/pmndrs/zustand', description: '源代码' }
      ],
      [
        { category: '最佳实践', items: ['按功能拆分 store', '使用中间件持久化', '结合 Immer 处理复杂更新'] }
      ],
      [
        { techId: 'redux', techName: 'Redux', strengths: ['调试工具强大', '时间旅行', '生态系统成熟'], weaknesses: ['样板代码多', '学习曲线陡峭'], whenToChoose: '需要强大调试能力或团队已熟悉 Redux' }
      ],
      [
        { scenario: 'React 状态管理', description: '现代 React 项目的首选状态管理方案', recommended: true },
        { scenario: '跨组件通信', description: '比 Context 更简洁的跨组件状态共享', recommended: true }
      ]
    )
  },

  // ===== Frontend: UI Component Libraries =====
  shadcn: {
    id: 'shadcn',
    name: 'shadcn/ui',
    category: 'frontend',
    subcategory: 'UI组件库',
    description: '设计精美、可复用的组件集合，基于 Radix UI 和 Tailwind CSS',
    tagline: '可复用、可定制的组件库',
    version: '2.0.0',
    pros: ['无样式锁定', '完全可定制', '基于 Radix UI', 'Tailwind 集成', '代码可复制'],
    cons: ['需要配置 Tailwind', '组件需手动安装', '无 npm 包直接安装'],
    bestFor: ['需要自定义设计系统', '现代 React 项目', 'Tailwind 项目'],
    notFor: ['快速原型', '不想配置样式'],
    learningCurve: 'intermediate',
    ecosystemScore: 80,
    popularity: { githubStars: 65000 },
    companyUsers: ['Vercel', 'Linear', 'Clerk'],
    createdYear: 2023,
    maintainedBy: 'shadcn',
    officialUrl: 'https://ui.shadcn.com',
    githubUrl: 'https://github.com/shadcn-ui/ui',
    documentationUrl: 'https://ui.shadcn.com/docs',
    alternatives: ['mui', 'antd', 'chakra-ui'],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 80, learningCurve: 80, enterpriseAdoption: 75,
      total: 84, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '无样式锁定', description: '组件代码直接复制到项目中，完全拥有和控制样式。' },
        { title: 'Radix UI 基础', description: '基于 Radix UI 的无障碍组件，确保可访问性。' },
        { title: 'Tailwind 集成', description: '与 Tailwind CSS 深度集成，样式一致性强。' }
      ],
      [
        { type: 'official', title: 'shadcn/ui 文档', url: 'https://ui.shadcn.com/docs', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 CLI 安装组件', '自定义主题变量', '配合 Tailwind 使用'] }
      ],
      [
        { techId: 'mui', techName: 'MUI', strengths: ['组件丰富', '文档完善', '企业采用率高'], weaknesses: ['样式难以覆盖', '包体积大'], whenToChoose: '需要开箱即用的 Material Design' }
      ],
      [
        { scenario: '设计系统构建', description: '基于 shadcn 构建自定义设计系统', recommended: true },
        { scenario: '管理后台', description: '快速构建美观的管理界面', recommended: true }
      ]
    )
  },

  antd: {
    id: 'antd',
    name: 'Ant Design',
    category: 'frontend',
    subcategory: 'UI组件库',
    description: '企业级 UI 设计语言和 React 组件库，由阿里巴巴出品',
    tagline: '企业级 UI 设计语言',
    version: '5.15.0',
    pros: ['企业级组件丰富', '设计规范完善', '中文文档优秀', '生态系统成熟', 'TypeScript 支持'],
    cons: ['包体积较大', '样式定制复杂', '设计偏向中后台'],
    bestFor: ['企业后台系统', '中后台管理', '需要完整设计规范'],
    notFor: ['C端消费者应用', '追求极小包体积'],
    learningCurve: 'intermediate',
    ecosystemScore: 88,
    popularity: { githubStars: 91000 },
    companyUsers: ['Alibaba', 'Tencent', 'Baidu', 'Meituan'],
    createdYear: 2015,
    maintainedBy: 'Ant Group',
    officialUrl: 'https://ant.design',
    githubUrl: 'https://github.com/ant-design/ant-design',
    documentationUrl: 'https://ant.design/docs/react/introduce',
    alternatives: ['mui', 'shadcn', 'chakra-ui'],
    scores: {
      popularity: 90, maintenance: 88, ecosystem: 88, learningCurve: 78, enterpriseAdoption: 92,
      total: 87, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '企业级组件', description: '提供 60+ 高质量组件，覆盖中后台常见场景。' },
        { title: '设计规范', description: '完整的设计语言和规范，确保产品一致性。' },
        { title: 'ProComponents', description: '基于 Ant Design 的高级组件库，进一步提升开发效率。' }
      ],
      [
        { type: 'official', title: 'Ant Design 文档', url: 'https://ant.design', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 ConfigProvider 配置主题', '按需加载组件', '配合 ProComponents 使用'] }
      ],
      [
        { techId: 'mui', techName: 'MUI', strengths: ['Material Design', 'React Native 支持'], weaknesses: ['中后台组件较少'], whenToChoose: '需要 Material Design 或跨平台' }
      ],
      [
        { scenario: '中后台管理系统', description: '企业级后台开发的首选', recommended: true },
        { scenario: '数据密集型应用', description: '表格、表单等组件功能强大', recommended: true }
      ]
    )
  },

  // ===== Frontend: Testing Tools =====
  vitest: {
    id: 'vitest',
    name: 'Vitest',
    category: 'frontend',
    subcategory: '测试工具',
    description: '由 Vite 提供支持的极速单元测试框架',
    tagline: '下一代测试框架',
    version: '1.3.0',
    pros: ['极速执行', 'Vite 集成', 'Jest 兼容', 'TypeScript 原生支持', 'HMR 支持'],
    cons: ['生态相对较新', '某些 Jest 插件不兼容', '企业采用率增长中'],
    bestFor: ['Vite 项目', '现代前端项目', '需要快速测试反馈'],
    notFor: ['遗留 Webpack 项目', '深度依赖 Jest 生态'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 12000 },
    companyUsers: ['Vite', 'Nuxt', 'Svelte'],
    createdYear: 2021,
    maintainedBy: 'Vitest Team',
    officialUrl: 'https://vitest.dev',
    githubUrl: 'https://github.com/vitest-dev/vitest',
    documentationUrl: 'https://vitest.dev/guide',
    alternatives: ['jest', 'mocha', 'jasmine'],
    scores: {
      popularity: 78, maintenance: 88, ecosystem: 75, learningCurve: 90, enterpriseAdoption: 65,
      total: 80, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '极速执行', description: '利用 Vite 的极速 HMR，测试执行速度极快。' },
        { title: 'Jest 兼容', description: 'API 设计兼容 Jest，迁移成本低。' },
        { title: 'TypeScript 原生', description: '无需额外配置，原生支持 TypeScript。' }
      ],
      [
        { type: 'official', title: 'Vitest 文档', url: 'https://vitest.dev', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['配置 Vite 别名', '使用 coverage 插件', '配合 Testing Library'] }
      ],
      [
        { techId: 'jest', techName: 'Jest', strengths: ['生态最成熟', '企业采用率高', 'Snapshot 测试'], weaknesses: ['速度较慢', '配置复杂'], whenToChoose: '团队已熟悉 Jest 或需要完整生态' }
      ],
      [
        { scenario: 'Vite 项目测试', description: 'Vite 项目的最佳测试伴侣', recommended: true },
        { scenario: '快速反馈开发', description: '极速测试反馈提升开发体验', recommended: true }
      ]
    )
  },

  playwright: {
    id: 'playwright',
    name: 'Playwright',
    category: 'frontend',
    subcategory: '测试工具',
    description: 'Microsoft 出品的现代 Web 测试和自动化框架',
    tagline: '可靠的端到端测试',
    version: '1.42.0',
    pros: ['多浏览器支持', '自动等待', '强大的调试工具', '并行执行', 'Trace Viewer'],
    cons: ['学习曲线存在', '资源占用较高', '测试编写时间较长'],
    bestFor: ['端到端测试', '跨浏览器测试', '关键业务路径测试'],
    notFor: ['简单静态页面', '单元测试'],
    learningCurve: 'intermediate',
    ecosystemScore: 82,
    popularity: { githubStars: 60000 },
    companyUsers: ['Microsoft', 'Google', 'Adobe', 'Slack'],
    createdYear: 2020,
    maintainedBy: 'Microsoft',
    officialUrl: 'https://playwright.dev',
    githubUrl: 'https://github.com/microsoft/playwright',
    documentationUrl: 'https://playwright.dev/docs',
    alternatives: ['cypress', 'selenium', 'puppeteer'],
    scores: {
      popularity: 88, maintenance: 92, ecosystem: 82, learningCurve: 75, enterpriseAdoption: 85,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '多浏览器支持', description: 'Chromium、Firefox、WebKit 一键测试。' },
        { title: '自动等待', description: '智能等待元素，减少 flaky 测试。' },
        { title: 'Trace Viewer', description: '详细的测试执行追踪，便于调试。' }
      ],
      [
        { type: 'official', title: 'Playwright 文档', url: 'https://playwright.dev', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 Codegen 生成测试', '配置并行执行', '使用 Trace Viewer 调试'] }
      ],
      [
        { techId: 'cypress', techName: 'Cypress', strengths: ['实时重载', '调试体验好', '社区成熟'], weaknesses: ['仅支持 Chromium 家族', '并行测试需付费'], whenToChoose: '团队偏好 Cypress 或需要实时调试' }
      ],
      [
        { scenario: '关键业务测试', description: '确保核心用户流程正常', recommended: true },
        { scenario: '跨浏览器兼容性', description: '验证多浏览器表现一致', recommended: true }
      ]
    )
  },

  // ===== Frontend: Package Manager & Data Fetching =====
  pnpm: {
    id: 'pnpm',
    name: 'pnpm',
    category: 'frontend',
    subcategory: '包管理器',
    description: '快速、节省磁盘空间的包管理器',
    tagline: '高效的包管理器',
    version: '8.15.0',
    pros: ['节省磁盘空间', '安装速度快', '严格依赖管理', 'Monorepo 支持好'],
    cons: ['某些工具兼容性问题', '学习成本', '迁移成本'],
    bestFor: ['大型项目', 'Monorepo', '磁盘空间有限'],
    notFor: ['小型项目', '简单脚本'],
    learningCurve: 'beginner',
    ecosystemScore: 78,
    popularity: { githubStars: 28000 },
    companyUsers: ['Vercel', 'Vue', 'Nuxt'],
    createdYear: 2017,
    maintainedBy: 'pnpm Team',
    officialUrl: 'https://pnpm.io',
    githubUrl: 'https://github.com/pnpm/pnpm',
    documentationUrl: 'https://pnpm.io/motivation',
    alternatives: ['npm', 'yarn', 'bun'],
    scores: {
      popularity: 85, maintenance: 88, ecosystem: 78, learningCurve: 90, enterpriseAdoption: 75,
      total: 84, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '内容可寻址存储', description: '所有包文件存储在全局存储中，通过硬链接引用，大幅节省磁盘空间。' },
        { title: '严格依赖管理', description: '默认不允许访问未声明的依赖，避免幽灵依赖问题。' }
      ],
      [
        { type: 'official', title: 'pnpm 文档', url: 'https://pnpm.io', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 workspace 管理 Monorepo', '配置 .npmrc 优化设置', '配合 Corepack 使用'] }
      ],
      [
        { techId: 'npm', techName: 'npm', strengths: ['Node.js 内置', '生态最成熟'], weaknesses: ['磁盘占用大', '安装速度慢'], whenToChoose: '不想安装额外工具' }
      ],
      [
        { scenario: 'Monorepo 项目', description: 'workspace 功能强大，适合多包管理', recommended: true },
        { scenario: '节省磁盘空间', description: '全局存储机制节省大量空间', recommended: true }
      ]
    )
  },

  tanstackquery: {
    id: 'tanstackquery',
    name: 'TanStack Query',
    category: 'frontend',
    subcategory: '数据请求',
    description: '强大的异步状态管理库，用于处理服务端状态',
    tagline: '服务端状态管理神器',
    version: '5.20.0',
    pros: ['自动缓存', '自动重试', '乐观更新', '无限滚动支持', 'DevTools'],
    cons: ['学习曲线存在', '概念较多', '需要理解缓存策略'],
    bestFor: ['服务端状态管理', 'REST API', 'GraphQL', '复杂数据交互'],
    notFor: ['简单静态页面', '客户端状态管理'],
    learningCurve: 'intermediate',
    ecosystemScore: 85,
    popularity: { githubStars: 42000 },
    companyUsers: ['Vercel', 'Netflix', 'Uber'],
    createdYear: 2019,
    maintainedBy: 'TanStack',
    officialUrl: 'https://tanstack.com/query',
    githubUrl: 'https://github.com/TanStack/query',
    documentationUrl: 'https://tanstack.com/query/latest',
    alternatives: ['swr', 'rtk-query', 'apollo-client'],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 85, learningCurve: 78, enterpriseAdoption: 80,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '自动缓存', description: '智能的缓存机制，自动去重和失效处理。' },
        { title: '乐观更新', description: '先更新 UI 再发送请求，提升用户体验。' },
        { title: '无限滚动', description: '内置无限滚动支持，简化分页逻辑。' }
      ],
      [
        { type: 'official', title: 'TanStack Query 文档', url: 'https://tanstack.com/query', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['合理设置 staleTime', '使用 prefetch 预加载', '配合 Suspense 使用'] }
      ],
      [
        { techId: 'swr', techName: 'SWR', strengths: ['更轻量', 'Vercel 出品', '简单'], weaknesses: ['功能较少', '生态较小'], whenToChoose: '需要轻量级方案' }
      ],
      [
        { scenario: '服务端状态管理', description: '管理服务端数据的最佳选择', recommended: true },
        { scenario: '复杂数据交互', description: '缓存、重试、乐观更新一站式解决', recommended: true }
      ]
    )
  },

  // ===== Node.js Core Technologies =====
  express: {
    id: 'express',
    name: 'Express',
    category: 'backend',
    subcategory: 'Web框架',
    description: '快速、开放、极简的 Node.js Web 框架',
    tagline: 'Node.js 最流行的 Web 框架',
    version: '4.18.2',
    pros: ['极简灵活', '生态最丰富', '学习曲线平缓', '中间件机制', '社区活跃'],
    cons: ['缺乏内置功能', '回调地狱', '需要手动配置', '性能非最优'],
    bestFor: ['REST API', '中小型应用', '微服务', '快速原型'],
    notFor: ['大型复杂应用', '需要严格架构的项目'],
    learningCurve: 'beginner',
    ecosystemScore: 95,
    popularity: { githubStars: 64000, npmDownloads: 28000000 },
    companyUsers: ['Uber', 'IBM', 'Twitter', 'Stack Overflow'],
    createdYear: 2010,
    maintainedBy: 'OpenJS Foundation',
    officialUrl: 'https://expressjs.com',
    githubUrl: 'https://github.com/expressjs/express',
    documentationUrl: 'https://expressjs.com/en/api.html',
    alternatives: ['fastify', 'koa', 'nestjs'],
    scores: {
      popularity: 95, maintenance: 80, ecosystem: 95, learningCurve: 90, enterpriseAdoption: 85,
      total: 91, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '中间件架构', description: '基于中间件的请求处理流程，灵活可扩展。' },
        { title: '路由系统', description: '强大的路由定义，支持参数、正则、链式调用。' },
        { title: '模板引擎', description: '支持多种模板引擎，快速渲染 HTML。' }
      ],
      [
        { type: 'official', title: 'Express 文档', url: 'https://expressjs.com', description: '官方文档和指南' },
        { type: 'community', title: 'Express 中文文档', url: 'https://expressjs.com/zh-cn/', description: '中文官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用路由模块化组织代码', '统一错误处理中间件', '使用 helmet 增强安全'] }
      ],
      [
        { techId: 'fastify', techName: 'Fastify', strengths: ['性能更好', '内置 JSON Schema', 'TypeScript 友好'], weaknesses: ['生态较小', '学习曲线稍陡'], whenToChoose: '需要高性能时' }
      ],
      [
        { scenario: '快速原型开发', description: '快速搭建 API 服务', recommended: true },
        { scenario: '中小型 Web 应用', description: '灵活轻量的 Web 后端', recommended: true }
      ]
    )
  },

  fastify: {
    id: 'fastify',
    name: 'Fastify',
    category: 'backend',
    subcategory: 'Web框架',
    description: '快速、低开销的 Node.js Web 框架',
    tagline: 'Node.js 最快的 Web 框架之一',
    version: '4.26.0',
    pros: ['极高性能', '低开销', '内置 JSON Schema', 'TypeScript 优先', '插件系统'],
    cons: ['生态相对较小', '学习曲线较陡', '部分中间件需适配'],
    bestFor: ['高性能 API', '微服务', 'Serverless', '实时应用'],
    notFor: ['简单 CRUD', '需要丰富开箱即用功能'],
    learningCurve: 'intermediate',
    ecosystemScore: 75,
    popularity: { githubStars: 30000, npmDownloads: 1200000 },
    companyUsers: ['NearForm', 'Platformatic', 'Mia-Platform'],
    createdYear: 2016,
    maintainedBy: 'Fastify Team',
    officialUrl: 'https://fastify.dev',
    githubUrl: 'https://github.com/fastify/fastify',
    documentationUrl: 'https://fastify.dev/docs',
    alternatives: ['express', 'nestjs', 'hono'],
    scores: {
      popularity: 75, maintenance: 90, ecosystem: 75, learningCurve: 80, enterpriseAdoption: 65,
      total: 78, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: 'Schema 验证', description: '内置 JSON Schema 验证，提升性能和可靠性。' },
        { title: '钩子系统', description: '丰富的生命周期钩子，精细控制请求流程。' },
        { title: '插件架构', description: '强大的插件系统，支持嵌套和封装。' }
      ],
      [
        { type: 'official', title: 'Fastify 文档', url: 'https://fastify.dev/docs', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 schema 定义路由', '善用插件封装功能', '使用 fastify-cli 初始化项目'] }
      ],
      [
        { techId: 'express', techName: 'Express', strengths: ['生态丰富', '学习曲线平缓', '社区活跃'], weaknesses: ['性能较低', '缺乏现代特性'], whenToChoose: '快速开发、生态优先' }
      ],
      [
        { scenario: '高性能 API 服务', description: '需要处理大量并发请求', recommended: true },
        { scenario: '微服务架构', description: '轻量、快速的服务节点', recommended: true }
      ]
    )
  },

  prisma: {
    id: 'prisma',
    name: 'Prisma',
    category: 'backend',
    subcategory: 'ORM',
    description: '下一代 Node.js 和 TypeScript ORM',
    tagline: '现代数据库工具包',
    version: '5.9.0',
    pros: ['类型安全', '自动迁移', '可视化数据', '强大的查询引擎', '优秀的 DX'],
    cons: ['不支持所有数据库特性', '迁移有时复杂', '运行时体积较大'],
    bestFor: ['TypeScript 项目', '需要类型安全', '现代 Node.js 应用'],
    notFor: ['复杂 SQL', '遗留数据库', '极端性能要求'],
    learningCurve: 'intermediate',
    ecosystemScore: 85,
    popularity: { githubStars: 37000, npmDownloads: 3500000 },
    companyUsers: ['Vercel', 'Netlify', 'Rakuten', 'Tryg'],
    createdYear: 2019,
    maintainedBy: 'Prisma',
    officialUrl: 'https://prisma.io',
    githubUrl: 'https://github.com/prisma/prisma',
    documentationUrl: 'https://prisma.io/docs',
    alternatives: ['typeorm', 'sequelize', 'drizzle'],
    scores: {
      popularity: 85, maintenance: 92, ecosystem: 85, learningCurve: 80, enterpriseAdoption: 80,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: 'Prisma Schema', description: '声明式数据模型定义，支持关系、枚举、默认值。' },
        { title: '类型安全查询', description: '完全类型化的查询 API，编译时捕获错误。' },
        { title: 'Prisma Studio', description: '可视化数据库管理工具，方便数据查看和编辑。' }
      ],
      [
        { type: 'official', title: 'Prisma 文档', url: 'https://prisma.io/docs', description: '官方文档' },
        { type: 'official', title: 'Prisma Examples', url: 'https://github.com/prisma/prisma-examples', description: '官方示例' }
      ],
      [
        { category: '最佳实践', items: ['使用 migrate dev 管理开发迁移', '定期使用 db pull 同步数据库', '使用 Prisma Client 扩展自定义逻辑'] }
      ],
      [
        { techId: 'typeorm', techName: 'TypeORM', strengths: ['支持 Active Record', '功能丰富', '装饰器语法'], weaknesses: ['维护较慢', 'TypeScript 支持问题'], whenToChoose: '需要复杂关系映射' }
      ],
      [
        { scenario: '现代 TypeScript 后端', description: '类型安全的 Node.js 应用', recommended: true },
        { scenario: '快速 API 开发', description: '配合 tRPC 或 GraphQL 使用', recommended: true }
      ]
    )
  },

  // ===== Backend Technologies =====
  nestjs: {
    id: 'nestjs',
    name: 'NestJS',
    category: 'backend',
    subcategory: 'Web框架',
    description: '用于构建高效、可扩展的 Node.js 服务器端应用程序的框架',
    tagline: '渐进式 Node.js 框架',
    version: '10.3.0',
    pros: ['企业级架构', 'TypeScript 优先', '依赖注入', '丰富的生态', '可扩展性强'],
    cons: ['学习曲线较陡', '概念较多', '样板代码', '性能不如轻量框架'],
    bestFor: ['企业级后端', 'API 服务', '微服务架构', '复杂业务逻辑'],
    notFor: ['简单脚本', 'Serverless 函数'],
    learningCurve: 'intermediate',
    ecosystemScore: 82,
    popularity: { githubStars: 65000 },
    companyUsers: ['Adidas', 'Capgemini', 'Decathlon', 'Sanofi'],
    createdYear: 2017,
    maintainedBy: 'Kamil Myśliwiec',
    officialUrl: 'https://nestjs.com',
    githubUrl: 'https://github.com/nestjs/nest',
    documentationUrl: 'https://docs.nestjs.com',
    alternatives: ['express', 'fastify', 'hono'],
    scores: {
      popularity: 78, maintenance: 85, ecosystem: 82, learningCurve: 70, enterpriseAdoption: 75,
      total: 79, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: nestjsDeepDive
  },

  hono: {
    id: 'hono',
    name: 'Hono',
    category: 'backend',
    subcategory: 'Web框架',
    description: '轻量、快速的 Web 框架，支持多种 JavaScript 运行时',
    tagline: '极速、轻量的 Web 框架',
    version: '4.0.0',
    pros: ['极致轻量', '多平台支持', 'TypeScript 优先', '性能优秀', '边缘计算友好'],
    cons: ['生态相对较新', '企业采用率低', '功能相对简单'],
    bestFor: ['边缘计算', 'Serverless 函数', '高性能 API', '轻量服务'],
    notFor: ['复杂业务逻辑', '企业级应用'],
    learningCurve: 'beginner',
    ecosystemScore: 60,
    popularity: { githubStars: 12000 },
    companyUsers: ['Cloudflare', 'Vercel'],
    createdYear: 2022,
    maintainedBy: 'Yusuke Wada',
    officialUrl: 'https://hono.dev',
    githubUrl: 'https://github.com/honojs/hono',
    documentationUrl: 'https://hono.dev',
    alternatives: ['express', 'fastify', 'nestjs'],
    scores: {
      popularity: 68, maintenance: 88, ecosystem: 60, learningCurve: 90, enterpriseAdoption: 45,
      total: 72, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: honoDeepDive
  },

  fastapi: {
    id: 'fastapi',
    name: 'FastAPI',
    category: 'backend',
    subcategory: 'Web框架',
    description: '高性能的 Python Web 框架，基于 Starlette 和 Pydantic',
    tagline: '高性能、易学、快速编码',
    version: '0.109.0',
    pros: ['高性能异步', '自动 API 文档', '数据验证', '类型提示', '现代 Python'],
    cons: ['生态相对较小', '异步学习曲线', '生产部署需配置'],
    bestFor: ['高性能 API', '机器学习服务', '数据科学', '微服务'],
    notFor: ['传统 CMS', '需要 admin 后台'],
    learningCurve: 'intermediate',
    ecosystemScore: 78,
    popularity: { githubStars: 75000 },
    companyUsers: ['Netflix', 'Uber', 'Microsoft', 'Explosion AI'],
    createdYear: 2018,
    maintainedBy: 'Sebastián Ramírez',
    officialUrl: 'https://fastapi.tiangolo.com',
    githubUrl: 'https://github.com/tiangolo/fastapi',
    documentationUrl: 'https://fastapi.tiangolo.com',
    alternatives: ['django', 'flask', 'tornado'],
    scores: {
      popularity: 82, maintenance: 88, ecosystem: 78, learningCurve: 85, enterpriseAdoption: 70,
      total: 81, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: fastapiDeepDive
  },

  django: {
    id: 'django',
    name: 'Django',
    category: 'backend',
    subcategory: 'Web框架',
    description: 'Python 的高级 Web 框架，鼓励快速开发和简洁实用的设计',
    tagline: '有完美主义截止日期的 Web 框架',
    version: '5.0.0',
    pros: ['功能完整', 'admin 后台强大', '安全可靠', '生态系统成熟', '文档优秀'],
    cons: ['同步为主', '学习曲线陡峭', '灵活性较低', '性能相对较低'],
    bestFor: ['内容管理系统', '电商网站', '企业后台', '快速开发'],
    notFor: ['高并发 API', '实时应用'],
    learningCurve: 'advanced',
    ecosystemScore: 90,
    popularity: { githubStars: 79000 },
    companyUsers: ['Instagram', 'Pinterest', 'Mozilla', 'NASA', 'National Geographic'],
    createdYear: 2005,
    maintainedBy: 'Django Software Foundation',
    officialUrl: 'https://www.djangoproject.com',
    githubUrl: 'https://github.com/django/django',
    documentationUrl: 'https://docs.djangoproject.com',
    alternatives: ['fastapi', 'flask', 'tornado'],
    scores: {
      popularity: 88, maintenance: 85, ecosystem: 90, learningCurve: 75, enterpriseAdoption: 82,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: djangoDeepDive
  },

  // ===== Python Core Technologies =====
  flask: {
    id: 'flask',
    name: 'Flask',
    category: 'backend',
    subcategory: 'Web框架',
    description: '轻量级的 Python Web 框架，简洁而灵活',
    tagline: 'Python 微框架的代表',
    version: '3.0.0',
    pros: ['极简灵活', '易于学习', '扩展丰富', '文档优秀', '社区活跃'],
    cons: ['缺少内置功能', '需要手动配置', '大型项目需自行架构'],
    bestFor: ['小型应用', 'API 服务', '微服务', '原型开发'],
    notFor: ['大型复杂应用', '需要完整 admin 后台'],
    learningCurve: 'beginner',
    ecosystemScore: 85,
    popularity: { githubStars: 66000 },
    companyUsers: ['Pinterest', 'LinkedIn', 'Netflix', 'Reddit'],
    createdYear: 2010,
    maintainedBy: 'Pallets Projects',
    officialUrl: 'https://flask.palletsprojects.com',
    githubUrl: 'https://github.com/pallets/flask',
    documentationUrl: 'https://flask.palletsprojects.com/en/3.0.x/',
    alternatives: ['django', 'fastapi', 'tornado'],
    scores: {
      popularity: 85, maintenance: 85, ecosystem: 85, learningCurve: 90, enterpriseAdoption: 80,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '极简核心', description: '核心功能精简，通过扩展实现所需功能。' },
        { title: 'Jinja2 模板', description: '强大的模板引擎，支持模板继承和宏。' },
        { title: 'Werkzeug WSGI', description: '基于 Werkzeug，提供强大的请求处理功能。' }
      ],
      [
        { type: 'official', title: 'Flask 文档', url: 'https://flask.palletsprojects.com', description: '官方文档' },
        { type: 'tutorial', title: 'Flask Mega-Tutorial', url: 'https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world', description: '经典教程' }
      ],
      [
        { category: '最佳实践', items: ['使用应用工厂模式', '使用蓝图组织路由', '使用 Flask-SQLAlchemy 处理数据库'] }
      ],
      [
        { techId: 'fastapi', techName: 'FastAPI', strengths: ['性能更好', '异步支持', '自动文档'], weaknesses: ['生态较小', '学习曲线'], whenToChoose: '需要高性能 API' }
      ],
      [
        { scenario: '小型 Web 应用', description: '快速开发轻量级应用', recommended: true },
        { scenario: 'RESTful API', description: '构建灵活的 API 服务', recommended: true }
      ]
    )
  },

  sqlalchemy: {
    id: 'sqlalchemy',
    name: 'SQLAlchemy',
    category: 'backend',
    subcategory: 'ORM',
    description: 'Python 的 SQL 工具包和 ORM 框架',
    tagline: 'Python 最强大的数据库工具',
    version: '2.0.25',
    pros: ['功能强大', '灵活性高', '支持多种数据库', 'SQL 表达式语言', '成熟稳定'],
    cons: ['学习曲线陡峭', '文档复杂', '配置较繁琐'],
    bestFor: ['复杂数据库操作', '企业级应用', '需要精细控制 SQL'],
    notFor: ['简单 CRUD', '快速原型'],
    learningCurve: 'advanced',
    ecosystemScore: 90,
    popularity: { githubStars: 8000 },
    companyUsers: ['Reddit', 'Uber', 'Netflix', 'Dropbox'],
    createdYear: 2006,
    maintainedBy: 'Mike Bayer',
    officialUrl: 'https://www.sqlalchemy.org',
    githubUrl: 'https://github.com/sqlalchemy/sqlalchemy',
    documentationUrl: 'https://docs.sqlalchemy.org',
    alternatives: ['django-orm', 'tortoise-orm', 'peewee'],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 90, learningCurve: 70, enterpriseAdoption: 88,
      total: 86, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: 'Core 和 ORM', description: '提供 SQL 表达式语言(Core)和对象关系映射(ORM)两层 API。' },
        { title: '连接池', description: '内置高性能连接池，支持多种连接池策略。' },
        { title: '事务管理', description: '强大的事务和会话管理，支持嵌套事务。' }
      ],
      [
        { type: 'official', title: 'SQLAlchemy 文档', url: 'https://docs.sqlalchemy.org', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 2.0 风格的查询 API', '合理使用连接池', '使用 Alembic 管理迁移'] }
      ],
      [
        { techId: 'django-orm', techName: 'Django ORM', strengths: ['开箱即用', 'admin 集成', '迁移自动'], weaknesses: ['灵活性较低', '仅 Django 可用'], whenToChoose: '使用 Django 框架时' }
      ],
      [
        { scenario: '复杂数据模型', description: '处理复杂关系和查询', recommended: true },
        { scenario: '企业级后端', description: '需要精细控制数据库操作', recommended: true }
      ]
    )
  },

  // ===== Python CLI & Terminal Libraries =====
  rich: {
    id: 'rich',
    name: 'Rich',
    category: 'backend',
    subcategory: '终端美化',
    description: 'Python 的终端美化库，支持富文本、表格、进度条、语法高亮等',
    tagline: '让终端输出更美观',
    version: '13.7.0',
    pros: ['丰富的输出格式', '语法高亮', '进度条支持', '表格渲染', 'Markdown 支持', '易于使用'],
    cons: ['仅用于终端', '大量输出可能影响性能', '依赖较多'],
    bestFor: ['CLI 工具开发', '数据展示', '日志美化', '开发调试', '报告生成'],
    notFor: ['非终端应用', '高性能日志系统'],
    learningCurve: 'beginner',
    ecosystemScore: 82,
    popularity: { githubStars: 49000 },
    companyUsers: ['Prefect', 'Textualize', 'Robocorp', 'Snowflake'],
    createdYear: 2019,
    maintainedBy: 'Will McGugan (Textualize)',
    officialUrl: 'https://rich.readthedocs.io',
    githubUrl: 'https://github.com/Textualize/rich',
    documentationUrl: 'https://rich.readthedocs.io/en/stable/',
    alternatives: ['colorama', 'termcolor', 'blessed', 'curses'],
    scores: {
      popularity: 85, maintenance: 90, ecosystem: 82, learningCurve: 92, enterpriseAdoption: 75,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '富文本渲染', description: '支持粗体、斜体、下划线、删除线等多种文本样式，以及 256 色和真彩色支持。' },
        { title: '语法高亮', description: '内置代码语法高亮功能，支持 100+ 种编程语言。' },
        { title: '表格和布局', description: '支持复杂的表格渲染、列对齐、树形结构、面板布局等。' },
        { title: '进度条', description: '提供多种进度条样式，支持多任务进度显示。' }
      ],
      [
        { type: 'official', title: 'Rich 文档', url: 'https://rich.readthedocs.io', description: '官方文档' },
        { type: 'tutorial', title: 'Rich GitHub', url: 'https://github.com/Textualize/rich', description: '示例和源码' }
      ],
      [
        { category: '最佳实践', items: ['使用 Console 类统一输出', '合理使用样式避免过度装饰', '结合 logging 模块使用', '使用 traceback 美化异常'] }
      ],
      [
        { techId: 'click', techName: 'Click', strengths: ['CLI 框架完整', '命令解析强大', '生态成熟'], weaknesses: ['终端美化功能有限'], whenToChoose: '需要完整 CLI 框架时' }
      ],
      [
        { scenario: 'CLI 工具开发', description: '美化命令行工具输出，提升用户体验', recommended: true },
        { scenario: '数据展示', description: '以表格、树形等形式展示结构化数据', recommended: true },
        { scenario: '日志美化', description: '美化日志输出，添加颜色和格式', recommended: true },
        { scenario: 'Web 应用', description: 'Rich 仅用于终端，不适用于 Web', recommended: false }
      ]
    )
  },

  typer: {
    id: 'typer',
    name: 'Typer',
    category: 'backend',
    subcategory: 'CLI框架',
    description: '基于 Python 类型提示的现代化 CLI 框架，构建于 Click 之上',
    tagline: '基于类型提示的 CLI 框架',
    version: '0.9.0',
    pros: ['类型提示驱动', '自动补全', '文档自动生成', '代码简洁', '基于 Click 生态', '支持异步'],
    cons: ['相对较新', '生态较小', '复杂场景仍需 Click'],
    bestFor: ['CLI 工具开发', '类型安全项目', '快速原型', '开发者工具'],
    notFor: ['复杂 CLI 应用', '需要高度定制化的场景'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 14500 },
    companyUsers: ['Prefect', 'Modal', 'Textualize', 'Explosion AI'],
    createdYear: 2019,
    maintainedBy: 'Sebastián Ramírez (tiangolo)',
    officialUrl: 'https://typer.tiangolo.com',
    githubUrl: 'https://github.com/tiangolo/typer',
    documentationUrl: 'https://typer.tiangolo.com',
    alternatives: ['click', 'argparse', 'fire', 'docopt'],
    scores: {
      popularity: 78, maintenance: 88, ecosystem: 75, learningCurve: 90, enterpriseAdoption: 65,
      total: 80, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '类型提示驱动', description: '利用 Python 类型提示自动生成命令行参数、选项和文档。' },
        { title: '自动补全', description: '支持 Shell 自动补全（Bash、Zsh、Fish、PowerShell）。' },
        { title: '嵌套命令', description: '支持多层嵌套命令结构，适合构建复杂的 CLI 应用。' },
        { title: '与 Rich 集成', description: '可与 Rich 无缝集成，输出美观的终端内容。' }
      ],
      [
        { type: 'official', title: 'Typer 文档', url: 'https://typer.tiangolo.com', description: '官方文档，优秀的中文支持' },
        { type: 'tutorial', title: 'Typer 教程', url: 'https://typer.tiangolo.com/tutorial/', description: '官方教程' }
      ],
      [
        { category: '最佳实践', items: ['使用类型提示定义参数', '配合 Rich 美化输出', '使用回调函数验证参数', '生成自动补全脚本'] }
      ],
      [
        { techId: 'click', techName: 'Click', strengths: ['功能完整', '生态成熟', '更多插件'], weaknesses: ['不使用类型提示', '代码相对冗长'], whenToChoose: '需要更成熟的 CLI 框架' }
      ],
      [
        { scenario: 'CLI 工具开发', description: '基于类型提示快速构建命令行工具', recommended: true },
        { scenario: 'FastAPI 生态项目', description: '与 FastAPI 同一作者，风格一致', recommended: true },
        { scenario: '简单脚本', description: '比 argparse 更简洁的类型安全方案', recommended: true },
        { scenario: '复杂 CLI 应用', description: 'Click 可能更适合复杂场景', recommended: false }
      ]
    )
  },

  'prompt-toolkit': {
    id: 'prompt-toolkit',
    name: 'prompt_toolkit',
    category: 'backend',
    subcategory: '交互式终端',
    description: 'Python 的交互式命令行构建库，支持自动补全、语法高亮、多行编辑等功能',
    tagline: '构建强大的交互式命令行应用',
    version: '3.0.43',
    pros: ['强大的输入功能', '自动补全系统', '语法高亮', '多行编辑', '跨平台', '历史悠久'],
    cons: ['学习曲线较陡', '文档分散', 'API 复杂', '依赖较多'],
    bestFor: ['交互式 CLI', 'REPL 开发', '命令行编辑器', '数据库客户端', 'Shell 工具'],
    notFor: ['简单脚本', '静态输出', '轻量级应用'],
    learningCurve: 'intermediate',
    ecosystemScore: 85,
    popularity: { githubStars: 8600 },
    companyUsers: ['Python', 'IPython', 'Jupyter', 'Xonsh', 'pgcli'],
    createdYear: 2014,
    maintainedBy: 'Jonathan Slenders',
    officialUrl: 'https://python-prompt-toolkit.readthedocs.io',
    githubUrl: 'https://github.com/prompt-toolkit/python-prompt-toolkit',
    documentationUrl: 'https://python-prompt-toolkit.readthedocs.io',
    alternatives: ['readline', 'curses', 'blessed', 'rich'],
    scores: {
      popularity: 82, maintenance: 85, ecosystem: 85, learningCurve: 70, enterpriseAdoption: 80,
      total: 81, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '自动补全', description: '强大的自动补全系统，支持模糊匹配、多种补全源和可定制的补全菜单。' },
        { title: '语法高亮', description: '基于词法分析器的语法高亮系统，支持动态着色和自定义样式。' },
        { title: '多行编辑', description: '支持类似 IDE 的多行文本编辑功能，包括撤销/重做、选区等。' },
        { title: '跨平台', description: 'Windows、macOS、Linux 全面支持，统一 API 无需平台适配。' }
      ],
      [
        { type: 'official', title: 'prompt_toolkit 文档', url: 'https://python-prompt-toolkit.readthedocs.io', description: '官方文档' },
        { type: 'tutorial', title: 'prompt_toolkit GitHub', url: 'https://github.com/prompt-toolkit/python-prompt-toolkit', description: '示例和源码' }
      ],
      [
        { category: '最佳实践', items: ['使用 PromptSession 管理会话', '合理配置补全器', '自定义键绑定提升体验', '使用 history 保存输入历史'] }
      ],
      [
        { techId: 'readline', techName: 'readline', strengths: ['Python 标准库', '无需依赖', '简单够用'], weaknesses: ['功能有限', '仅 Unix', 'Windows 需 pyreadline'], whenToChoose: '简单需求或标准库优先' }
      ],
      [
        { scenario: '交互式 CLI 工具', description: '需要用户输入的复杂命令行工具', recommended: true },
        { scenario: '数据库客户端', description: '类似 pgcli、mycli 的交互式数据库工具', recommended: true },
        { scenario: 'REPL 开发', description: '构建自定义的交互式解释器', recommended: true },
        { scenario: '简单输入', description: '仅需 basic input() 的场景', recommended: false }
      ]
    )
  },

  httpx: {
    id: 'httpx',
    name: 'httpx',
    category: 'backend',
    subcategory: 'HTTP客户端',
    description: '现代化的 Python HTTP 客户端，支持同步和异步 API，requests 的升级版',
    tagline: 'Python 的下一代 HTTP 客户端',
    version: '0.26.0',
    pros: ['同步+异步双API', 'HTTP/2 支持', '类型提示完整', 'requests 兼容', '高性能', '流式支持'],
    cons: ['比 requests 重', '异步学习曲线', '某些功能仍在开发'],
    bestFor: ['异步应用', '高性能爬虫', 'API 客户端', '微服务通信', '并发请求'],
    notFor: ['简单脚本', '资源受限环境'],
    learningCurve: 'beginner',
    ecosystemScore: 80,
    popularity: { githubStars: 12500 },
    companyUsers: ['Tom Christie', 'Starlette', 'FastAPI', 'Prefect', 'Celery'],
    createdYear: 2019,
    maintainedBy: 'Tom Christie (Encode)',
    officialUrl: 'https://www.python-httpx.org',
    githubUrl: 'https://github.com/encode/httpx',
    documentationUrl: 'https://www.python-httpx.org',
    alternatives: ['requests', 'aiohttp', 'urllib3', 'treq'],
    scores: {
      popularity: 82, maintenance: 90, ecosystem: 80, learningCurve: 88, enterpriseAdoption: 75,
      total: 84, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '同步与异步', description: '同时支持同步 Client 和异步 AsyncClient，方便在 sync 和 async 代码中使用。' },
        { title: 'HTTP/2 支持', description: '原生支持 HTTP/2 协议，无需额外配置，提升性能和并发能力。' },
        { title: '流式传输', description: '支持请求和响应的流式处理，适合大文件上传下载和实时数据。' },
        { title: 'WebSocket', description: '通过额外的库支持 WebSocket 连接，实现双向实时通信。' }
      ],
      [
        { type: 'official', title: 'HTTPX 文档', url: 'https://www.python-httpx.org', description: '官方文档' },
        { type: 'tutorial', title: 'HTTPX 快速入门', url: 'https://www.python-httpx.org/quickstart/', description: '快速开始指南' }
      ],
      [
        { category: '最佳实践', items: ['使用 AsyncClient 进行异步请求', '配置合理的超时策略', '使用连接池复用连接', '流式处理大文件'] }
      ],
      [
        { techId: 'requests', techName: 'requests', strengths: ['更简单', '生态最成熟', '学习资源丰富'], weaknesses: ['不支持异步', '无 HTTP/2', '性能较低'], whenToChoose: '简单脚本或同步应用' },
        { techId: 'aiohttp', techName: 'aiohttp', strengths: ['更成熟', 'WebSocket 内置', '服务器功能'], weaknesses: ['仅异步', 'API 风格不同'], whenToChoose: '需要 WebSocket 或服务器功能' }
      ],
      [
        { scenario: '异步爬虫', description: '配合 asyncio 实现高性能并发爬虫', recommended: true },
        { scenario: '微服务调用', description: '服务间异步 HTTP 通信', recommended: true },
        { scenario: 'API 客户端', description: '需要类型安全和现代 API 设计', recommended: true },
        { scenario: '简单脚本', description: 'requests 可能更简单', recommended: false }
      ]
    )
  },

  textual: {
    id: 'textual',
    name: 'Textual',
    category: 'backend',
    subcategory: 'TUI框架',
    description: 'Python 的现代化终端用户界面(TUI)框架，用于构建复杂的交互式终端应用程序',
    tagline: '为终端构建精美的用户界面',
    version: '0.52.0',
    pros: ['声明式UI', '响应式布局', 'CSS样式', '丰富组件', '事件驱动', '动画支持', '与Rich集成'],
    cons: ['学习曲线陡峭', '仅Python 3.8+', '资源占用较高', '终端兼容性'],
    bestFor: ['终端仪表盘', '数据可视化工具', '命令行IDE', '交互式配置工具', '实时监控界面'],
    notFor: ['简单脚本', '资源受限环境', '需要GUI的应用'],
    learningCurve: 'intermediate',
    ecosystemScore: 78,
    popularity: { githubStars: 24000 },
    companyUsers: ['Textualize', 'Prefect', 'Robocorp', 'Snowflake', 'OpenBB'],
    createdYear: 2021,
    maintainedBy: 'Will McGugan (Textualize)',
    officialUrl: 'https://textual.textualize.io',
    githubUrl: 'https://github.com/Textualize/textual',
    documentationUrl: 'https://textual.textualize.io',
    alternatives: ['urwid', 'blessed', 'npyscreen', 'rich'],
    scores: {
      popularity: 82, maintenance: 92, ecosystem: 78, learningCurve: 75, enterpriseAdoption: 70,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '声明式UI', description: '使用类React的声明式语法构建界面，支持组件化和状态管理。' },
        { title: 'CSS样式系统', description: '支持类似CSS的选择器和样式规则，轻松定义组件外观。' },
        { title: '响应式布局', description: '内置网格、水平/垂直布局，支持窗口大小变化的自适应。' },
        { title: '丰富组件库', description: '提供按钮、输入框、表格、树形控件、选项卡、模态框等40+组件。' },
        { title: '事件系统', description: '完整的消息传递和事件处理机制，支持键盘和鼠标交互。' }
      ],
      [
        { type: 'official', title: 'Textual 文档', url: 'https://textual.textualize.io', description: '官方文档' },
        { type: 'tutorial', title: 'Textual 教程', url: 'https://textual.textualize.io/tutorial/', description: '官方教程' },
        { type: 'community', title: 'Textual GitHub', url: 'https://github.com/Textualize/textual', description: '源码和示例' }
      ],
      [
        { category: '最佳实践', items: ['使用Screen管理多页面', '合理使用reactive状态', '利用CSS分离样式', '使用工作线程处理耗时操作'] }
      ],
      [
        { techId: 'rich', techName: 'Rich', strengths: ['更简单', '输出格式化', '广泛兼容'], weaknesses: ['非交互式', '无布局系统', '无事件处理'], whenToChoose: '仅需美化输出，无需交互' },
        { techId: 'prompt-toolkit', techName: 'prompt_toolkit', strengths: ['更成熟', 'REPL工具', '底层控制'], weaknesses: ['学习曲线', '样式能力弱', '布局有限'], whenToChoose: '构建REPL或命令行编辑器' }
      ],
      [
        { scenario: '终端仪表盘', description: '实时数据监控面板', recommended: true },
        { scenario: '交互式CLI', description: '需要复杂用户交互的命令行工具', recommended: true },
        { scenario: '简单日志输出', description: '仅需打印彩色日志', recommended: false },
        { scenario: 'GUI应用', description: '需要原生图形界面', recommended: false }
      ]
    )
  },

  // ===== Go Core Technologies =====
  echo: {
    id: 'echo',
    name: 'Echo',
    category: 'backend',
    subcategory: 'Web框架',
    description: '高性能、极简的 Go Web 框架',
    tagline: 'Go 的高性能极简框架',
    version: '4.11.4',
    pros: ['性能极高', '路由强大', '中间件丰富', '文档优秀', '易于测试'],
    cons: ['功能相对简单', '缺乏内置 ORM', '社区比 Gin 小'],
    bestFor: ['REST API', '微服务', '高性能服务', '云原生应用'],
    notFor: ['复杂业务逻辑', '需要完整 ORM'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 28000 },
    companyUsers: ['Google', 'Netflix', 'Uber', 'Twitter'],
    createdYear: 2015,
    maintainedBy: 'LabStack',
    officialUrl: 'https://echo.labstack.com',
    githubUrl: 'https://github.com/labstack/echo',
    documentationUrl: 'https://echo.labstack.com/guide',
    alternatives: ['gin', 'fiber', 'go-zero'],
    scores: {
      popularity: 80, maintenance: 85, ecosystem: 75, learningCurve: 90, enterpriseAdoption: 75,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '路由系统', description: '支持路径参数、查询参数、路由组和中间件链。' },
        { title: '数据绑定', description: '自动将请求数据绑定到 Go 结构体。' },
        { title: '中间件', description: '丰富的内置中间件和易于扩展的自定义中间件。' }
      ],
      [
        { type: 'official', title: 'Echo 文档', url: 'https://echo.labstack.com', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用路由组组织 API', '自定义错误处理', '合理使用中间件链'] }
      ],
      [
        { techId: 'gin', techName: 'Gin', strengths: ['社区更大', '中间件丰富', '生态成熟'], weaknesses: ['路由稍弱'], whenToChoose: '需要丰富生态支持' }
      ],
      [
        { scenario: '高性能 API', description: '需要极致性能的服务', recommended: true },
        { scenario: '微服务架构', description: '轻量、快速的服务节点', recommended: true }
      ]
    )
  },

  gorm: {
    id: 'gorm',
    name: 'GORM',
    category: 'backend',
    subcategory: 'ORM',
    description: 'Go 语言的优秀 ORM 库',
    tagline: 'Go 开发者喜爱的 ORM',
    version: '1.25.6',
    pros: ['功能完整', '文档优秀', '社区活跃', '支持多种数据库', '易于使用'],
    cons: ['性能不如原生 SQL', '复杂查询受限', '反射性能开销'],
    bestFor: ['快速开发', '标准 CRUD 操作', '多数据库支持'],
    notFor: ['极致性能要求', '复杂 SQL 查询'],
    learningCurve: 'intermediate',
    ecosystemScore: 85,
    popularity: { githubStars: 35000 },
    companyUsers: ['Bilibili', 'ByteDance', 'Alibaba'],
    createdYear: 2013,
    maintainedBy: 'Jinzhu',
    officialUrl: 'https://gorm.io',
    githubUrl: 'https://github.com/go-gorm/gorm',
    documentationUrl: 'https://gorm.io/docs',
    alternatives: ['ent', 'bun', 'sqlx'],
    scores: {
      popularity: 85, maintenance: 88, ecosystem: 85, learningCurve: 82, enterpriseAdoption: 80,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '全功能 ORM', description: '支持关联、预加载、事务、迁移等完整功能。' },
        { title: 'Hooks 系统', description: '支持 Before/After Create/Update/Delete 等钩子。' },
        { title: '迁移工具', description: '内置 AutoMigrate 和独立的迁移工具。' }
      ],
      [
        { type: 'official', title: 'GORM 文档', url: 'https://gorm.io', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用结构体标签定义模型', '合理使用 Preload 避免 N+1', '使用事务保证数据一致性'] }
      ],
      [
        { techId: 'ent', techName: 'Ent', strengths: ['类型安全', 'Facebook 出品', '代码生成'], weaknesses: ['学习曲线', '生态较小'], whenToChoose: '需要强类型安全' }
      ],
      [
        { scenario: 'Go Web 开发', description: '配合 Gin/Echo 使用', recommended: true },
        { scenario: '多数据库项目', description: '需要支持多种数据库', recommended: true }
      ]
    )
  },

  gin: {
    id: 'gin',
    name: 'Gin',
    category: 'backend',
    subcategory: 'Web框架',
    description: 'Go 语言编写的 HTTP Web 框架，性能优秀',
    tagline: 'Go 最快的全功能 Web 框架',
    version: '1.9.1',
    pros: ['性能优秀', '内存占用低', '中间件支持', '错误恢复', '验证和绑定'],
    cons: ['功能相对简单', '缺乏内置 ORM', '企业级特性需自行实现'],
    bestFor: ['高性能 API', '微服务', '轻量服务', '高并发应用'],
    notFor: ['复杂业务逻辑', '需要完整 ORM'],
    learningCurve: 'beginner',
    ecosystemScore: 78,
    popularity: { githubStars: 78000 },
    companyUsers: ['Uber', 'Netflix', 'Alibaba', 'Riot Games'],
    createdYear: 2014,
    maintainedBy: 'Gin Team',
    officialUrl: 'https://gin-gonic.com',
    githubUrl: 'https://github.com/gin-gonic/gin',
    documentationUrl: 'https://gin-gonic.com/docs',
    alternatives: ['echo', 'fiber', 'go-zero'],
    scores: {
      popularity: 85, maintenance: 82, ecosystem: 78, learningCurve: 88, enterpriseAdoption: 75,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: ginDeepDive
  },

  'go-zero': {
    id: 'go-zero',
    name: 'Go-Zero',
    category: 'backend',
    subcategory: '微服务框架',
    description: 'Go 语言的微服务框架，提供完整的微服务解决方案',
    tagline: '云原生 Go 微服务框架',
    version: '1.6.0',
    pros: ['微服务完整方案', '代码生成', '高性能', '服务治理', '中文文档优秀'],
    cons: ['生态相对较新', '学习曲线存在', '企业采用率增长中'],
    bestFor: ['微服务架构', '高并发系统', '云原生应用', '快速开发'],
    notFor: ['单体应用', '小型项目'],
    learningCurve: 'intermediate',
    ecosystemScore: 65,
    popularity: { githubStars: 28000 },
    companyUsers: ['Tencent', 'Bilibili', 'Xiaohongshu'],
    createdYear: 2020,
    maintainedBy: 'Kevin Wan (tal-tech)',
    officialUrl: 'https://go-zero.dev',
    githubUrl: 'https://github.com/zeromicro/go-zero',
    documentationUrl: 'https://go-zero.dev',
    alternatives: ['gin', 'go-micro', 'kratos'],
    scores: {
      popularity: 72, maintenance: 80, ecosystem: 65, learningCurve: 75, enterpriseAdoption: 70,
      total: 73, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: goZeroDeepDive
  },

  'spring-boot': {
    id: 'spring-boot',
    name: 'Spring Boot',
    category: 'backend',
    subcategory: 'Web框架',
    description: '基于 Spring 的 Java 框架，简化 Spring 应用初始搭建和开发过程',
    tagline: '约定优于配置的 Java 框架',
    version: '3.2.0',
    pros: ['企业级生态', '自动配置', '监控完善', '安全性强', '社区成熟'],
    cons: ['启动较慢', '内存占用高', '配置复杂', '学习曲线陡峭'],
    bestFor: ['企业级应用', '微服务架构', '传统单体应用', '银行金融'],
    notFor: ['Serverless', '快速启动场景'],
    learningCurve: 'advanced',
    ecosystemScore: 95,
    popularity: { githubStars: 74000 },
    companyUsers: ['Netflix', 'Amazon', 'Google', 'Alibaba', 'Huawei'],
    createdYear: 2014,
    maintainedBy: 'VMware (Pivotal)',
    officialUrl: 'https://spring.io/projects/spring-boot',
    githubUrl: 'https://github.com/spring-projects/spring-boot',
    documentationUrl: 'https://docs.spring.io/spring-boot',
    alternatives: ['quarkus', 'micronaut', 'jakarta-ee'],
    scores: {
      popularity: 92, maintenance: 90, ecosystem: 95, learningCurve: 65, enterpriseAdoption: 95,
      total: 89, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: springBootDeepDive
  },

  quarkus: {
    id: 'quarkus',
    name: 'Quarkus',
    category: 'backend',
    subcategory: 'Web框架',
    description: '为 Kubernetes 和 Serverless 优化的 Java 框架',
    tagline: '为云原生而生的 Java',
    version: '3.7.0',
    pros: ['快速启动', '低内存', 'GraalVM 支持', '开发模式', '云原生'],
    cons: ['生态较新', '学习资源较少', '企业采用率较低'],
    bestFor: ['Serverless', 'Kubernetes', '微服务', '云原生'],
    notFor: ['传统企业应用', '需要成熟生态'],
    learningCurve: 'intermediate',
    ecosystemScore: 65,
    popularity: { githubStars: 13000 },
    companyUsers: ['Red Hat', 'Deutsche Telekom'],
    createdYear: 2019,
    maintainedBy: 'Red Hat',
    officialUrl: 'https://quarkus.io',
    githubUrl: 'https://github.com/quarkusio/quarkus',
    documentationUrl: 'https://quarkus.io/guides',
    alternatives: ['spring-boot', 'micronaut', 'helidon'],
    scores: {
      popularity: 68, maintenance: 85, ecosystem: 65, learningCurve: 72, enterpriseAdoption: 60,
      total: 71, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: quarkusDeepDive
  },

  // ===== Java Core Technologies =====
  'mybatis-plus': {
    id: 'mybatis-plus',
    name: 'MyBatis-Plus',
    category: 'backend',
    subcategory: 'ORM',
    description: 'MyBatis 的增强工具，简化 CRUD 操作',
    tagline: '为简化开发而生',
    version: '3.5.5',
    pros: ['零配置 CRUD', '代码生成器', '分页插件', '性能优秀', '中文文档'],
    cons: ['依赖 MyBatis', '复杂查询仍需 SQL', 'Spring 生态绑定'],
    bestFor: ['快速开发', '标准 CRUD 应用', 'Spring Boot 项目'],
    notFor: ['非 Spring 项目', '复杂报表查询'],
    learningCurve: 'intermediate',
    ecosystemScore: 80,
    popularity: { githubStars: 16000 },
    companyUsers: ['阿里巴巴', '美团', '京东', '小米'],
    createdYear: 2016,
    maintainedBy: 'Baomidou',
    officialUrl: 'https://baomidou.com',
    githubUrl: 'https://github.com/baomidou/mybatis-plus',
    documentationUrl: 'https://baomidou.com/pages/24112f',
    alternatives: ['mybatis', 'hibernate', 'spring-data-jpa'],
    scores: {
      popularity: 82, maintenance: 88, ecosystem: 80, learningCurve: 85, enterpriseAdoption: 85,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '通用 CRUD', description: '内置 BaseMapper 提供常用 CRUD 方法，无需手写 SQL。' },
        { title: '条件构造器', description: 'Wrapper 链式 API 构建复杂查询条件。' },
        { title: '代码生成', description: '根据数据库表自动生成 Entity、Mapper、Service、Controller。' }
      ],
      [
        { type: 'official', title: 'MyBatis-Plus 文档', url: 'https://baomidou.com', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 Lambda 查询避免硬编码', '合理使用分页插件', '结合代码生成器提高效率'] }
      ],
      [
        { techId: 'mybatis', techName: 'MyBatis', strengths: ['更灵活', '原生 SQL 控制'], weaknesses: ['需要手写 SQL', '开发效率较低'], whenToChoose: '需要精细 SQL 控制' }
      ],
      [
        { scenario: 'Spring Boot 后端', description: '快速开发 Java 后端服务', recommended: true },
        { scenario: '管理后台系统', description: '大量 CRUD 操作的后台', recommended: true }
      ]
    )
  },

  'spring-security': {
    id: 'spring-security',
    name: 'Spring Security',
    category: 'backend',
    subcategory: '安全框架',
    description: '强大的 Spring 安全框架，提供认证和授权功能',
    tagline: '保护 Spring 应用的标准',
    version: '6.2.1',
    pros: ['功能全面', '高度可定制', 'OAuth2 支持', '与 Spring 集成', '企业级安全'],
    cons: ['配置复杂', '学习曲线陡峭', '概念较多', '文档分散'],
    bestFor: ['企业级应用', '需要复杂权限控制', 'OAuth2/OIDC', '微服务安全'],
    notFor: ['简单应用', '快速原型'],
    learningCurve: 'advanced',
    ecosystemScore: 92,
    popularity: { githubStars: 8500 },
    companyUsers: ['阿里巴巴', '腾讯', '京东', '各大银行'],
    createdYear: 2003,
    maintainedBy: 'Spring Team',
    officialUrl: 'https://spring.io/projects/spring-security',
    githubUrl: 'https://github.com/spring-projects/spring-security',
    documentationUrl: 'https://docs.spring.io/spring-security/reference',
    alternatives: ['apache-shiro', 'sa-token', 'jwt'],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 92, learningCurve: 70, enterpriseAdoption: 95,
      total: 88, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '认证与授权', description: '提供完整的认证和授权机制，支持多种认证方式。' },
        { title: '过滤器链', description: '基于过滤器的安全处理链，可高度定制。' },
        { title: '方法级安全', description: '支持注解控制方法级别的权限。' }
      ],
      [
        { type: 'official', title: 'Spring Security 文档', url: 'https://docs.spring.io/spring-security/reference', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 SecurityFilterChain 配置', '自定义 UserDetailsService', '合理使用 @PreAuthorize'] }
      ],
      [
        { techId: 'apache-shiro', techName: 'Apache Shiro', strengths: ['更简单', '独立使用'], weaknesses: ['功能较少', '更新较慢'], whenToChoose: '非 Spring 项目或简单安全需求' }
      ],
      [
        { scenario: '企业级应用安全', description: '复杂的权限控制需求', recommended: true },
        { scenario: 'OAuth2 集成', description: '第三方登录和授权', recommended: true }
      ]
    )
  },

  // ===== Rust Core Technologies =====
  seaorm: {
    id: 'seaorm',
    name: 'SeaORM',
    category: 'backend',
    subcategory: 'ORM',
    description: 'Rust 的异步 ORM，专为现代 Rust 设计',
    tagline: 'Rust 的异步 ORM 框架',
    version: '0.12.0',
    pros: ['完全异步', '类型安全', '代码生成', '多数据库支持', '活跃维护'],
    cons: ['生态相对较小', '编译时间较长', '学习曲线存在', '企业采用率低'],
    bestFor: ['Rust 异步应用', '需要类型安全', '现代 Rust 项目'],
    notFor: ['简单脚本', '快速原型', '团队无 Rust 经验'],
    learningCurve: 'advanced',
    ecosystemScore: 65,
    popularity: { githubStars: 6000 },
    companyUsers: ['Starfish Finance', 'Rust 开源项目'],
    createdYear: 2021,
    maintainedBy: 'SeaQL Team',
    officialUrl: 'https://www.sea-ql.org/SeaORM',
    githubUrl: 'https://github.com/SeaQL/sea-orm',
    documentationUrl: 'https://www.sea-ql.org/SeaORM/docs',
    alternatives: ['diesel', 'sqlx', 'tokio-postgres'],
    scores: {
      popularity: 70, maintenance: 88, ecosystem: 65, learningCurve: 65, enterpriseAdoption: 50,
      total: 72, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '异步优先', description: '基于 async/await 设计，完美集成 Tokio 运行时。' },
        { title: '实体生成', description: '从数据库模式自动生成 Rust 实体代码。' },
        { title: '关系映射', description: '支持一对一、一对多、多对多关系。' }
      ],
      [
        { type: 'official', title: 'SeaORM 文档', url: 'https://www.sea-ql.org/SeaORM/docs', description: '官方文档' }
      ],
      [
        { category: '最佳实践', items: ['使用 sea-orm-cli 生成实体', '合理使用连接池', '配合迁移工具使用'] }
      ],
      [
        { techId: 'diesel', techName: 'Diesel', strengths: ['编译时查询检查', '同步设计', '更成熟'], weaknesses: ['不支持异步', '学习曲线陡峭'], whenToChoose: '同步 Rust 应用' }
      ],
      [
        { scenario: 'Rust Web 后端', description: '配合 Axum/Actix-web 使用', recommended: true },
        { scenario: '异步数据处理', description: '需要高性能异步数据库操作', recommended: true }
      ]
    )
  },

  tokio: {
    id: 'tokio',
    name: 'Tokio',
    category: 'backend',
    subcategory: '异步运行时',
    description: 'Rust 的异步运行时，提供 I/O、定时器、多任务等功能',
    tagline: 'Rust 异步编程的基石',
    version: '1.35.0',
    pros: ['高性能异步', '多线程调度', '丰富的生态', '生产验证', '内存安全'],
    cons: ['学习曲线陡峭', '调试困难', '生态分散', '编译时间久'],
    bestFor: ['高性能网络服务', '异步应用', '实时系统', '微服务'],
    notFor: ['简单脚本', 'CPU 密集型任务', '团队无 Rust 经验'],
    learningCurve: 'advanced',
    ecosystemScore: 80,
    popularity: { githubStars: 25000 },
    companyUsers: ['Discord', 'Fly.io', 'AWS (部分服务)'],
    createdYear: 2016,
    maintainedBy: 'Tokio Team',
    officialUrl: 'https://tokio.rs',
    githubUrl: 'https://github.com/tokio-rs/tokio',
    documentationUrl: 'https://docs.rs/tokio',
    alternatives: ['async-std', 'smol', 'may'],
    scores: {
      popularity: 85, maintenance: 92, ecosystem: 80, learningCurve: 60, enterpriseAdoption: 70,
      total: 80, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: createDeepDive(
      [
        { title: '多线程调度', description: '工作窃取调度器，高效利用多核 CPU。' },
        { title: '异步 I/O', description: '基于 epoll/kqueue/IOCP 的高性能异步 I/O。' },
        { title: '超时与间隔', description: '内置定时器功能，支持超时和周期性任务。' }
      ],
      [
        { type: 'official', title: 'Tokio 文档', url: 'https://tokio.rs/tokio/tutorial', description: '官方教程' }
      ],
      [
        { category: '最佳实践', items: ['使用 tokio::spawn 创建任务', '合理使用通道进行通信', '避免阻塞运行时'] }
      ],
      [
        { techId: 'async-std', techName: 'async-std', strengths: ['标准库风格 API', '更简单'], weaknesses: ['生态较小', '企业采用率低'], whenToChoose: '偏好标准库风格的团队' }
      ],
      [
        { scenario: '高性能网络服务', description: '需要处理大量并发连接', recommended: true },
        { scenario: '实时通信', description: 'WebSocket、聊天服务等', recommended: true }
      ]
    )
  },

  // ===== Archived Technologies =====
  axum: {
    id: 'axum',
    name: 'Axum',
    category: 'backend',
    subcategory: 'Web框架',
    description: 'Rust 的异步 Web 框架，基于 Tokio 和 Tower',
    tagline: '符合人体工程学的模块化 Rust Web 框架',
    version: '0.7.0',
    pros: ['Tower 生态集成', '类型安全', '异步性能', '内存安全'],
    cons: ['生态系统较小', 'Rust 学习曲线', '企业采用率低', '社区活跃度下降'],
    bestFor: ['Rust 微服务', '学习 Rust Web'],
    notFor: ['生产环境', '快速开发'],
    learningCurve: 'advanced',
    ecosystemScore: 58,
    popularity: { githubStars: 17000 },
    companyUsers: [],
    createdYear: 2021,
    maintainedBy: 'Tokio Team',
    officialUrl: 'https://docs.rs/axum',
    githubUrl: 'https://github.com/tokio-rs/axum',
    documentationUrl: 'https://docs.rs/axum',
    alternatives: ['actix-web', 'rocket', 'warp'],
    scores: {
      popularity: 65, maintenance: 88, ecosystem: 58, learningCurve: 55, enterpriseAdoption: 45,
      total: 66, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'archived',
    archiveReason: 'low_popularity',
    archiveNote: '目前 Rust Web 开发中，Actix-web 更加成熟且社区活跃，Axum 虽由 Tokio 团队维护但采用率较低。',
    archivedAt: '2025-02-21T00:00:00Z',
    replacedBy: 'actix-web',
    deepDive: axumDeepDive
  },

  'actix-web': {
    id: 'actix-web',
    name: 'Actix-web',
    category: 'backend',
    subcategory: 'Web框架',
    description: 'Rust 的高性能 Web 框架，基于 Actix actor 系统',
    tagline: '极快的 Rust Web 框架',
    version: '4.5.0',
    pros: ['性能极高', '功能丰富', '中间件系统', '历史悠久'],
    cons: ['维护者变动历史', '生态系统较小', 'Rust 学习曲线', '企业采用率低'],
    bestFor: ['极致性能', '学习 Rust Web'],
    notFor: ['生产环境', '快速开发', '团队规模较大'],
    learningCurve: 'advanced',
    ecosystemScore: 55,
    popularity: { githubStars: 21000 },
    companyUsers: ['Brave', 'Microsoft (部分项目)'],
    createdYear: 2017,
    maintainedBy: 'Actix Team',
    officialUrl: 'https://actix.rs',
    githubUrl: 'https://github.com/actix/actix-web',
    documentationUrl: 'https://actix.rs/docs',
    alternatives: ['axum', 'rocket', 'warp'],
    scores: {
      popularity: 62, maintenance: 82, ecosystem: 55, learningCurve: 58, enterpriseAdoption: 40,
      total: 63, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'archived',
    archiveReason: 'low_popularity',
    archiveNote: 'Rust Web 框架目前主流采用率都较低，更适合特定性能场景。整体 Rust Web 开发生态尚不成熟。',
    archivedAt: '2025-02-21T00:00:00Z',
    deepDive: axumDeepDive
  },

  // ===== Storage Technologies =====

  // ----- 关系型数据库 (relational) -----
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'storage',
    subcategory: '关系型',
    description: '功能强大的开源关系型数据库，支持复杂的 SQL 查询、事务、扩展性强',
    tagline: '功能强大的开源关系型数据库',
    version: '16.x',
    pros: ['强大的 SQL 支持', '丰富的扩展生态', 'MVCC 并发控制', 'JSON 支持'],
    cons: ['配置复杂', '默认性能保守', '学习曲线较陡'],
    bestFor: ['企业级应用', '复杂查询', 'GIS 应用'],
    notFor: ['简单的 KV 存储', '极高并发写入'],
    learningCurve: 'intermediate',
    ecosystemScore: 95,
    popularity: { githubStars: 11000 },
    companyUsers: ['Apple', 'Instagram', 'Spotify', 'Uber'],
    createdYear: 1996,
    maintainedBy: 'PostgreSQL Global Development Group',
    officialUrl: 'https://www.postgresql.org',
    githubUrl: 'https://github.com/postgres/postgres',
    documentationUrl: 'https://www.postgresql.org/docs/',
    alternatives: ['mysql', 'tidb', 'cockroachdb'],
    scores: {
      popularity: 92, maintenance: 95, ecosystem: 95, learningCurve: 70, enterpriseAdoption: 98,
      total: 91, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'ACID 事务', description: '完整的事务支持，保证数据一致性和持久性。' },
        { title: 'MVCC', description: '多版本并发控制，读写不阻塞。' },
        { title: '扩展性', description: '支持自定义类型、函数、索引方法。' },
        { title: 'JSON 支持', description: '同时支持传统关系型和 JSON 文档存储。' }
      ],
      resources: [
        { type: 'official', title: 'PostgreSQL 文档', url: 'https://www.postgresql.org/docs/', description: '官方文档' },
        { type: 'community', title: 'PG 玩家俱乐部', url: 'https://www.postgresql.org/community/', description: '社区' }
      ],
      bestPractices: [
        { category: '配置优化', items: ['合理配置 shared_buffers', '启用 WAL', '配置合适的 checkpoint'] },
        { category: '索引使用', items: ['避免过度索引', '使用 EXPLAIN 分析', '考虑部分索引'] }
      ],
      comparisons: [
        { techId: 'mysql', techName: 'MySQL', strengths: ['更简单', '互联网应用广泛'], weaknesses: ['SQL 标准支持差', '扩展性有限'], whenToChoose: 'Web 应用' }
      ],
      useCases: [
        { scenario: '企业级应用', description: '金融、保险等需要强一致性的系统', recommended: true },
        { scenario: '数据分析', description: '复杂查询和数据仓库', recommended: true }
      ]
    }
  },

  mysql: {
    id: 'mysql',
    name: 'MySQL',
    category: 'storage',
    subcategory: '关系型',
    description: '广泛使用的关系型数据库，高可靠性，开源生态成熟',
    tagline: '广泛使用的关系型数据库',
    version: '8.0',
    pros: ['生态成熟', '性能优秀', '运维简单', '兼容性好'],
    cons: ['SQL 标准支持一般', '复杂查询性能差', '默认配置保守'],
    bestFor: ['Web 应用', '互联网产品', '中小型系统'],
    notFor: ['复杂分析查询', '事务密集型应用'],
    learningCurve: 'beginner',
    ecosystemScore: 98,
    popularity: { githubStars: 9500 },
    companyUsers: ['Google', 'Meta', 'Twitter', 'Alibaba'],
    createdYear: 1995,
    maintainedBy: 'Oracle',
    officialUrl: 'https://www.mysql.com',
    githubUrl: 'https://github.com/mysql/mysql-server',
    documentationUrl: 'https://dev.mysql.com/doc/',
    alternatives: ['postgresql', 'mariadb', 'tidb'],
    scores: {
      popularity: 95, maintenance: 88, ecosystem: 98, learningCurve: 85, enterpriseAdoption: 95,
      total: 92, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'InnoDB 引擎', description: '支持事务和行级锁，高并发处理能力强。' },
        { title: '复制机制', description: '支持主从、半同步、GTID 等多种复制方式。' },
        { title: '分区表', description: '支持 RANGE、LIST、HASH 分区。' },
        { title: 'JSON 函数', description: 'MySQL 8.0 增强的 JSON 支持。' }
      ],
      resources: [
        { type: 'official', title: 'MySQL 文档', url: 'https://dev.mysql.com/doc/', description: '官方文档' }
      ],
      bestPractices: [
        { category: 'SQL 优化', items: ['避免 SELECT *', '使用 EXPLAIN 分析', '合理创建索引'] }
      ],
      comparisons: [
        { techId: 'postgresql', techName: 'PostgreSQL', strengths: ['SQL 标准支持好', '扩展性强'], weaknesses: ['配置复杂', '性能保守'], whenToChoose: '需要复杂查询时' }
      ],
      useCases: [
        { scenario: '互联网应用', description: '社交、电商、游戏后端', recommended: true },
        { scenario: 'CMS 内容管理', description: 'WordPress、Drupal 等', recommended: true }
      ]
    }
  },

  tidb: {
    id: 'tidb',
    name: 'TiDB',
    category: 'storage',
    subcategory: '关系型',
    description: '分布式 NewSQL 数据库，兼容 MySQL 协议，支持水平扩展',
    tagline: '分布式 NewSQL 数据库',
    version: '8.0',
    pros: ['水平扩展', '强一致性', 'MySQL 兼容', 'HTAP 能力'],
    cons: ['运维复杂', '资源消耗大', '特定场景性能不如专用数据库'],
    bestFor: ['大规模 OLTP', '需要强一致性的 OLAP', '分库分表场景'],
    notFor: ['极低延迟场景', '简单小规模应用'],
    learningCurve: 'advanced',
    ecosystemScore: 78,
    popularity: { githubStars: 35000 },
    companyUsers: ['ByteDance', 'Tencent', 'Xiaomi', 'Shopee'],
    createdYear: 2017,
    maintainedBy: 'PingCAP',
    officialUrl: 'https://pingcap.com/tidb',
    githubUrl: 'https://github.com/pingcap/tidb',
    documentationUrl: 'https://docs.pingcap.com/tidb/',
    alternatives: ['cockroachdb', 'oceanbase'],
    scores: {
      popularity: 85, maintenance: 82, ecosystem: 78, learningCurve: 60, enterpriseAdoption: 75,
      total: 79, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '水平扩展', description: '支持在线水平扩展，自动数据均衡。' },
        { title: '强一致性', description: '基于 Raft 的分布式事务，保证 ACID。' },
        { title: 'MySQL 兼容', description: '协议级兼容，现有应用零改动迁移。' },
        { title: 'HTAP', description: '同时支持事务处理和分析查询。' }
      ],
      resources: [
        { type: 'official', title: 'TiDB 文档', url: 'https://docs.pingcap.com/tidb/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '部署', items: ['使用 TiUP 部署', '配置合理的 TiKV 数量', '开启 Placement Driver'] }
      ],
      comparisons: [
        { techId: 'cockroachdb', techName: 'CockroachDB', strengths: ['国内生态好', '中文文档完善'], weaknesses: ['国际知名度较低'], whenToChoose: '国内团队' }
      ],
      useCases: [
        { scenario: '金融级应用', description: '银行、保险等需要强一致性', recommended: true },
        { scenario: '电商大促', description: '应对突发流量', recommended: true }
      ]
    }
  },

  cockroachdb: {
    id: 'cockroachdb',
    name: 'CockroachDB',
    category: 'storage',
    subcategory: '关系型',
    description: '分布式 NewSQL 数据库，Kubernetes 原生，强一致性和高可用',
    tagline: '分布式 NewSQL 数据库',
    version: '24.x',
    pros: ['Kubernetes 原生', '强一致性', '水平扩展', 'PostgreSQL 兼容'],
    cons: ['性能开销大', '运维复杂', '资源消耗高'],
    bestFor: ['多地域部署', '金融级应用', '需要强一致性的 OLTP'],
    notFor: ['简单小规模应用', '极致性能场景'],
    learningCurve: 'advanced',
    ecosystemScore: 72,
    popularity: { githubStars: 28000 },
    companyUsers: ['CockroachDB Inc.', 'Apple', 'Cloudflare', 'Netflix'],
    createdYear: 2015,
    maintainedBy: 'CockroachDB Inc.',
    officialUrl: 'https://www.cockroachlabs.com',
    githubUrl: 'https://github.com/cockroachdb/cockroach',
    documentationUrl: 'https://www.cockroachlabs.com/docs/',
    alternatives: ['tidb', 'postgresql'],
    scores: {
      popularity: 75, maintenance: 80, ecosystem: 72, learningCurve: 55, enterpriseAdoption: 70,
      total: 72, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '分布式架构', description: '水平扩展，支持多地域部署。' },
        { title: '强一致性', description: '基于 Raft 共识协议，ACID 事务。' },
        { title: 'Kubernetes 原生', description: 'Operator 支持，Operator-Lifecycle Manager。' },
        { title: 'PostgreSQL 兼容', description: '兼容 PostgreSQL 协议和语法。' }
      ],
      resources: [
        { type: 'official', title: 'CockroachDB 文档', url: 'https://www.cockroachlabs.com/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '部署', items: ['使用 CockroachDB Operator', '配置 locality 优化分布', '使用负载均衡'] }
      ],
      comparisons: [
        { techId: 'tidb', techName: 'TiDB', strengths: ['国内生态好', 'HTAP 支持'], weaknesses: ['不是 Kubernetes 原生'], whenToChoose: '国内团队' }
      ],
      useCases: [
        { scenario: '多地域应用', description: '全球化部署应用', recommended: true },
        { scenario: '金融级应用', description: '银行、支付等需要强一致性', recommended: true }
      ]
    }
  },

  // ----- 列式存储 (columnar) -----
  clickhouse: {
    id: 'clickhouse',
    name: 'ClickHouse',
    category: 'storage',
    subcategory: '列式存储',
    description: '列式分析数据库，高速 OLAP 查询，万亿级数据秒级响应',
    tagline: '高速列式分析数据库',
    version: '24.x',
    pros: ['查询速度快', '压缩率高', '向量化执行', 'SQL 支持好'],
    cons: ['写入性能一般', '事务支持弱', '运维复杂'],
    bestFor: ['OLAP', '日志分析', '用户行为分析'],
    notFor: ['OLTP', '需要事务的场景', '小数据量'],
    learningCurve: 'intermediate',
    ecosystemScore: 75,
    popularity: { githubStars: 39000 },
    companyUsers: ['ByteDance', 'Tencent', 'Alibaba', 'Cloudflare'],
    createdYear: 2016,
    maintainedBy: 'ClickHouse Inc.',
    officialUrl: 'https://clickhouse.com',
    githubUrl: 'https://github.com/ClickHouse/ClickHouse',
    documentationUrl: 'https://clickhouse.com/docs/',
    alternatives: ['druid', 'starrocks', ' Pinot'],
    scores: {
      popularity: 90, maintenance: 88, ecosystem: 75, learningCurve: 70, enterpriseAdoption: 80,
      total: 83, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '列式存储', description: '数据按列存储，聚合查询极快。' },
        { title: '向量化执行', description: 'SIMD 指令集，CPU 利用率高。' },
        { title: '压缩算法', description: '多种压缩算法，存储成本低。' },
        { title: '分布式', description: '原生分布式，多机并行。' }
      ],
      resources: [
        { type: 'official', title: 'ClickHouse 文档', url: 'https://clickhouse.com/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['使用 MergeTree 表引擎', '合理设计稀疏索引', '避免 NULL'] }
      ],
      comparisons: [
        { techId: 'druid', techName: 'Apache Druid', strengths: ['实时写入强', '支持数据摄入'], weaknesses: ['SQL 支持较弱'], whenToChoose: '需要实时摄入时' }
      ],
      useCases: [
        { scenario: '用户行为分析', description: '埋点数据、点击流分析', recommended: true },
        { scenario: '日志分析', description: '业务日志、安全日志', recommended: true }
      ]
    }
  },

  hbase: {
    id: 'hbase',
    name: 'HBase',
    category: 'storage',
    subcategory: '列式存储',
    description: 'BigTable 类型的列式存储，构建在 HDFS 之上，适合随机读写',
    tagline: 'BigTable 类型列式存储',
    version: '2.5',
    pros: ['高扩展', '高写入', '稀疏数据支持', 'Hadoop 生态'],
    cons: ['延迟高', '运维复杂', '不支持 SQL'],
    bestFor: ['海量数据写入', '随机读写', 'Hadoop 集成'],
    notFor: ['低延迟场景', '复杂查询', '事务需求'],
    learningCurve: 'advanced',
    ecosystemScore: 72,
    popularity: { githubStars: 7000 },
    companyUsers: ['Google', 'Facebook', 'Tencent', 'Alibaba'],
    createdYear: 2007,
    maintainedBy: 'Apache Software Foundation',
    officialUrl: 'https://hbase.apache.org',
    githubUrl: 'https://github.com/apache/hbase',
    documentationUrl: 'https://hbase.apache.org/book.html',
    alternatives: ['cassandra', 'dynamodb'],
    scores: {
      popularity: 72, maintenance: 75, ecosystem: 72, learningCurve: 55, enterpriseAdoption: 78,
      total: 71, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '列式存储', description: 'Wide-Column 模型，适合稀疏数据。' },
        { title: '高扩展', description: '基于 HDFS，水平扩展简单。' },
        { title: '随机读写', description: '毫秒级延迟的随机读写能力。' },
        { title: '一致性', description: '强一致性保证。' }
      ],
      resources: [
        { type: 'official', title: 'HBase 文档', url: 'https://hbase.apache.org/book.html', description: '官方文档' }
      ],
      bestPractices: [
        { category: 'RowKey 设计', items: ['避免热点', '利用 RowKey 排序', '适当冗余字段'] }
      ],
      comparisons: [
        { techId: 'cassandra', techName: 'Cassandra', strengths: ['CAP 理论灵活', '无单点'], weaknesses: ['最终一致性'], whenToChoose: '需要高可用时' }
      ],
      useCases: [
        { scenario: '用户画像', description: '海量用户特征存储', recommended: true },
        { scenario: '消息存储', description: '聊天记录、订单历史', recommended: true }
      ]
    }
  },

  druid: {
    id: 'druid',
    name: 'Apache Druid',
    category: 'storage',
    subcategory: '列式存储',
    description: '实时分析列式存储，支持高并发摄入和低延迟查询',
    tagline: '实时分析列式存储',
    version: '30.x',
    pros: ['实时摄入', '低延迟查询', '高并发', '多数据源支持'],
    cons: ['运维复杂', '资源消耗大', '冷启动慢'],
    bestFor: ['实时分析', '指标存储', 'BI 应用'],
    notFor: ['事务写入', '复杂关联查询'],
    learningCurve: 'intermediate',
    ecosystemScore: 70,
    popularity: { githubStars: 24000 },
    companyUsers: ['Airbnb', 'Netflix', 'Uber', 'Alibaba'],
    createdYear: 2012,
    maintainedBy: 'Apache Software Foundation',
    officialUrl: 'https://druid.apache.org',
    githubUrl: 'https://github.com/apache/druid',
    documentationUrl: 'https://druid.apache.org/docs/latest/',
    alternatives: ['clickhouse', 'pinot'],
    scores: {
      popularity: 78, maintenance: 80, ecosystem: 70, learningCurve: 65, enterpriseAdoption: 72,
      total: 75, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '实时摄入', description: 'Kafka、Streams 实时摄入，秒级可见。' },
        { title: '低延迟查询', description: 'Sub-second 级别查询响应。' },
        { title: '水平扩展', description: '支持快速水平扩展。' },
        { title: '多数据源', description: 'Kafka、HDFS、S3 等多种摄入源。' }
      ],
      resources: [
        { type: 'official', title: 'Druid 文档', url: 'https://druid.apache.org/docs/latest/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '数据建模', items: ['合理设计 Segment', '配置合适的 Roll-up', '分区策略'] }
      ],
      comparisons: [
        { techId: 'clickhouse', techName: 'ClickHouse', strengths: ['查询性能好', '压缩率高'], weaknesses: ['实时摄入弱'], whenToChoose: '查询为主时' }
      ],
      useCases: [
        { scenario: '实时大屏', description: '业务指标实时展示', recommended: true },
        { scenario: '广告分析', description: '广告投放效果分析', recommended: true }
      ]
    }
  },

  starrocks: {
    id: 'starrocks',
    name: 'StarRocks',
    category: 'storage',
    subcategory: '列式存储',
    description: '现代化向量化列式存储，超高速 OLAP 查询能力',
    tagline: '现代化向量化列式存储',
    version: '3.2',
    pros: ['向量化执行', '全面向量化', '高性能', '简化运维'],
    cons: ['生态较新', '社区相对小', '特定功能在完善'],
    bestFor: ['OLAP', '数据湖分析', '高并发查询'],
    notFor: ['OLTP', '需要强一致性'],
    learningCurve: 'beginner',
    ecosystemScore: 68,
    popularity: { githubStars: 12000 },
    companyUsers: ['ByteDance', 'Tencent', 'Alibaba', 'Xiaomi'],
    createdYear: 2020,
    maintainedBy: 'StarRocks Community',
    officialUrl: 'https://starrocks.io',
    githubUrl: 'https://github.com/StarRocks/starrocks',
    documentationUrl: 'https://docs.starrocks.io/',
    alternatives: ['clickhouse', 'duckdb'],
    scores: {
      popularity: 75, maintenance: 82, ecosystem: 68, learningCurve: 75, enterpriseAdoption: 65,
      total: 74, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '全面向量化', description: '所有算子向量化执行，极致性能。' },
        { title: '物化视图', description: '自动化的物化视图，加速查询。' },
        { title: '数据湖集成', description: '直读 Iceberg、Hudi、Delta Lake。' },
        { title: '现代化架构', description: '简化设计，易于运维。' }
      ],
      resources: [
        { type: 'official', title: 'StarRocks 文档', url: 'https://docs.starrocks.io/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '表设计', items: ['使用星型模型', '合理分布键', '使用物化视图'] }
      ],
      comparisons: [
        { techId: 'clickhouse', techName: 'ClickHouse', strengths: ['社区成熟', '生态丰富'], weaknesses: ['运维复杂'], whenToChoose: '需要简单运维时' }
      ],
      useCases: [
        { scenario: '实时 BI', description: '秒级 BI 分析', recommended: true },
        { scenario: '数据湖查询', description: '直接查询数据湖', recommended: true }
      ]
    }
  },

  pinot: {
    id: 'pinot',
    name: 'Apache Pinot',
    category: 'storage',
    subcategory: '列式存储',
    description: '实时分析列式存储，LinkedIn 出品，支持低延迟查询和实时摄入',
    tagline: 'LinkedIn 实时分析数据库',
    version: '1.0',
    pros: ['实时摄入', '低延迟查询', '多数据源支持', '水平扩展'],
    cons: ['运维复杂', '生态较小', '学习曲线陡峭'],
    bestFor: ['实时分析', '用户行为分析', '广告指标'],
    notFor: ['简单查询', '需要强事务'],
    learningCurve: 'advanced',
    ecosystemScore: 65,
    popularity: { githubStars: 19000 },
    companyUsers: ['LinkedIn', 'Uber', 'Walmart', 'Microsoft'],
    createdYear: 2015,
    maintainedBy: 'Apache Software Foundation',
    officialUrl: 'https://pinot.apache.org',
    githubUrl: 'https://github.com/apache/pinot',
    documentationUrl: 'https://docs.pinot.apache.org/',
    alternatives: ['clickhouse', 'druid'],
    scores: {
      popularity: 72, maintenance: 78, ecosystem: 65, learningCurve: 55, enterpriseAdoption: 70,
      total: 70, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '实时摄入', description: 'Kafka、SQL 实时摄入，秒级可见。' },
        { title: '低延迟查询', description: 'P++ 引擎，sub-second 级别响应。' },
        { title: '多数据源', description: 'Kafka、HDFS、S3 等多种摄入源。' },
        { title: '水平扩展', description: '支持快速水平扩展。' }
      ],
      resources: [
        { type: 'official', title: 'Pinot 文档', url: 'https://docs.pinot.apache.org/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['合理设计 schema', '配置合适的 index', '使用 star-tree 索引'] }
      ],
      comparisons: [
        { techId: 'clickhouse', techName: 'ClickHouse', strengths: ['社区成熟', '查询性能好'], weaknesses: ['实时摄入弱'], whenToChoose: '查询为主时' }
      ],
      useCases: [
        { scenario: '实时大屏', description: '业务指标实时展示', recommended: true },
        { scenario: '广告分析', description: '广告投放效果分析', recommended: true }
      ]
    }
  },

  // ----- 文档数据库 (document) -----
  mongodb: {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'storage',
    subcategory: '文档型',
    description: '文档数据库，灵活的 JSON 模型，易于扩展',
    tagline: '灵活的文档数据库',
    version: '7.0',
    pros: ['灵活的模型', '易于扩展', '丰富的查询', '成熟稳定'],
    cons: ['内存消耗大', '复杂查询性能一般', '事务支持有限'],
    bestFor: ['内容管理', '实时分析', '物联网数据'],
    notFor: ['复杂关联查询', '强事务场景'],
    learningCurve: 'beginner',
    ecosystemScore: 92,
    popularity: { githubStars: 26000 },
    companyUsers: ['Google', 'Meta', 'eBay', 'Airbnb'],
    createdYear: 2009,
    maintainedBy: 'MongoDB Inc.',
    officialUrl: 'https://www.mongodb.com',
    githubUrl: 'https://github.com/mongodb/mongo',
    documentationUrl: 'https://www.mongodb.com/docs/',
    alternatives: ['dynamodb', 'couchbase'],
    scores: {
      popularity: 92, maintenance: 88, ecosystem: 92, learningCurve: 80, enterpriseAdoption: 90,
      total: 89, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '文档模型', description: '灵活的 JSON 文档，无需预定义结构。' },
        { title: '索引', description: '支持多种索引类型，全文、地理空间等。' },
        { title: '复制集', description: '自动故障转移，数据冗余。' },
        { title: '分片', description: '水平扩展，支持海量数据。' }
      ],
      resources: [
        { type: 'official', title: 'MongoDB 文档', url: 'https://www.mongodb.com/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['嵌入式 vs 引用', '避免过度嵌套', '合理使用索引'] }
      ],
      comparisons: [
        { techId: 'dynamodb', techName: 'DynamoDB', strengths: ['AWS 集成', '完全托管'], weaknesses: ['厂商锁定', '灵活性差'], whenToChoose: '在 AWS 上时' }
      ],
      useCases: [
        { scenario: '内容管理', description: 'CMS、产品目录', recommended: true },
        { scenario: '实时分析', description: '用户行为分析', recommended: true }
      ]
    }
  },

  dynamodb: {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    category: 'storage',
    subcategory: '文档型',
    description: 'AWS 全托管文档数据库，Serverless 模式，极高可用性和自动扩展',
    tagline: 'AWS 全托管文档数据库',
    version: '2024',
    pros: ['完全托管', 'Serverless', '极高可用', '自动扩展'],
    cons: ['厂商锁定', '灵活性差', '成本不可预测'],
    bestFor: ['AWS 原生应用', 'Serverless 应用', '需要极高可用'],
    notFor: ['多云部署', '需要复杂查询', '成本敏感'],
    learningCurve: 'intermediate',
    ecosystemScore: 80,
    popularity: { githubStars: 0 },
    companyUsers: ['Amazon', 'AWS', 'Lyft', 'Airbnb'],
    createdYear: 2012,
    maintainedBy: 'Amazon Web Services',
    officialUrl: 'https://aws.amazon.com/dynamodb/',
    githubUrl: '',
    documentationUrl: 'https://docs.aws.amazon.com/dynamodb/',
    alternatives: ['mongodb', 'couchbase'],
    scores: {
      popularity: 88, maintenance: 90, ecosystem: 80, learningCurve: 70, enterpriseAdoption: 92,
      total: 85, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'Serverless', description: '无需管理服务器，按需付费。' },
        { title: '高可用', description: '多 AZ 部署，自动故障恢复。' },
        { title: '自动扩展', description: '根据流量自动扩展吞吐。' },
        { title: 'DAX', description: '内置内存缓存，加速读取。' }
      ],
      resources: [
        { type: 'official', title: 'DynamoDB 文档', url: 'https://docs.aws.amazon.com/dynamodb/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['使用单表设计', '合理使用 GSI', '避免热分区'] }
      ],
      comparisons: [
        { techId: 'mongodb', techName: 'MongoDB', strengths: ['灵活性高', '开源'], weaknesses: ['需要自己运维'], whenToChoose: '需要开源或灵活性时' }
      ],
      useCases: [
        { scenario: 'Serverless 应用', description: 'Lambda 配合 DynamoDB', recommended: true },
        { scenario: '游戏', description: '玩家数据、会话存储', recommended: true }
      ]
    }
  },

  couchbase: {
    id: 'couchbase',
    name: 'Couchbase',
    category: 'storage',
    subcategory: '文档型',
    description: '高性能文档数据库，SQL++ 查询，内存优先架构',
    tagline: '高性能文档数据库',
    version: '7.2',
    pros: ['高性能', 'SQL++ 查询', '内存优先', '集群支持'],
    cons: ['内存消耗大', '学习曲线', '成本较高'],
    bestFor: ['实时应用', '会话存储', '内容管理'],
    notFor: ['简单场景', '成本敏感'],
    learningCurve: 'intermediate',
    ecosystemScore: 72,
    popularity: { githubStars: 14000 },
    companyUsers: ['Couchbase Inc.', 'Microsoft', 'Amazon', 'Google'],
    createdYear: 2011,
    maintainedBy: 'Couchbase Inc.',
    officialUrl: 'https://www.couchbase.com',
    githubUrl: 'https://github.com/couchbase/couchbase-server',
    documentationUrl: 'https://docs.couchbase.com/',
    alternatives: ['mongodb', 'dynamodb'],
    scores: {
      popularity: 72, maintenance: 78, ecosystem: 72, learningCurve: 65, enterpriseAdoption: 70,
      total: 72, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'SQL++', description: '类似 SQL 的查询语言，灵活性强。' },
        { title: '内存优先', description: '内存缓存加速，热数据高性能。' },
        { title: '集群', description: '水平扩展，支持快速故障转移。' },
        { title: '移动端', description: 'Couchbase Lite 支持移动端同步。' }
      ],
      resources: [
        { type: 'official', title: 'Couchbase 文档', url: 'https://docs.couchbase.com/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['使用 JSON 文档', '合理使用索引', '规划 bucket 大小'] }
      ],
      comparisons: [
        { techId: 'mongodb', techName: 'MongoDB', strengths: ['生态成熟', '社区大'], weaknesses: ['SQL 支持弱'], whenToChoose: '需要 SQL 时' }
      ],
      useCases: [
        { scenario: '实时应用', description: '游戏、实时分析', recommended: true },
        { scenario: '会话存储', description: '用户会话数据', recommended: true }
      ]
    }
  },

  // ----- 键值存储 (key-value) -----
  redis: {
    id: 'redis',
    name: 'Redis',
    category: 'storage',
    subcategory: '键值存储',
    description: '内存键值存储，高性能缓存，支持多种数据结构',
    tagline: '高性能内存键值存储',
    version: '7.4',
    pros: ['性能极高', '丰富数据结构', '主从复制', '集群支持'],
    cons: ['内存限制', '持久化开销', '单线程限制'],
    bestFor: ['缓存', '会话存储', '实时榜单'],
    notFor: ['持久化存储', '海量冷数据'],
    learningCurve: 'beginner',
    ecosystemScore: 98,
    popularity: { githubStars: 68000 },
    companyUsers: ['Google', 'Amazon', 'Alibaba', 'Tencent'],
    createdYear: 2009,
    maintainedBy: 'Redis Ltd.',
    officialUrl: 'https://redis.io',
    githubUrl: 'https://github.com/redis/redis',
    documentationUrl: 'https://redis.io/docs/',
    alternatives: ['memcached', 'rocksdb'],
    scores: {
      popularity: 98, maintenance: 95, ecosystem: 98, learningCurve: 85, enterpriseAdoption: 98,
      total: 96, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '多种数据结构', description: 'String、Hash、List、Set、ZSet 等。' },
        { title: '内存存储', description: '极低延迟，纳秒级响应。' },
        { title: '持久化', description: 'RDB、AOF 两种持久化方式。' },
        { title: '集群', description: '支持主从、哨兵、集群模式。' }
      ],
      resources: [
        { type: 'official', title: 'Redis 文档', url: 'https://redis.io/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '使用场景', items: ['缓存而非数据库', '合理设置 TTL', '避免大 key'] }
      ],
      comparisons: [
        { techId: 'memcached', techName: 'Memcached', strengths: ['简单', '内存效率高'], weaknesses: ['数据结构单一'], whenToChoose: '简单缓存时' }
      ],
      useCases: [
        { scenario: '缓存', description: '热点数据缓存，加速访问', recommended: true },
        { scenario: '会话存储', description: '分布式会话', recommended: true },
        { scenario: '实时榜单', description: '游戏排行、投票', recommended: true }
      ]
    }
  },

  rocksdb: {
    id: 'rocksdb',
    name: 'RocksDB',
    category: 'storage',
    subcategory: '键值存储',
    description: '嵌入键值存储，LSM 树结构，高写入性能',
    tagline: '高性能嵌入键值存储',
    version: '9.x',
    pros: ['高写入性能', '嵌入部署', '可配置调优', 'Flash 优化'],
    cons: ['读取延迟不稳定', '内存消耗大', '运维困难'],
    bestFor: ['嵌入应用', '日志存储', '时间序列'],
    notFor: ['通用数据库', '需要 SQL'],
    learningCurve: 'intermediate',
    ecosystemScore: 72,
    popularity: { githubStars: 30000 },
    companyUsers: ['Facebook', 'Google', 'LinkedIn', 'Netflix'],
    createdYear: 2012,
    maintainedBy: 'Meta',
    officialUrl: 'https://rocksdb.org',
    githubUrl: 'https://github.com/facebook/rocksdb',
    documentationUrl: 'https://rocksdb.org/docs/',
    alternatives: ['leveldb', 'badger'],
    scores: {
      popularity: 80, maintenance: 85, ecosystem: 72, learningCurve: 65, enterpriseAdoption: 78,
      total: 77, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'LSM 树', description: 'Log-Structured Merge-Tree，高写入吞吐。' },
        { title: '灵活配置', description: '可配置压缩、缓存、bloom filter。' },
        { title: 'Flash 优化', description: '针对 SSD/Flash 存储优化。' },
        { title: '嵌入部署', description: '零依赖，适合嵌入式场景。' }
      ],
      resources: [
        { type: 'official', title: 'RocksDB 文档', url: 'https://rocksdb.org/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '配置', items: ['根据数据量配置 write_buffer_size', '选择合适的压缩算法'] }
      ],
      comparisons: [
        { techId: 'leveldb', techName: 'LevelDB', strengths: ['Google 出品', '简单'], weaknesses: ['性能较差'], whenToChoose: '简单场景' }
      ],
      useCases: [
        { scenario: 'Kafka 存储', description: 'Kafka 使用 RocksDB 存储', recommended: true },
        { scenario: '日志存储', description: '数据库 WAL', recommended: true }
      ]
    }
  },

  memcached: {
    id: 'memcached',
    name: 'Memcached',
    category: 'storage',
    subcategory: '键值存储',
    description: '纯内存键值缓存，简单高效，适合简单缓存场景',
    tagline: '纯内存缓存',
    version: '1.6',
    pros: ['简单', '内存效率高', '高性能', '低延迟'],
    cons: ['无持久化', '不支持集群', '数据类型单一'],
    bestFor: ['简单缓存', '会话缓存', '页面缓存'],
    notFor: ['需要持久化', '复杂数据结构', '分布式缓存'],
    learningCurve: 'beginner',
    ecosystemScore: 85,
    popularity: { githubStars: 14000 },
    companyUsers: ['Facebook', 'Wikipedia', 'YouTube', 'Twitter'],
    createdYear: 2003,
    maintainedBy: 'Memcached Project',
    officialUrl: 'https://memcached.org',
    githubUrl: 'https://github.com/memcached/memcached',
    documentationUrl: 'https://github.com/memcached/memcached/wiki',
    alternatives: ['redis', 'rocksdb'],
    scores: {
      popularity: 80, maintenance: 75, ecosystem: 85, learningCurve: 90, enterpriseAdoption: 85,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '纯内存', description: '数据存储在内存，极低延迟。' },
        { title: '简单', description: '基于 slab 的内存管理，简单高效。' },
        { title: '高性能', description: '多线程，支持高并发。' },
        { title: '分布式', description: '客户端实现分布，一致性哈希。' }
      ],
      resources: [
        { type: 'official', title: 'Memcached 文档', url: 'https://github.com/memcached/memcached/wiki', description: '官方文档' }
      ],
      bestPractices: [
        { category: '使用', items: ['避免大 value', '设置合理过期时间', '监控内存使用'] }
      ],
      comparisons: [
        { techId: 'redis', techName: 'Redis', strengths: ['数据结构丰富', '持久化支持'], weaknesses: ['更复杂'], whenToChoose: '需要复杂功能时' }
      ],
      useCases: [
        { scenario: '页面缓存', description: 'HTML 片段缓存', recommended: true },
        { scenario: '会话缓存', description: '分布式会话存储', recommended: true }
      ]
    }
  },

  // ----- 时序数据库 (timeseries) -----
  influxdb: {
    id: 'influxdb',
    name: 'InfluxDB',
    category: 'storage',
    subcategory: '时序数据',
    description: '时序数据库，专为监控和 IoT 场景优化，高写入性能',
    tagline: '时序数据库',
    version: '2.7',
    pros: ['时序优化', '高写入', 'InfluxQL/Flux', '可视化'],
    cons: ['v2 版本变化大', '学习曲线', 'License 变更'],
    bestFor: ['监控指标', 'IoT 数据', '应用性能监控'],
    notFor: ['通用存储', '需要复杂关联'],
    learningCurve: 'beginner',
    ecosystemScore: 80,
    popularity: { githubStars: 28000 },
    companyUsers: ['IBM', 'Cisco', 'Siemens', 'Bloomberg'],
    createdYear: 2013,
    maintainedBy: 'InfluxData',
    officialUrl: 'https://www.influxdata.com',
    githubUrl: 'https://github.com/influxdata/influxdb',
    documentationUrl: 'https://docs.influxdata.com/',
    alternatives: ['timescale', 'prometheus'],
    scores: {
      popularity: 80, maintenance: 75, ecosystem: 80, learningCurve: 75, enterpriseAdoption: 72,
      total: 77, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '时序数据模型', description: 'Tag、Field、Timestamp，优化的时序存储。' },
        { title: '高写入', description: '支持百万级数据点每秒写入。' },
        { title: 'Downsampling', description: '自动数据聚合，减少存储。' },
        { title: 'Flux 语言', description: '强大的数据处理脚本语言。' }
      ],
      resources: [
        { type: 'official', title: 'InfluxDB 文档', url: 'https://docs.influxdata.com/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['避免高基数 tag', '合理设计 retention policy', '使用 TSI 索引'] }
      ],
      comparisons: [
        { techId: 'timescale', techName: 'TimescaleDB', strengths: ['SQL 支持', 'PostgreSQL 生态'], weaknesses: ['写入性能低'], whenToChoose: '需要 SQL 时' }
      ],
      useCases: [
        { scenario: '监控', description: 'APM、系统监控', recommended: true },
        { scenario: 'IoT', description: '传感器数据采集', recommended: true }
      ]
    }
  },

  timescale: {
    id: 'timescale',
    name: 'TimescaleDB',
    category: 'storage',
    subcategory: '时序数据',
    description: '基于 PostgreSQL 的时序数据库，结合关系型和时序特性',
    tagline: 'PostgreSQL 时序扩展',
    version: '2.14',
    pros: ['SQL 支持', 'PostgreSQL 兼容', '压缩率高', '生态丰富'],
    cons: ['写入性能不如专用时序库', '扩展性有限'],
    bestFor: ['时序+关系混合', '需要 SQL 的时序分析'],
    notFor: ['超高写入场景', '需要强扩展'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 22000 },
    companyUsers: ['AWS', 'Comcast', 'Booz Allen Hamilton'],
    createdYear: 2017,
    maintainedBy: 'Timescale Inc.',
    officialUrl: 'https://www.timescale.com',
    githubUrl: 'https://github.com/timescale/timescaledb',
    documentationUrl: 'https://docs.timescale.com/',
    alternatives: ['influxdb', 'clickhouse'],
    scores: {
      popularity: 75, maintenance: 82, ecosystem: 75, learningCurve: 80, enterpriseAdoption: 68,
      total: 76, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'Hypertables', description: '自动分区的时间序列表。' },
        { title: 'Compression', description: '高压缩率，存储成本降低 90%。' },
        { title: 'Continuous Aggregates', description: '自动物化视图，预聚合。' },
        { title: 'PostgreSQL 兼容', description: '完全兼容 PostgreSQL 协议和语法。' }
      ],
      resources: [
        { type: 'official', title: 'TimescaleDB 文档', url: 'https://docs.timescale.com/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '配置', items: ['启用压缩', '合理设置 chunk 时间', '使用 continuous aggregate'] }
      ],
      comparisons: [
        { techId: 'influxdb', techName: 'InfluxDB', strengths: ['专用时序', '高写入'], weaknesses: ['SQL 支持差'], whenToChoose: '需要高写入时' }
      ],
      useCases: [
        { scenario: '金融数据', description: '股票、交易数据存储分析', recommended: true },
        { scenario: 'DevOps 监控', description: '服务器指标存储', recommended: true }
      ]
    }
  },

  prometheus: {
    id: 'prometheus',
    name: 'Prometheus',
    category: 'storage',
    subcategory: '时序数据',
    description: '云原生时序数据库，Pull 模式采集，Kubernetes 原生监控事实标准',
    tagline: '云原生监控时序数据库',
    version: '2.50',
    pros: ['云原生', 'Pull 模式', 'K8s 原生', '强大查询'],
    cons: ['长期存储弱', '不支持集群', '单向数据流'],
    bestFor: ['监控告警', 'Kubernetes 监控', '应用指标'],
    notFor: ['长期存储', '跨数据中心', '复杂分析'],
    learningCurve: 'beginner',
    ecosystemScore: 92,
    popularity: { githubStars: 48000 },
    companyUsers: ['Google', 'SoundCloud', 'Docker', 'CNCF'],
    createdYear: 2012,
    maintainedBy: 'CNCF',
    officialUrl: 'https://prometheus.io',
    githubUrl: 'https://github.com/prometheus/prometheus',
    documentationUrl: 'https://prometheus.io/docs/',
    alternatives: ['influxdb', 'timescale'],
    scores: {
      popularity: 92, maintenance: 88, ecosystem: 92, learningCurve: 80, enterpriseAdoption: 95,
      total: 90, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'Pull 模式', description: '服务端主动采集，简化配置。' },
        { title: '时序数据', description: '优化的时序存储，支持高效查询。' },
        { title: 'PromQL', description: '强大的时序查询语言。' },
        { title: 'Kubernetes 原生', description: '自动发现 K8s 服务和 pod。' }
      ],
      resources: [
        { type: 'official', title: 'Prometheus 文档', url: 'https://prometheus.io/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '部署', items: ['使用 Prometheus Operator', '配置合理的 scrape interval', '使用远程写入'] }
      ],
      comparisons: [
        { techId: 'influxdb', techName: 'InfluxDB', strengths: ['支持远程写入', '长期存储'], weaknesses: ['不是 K8s 原生'], whenToChoose: '需要云原生监控时' }
      ],
      useCases: [
        { scenario: 'Kubernetes 监控', description: '集群和应用监控', recommended: true },
        { scenario: '应用性能', description: 'APM 指标采集', recommended: true }
      ]
    }
  },

  // ----- 向量数据库 (vector) -----
  milvus: {
    id: 'milvus',
    name: 'Milvus',
    category: 'storage',
    subcategory: '向量数据库',
    description: '开源向量数据库，支持十亿级向量检索，AI 应用首选',
    tagline: '开源向量数据库',
    version: '2.4',
    pros: ['高性能检索', '十亿级支持', '多索引类型', '云原生'],
    cons: ['运维复杂', '资源消耗大', '生态仍在完善'],
    bestFor: ['AI 检索', '相似度搜索', 'RAG 应用'],
    notFor: ['简单 KV', '需要强事务'],
    learningCurve: 'intermediate',
    ecosystemScore: 78,
    popularity: { githubStars: 30000 },
    companyUsers: ['NVIDIA', 'Tencent', 'ByteDance', '小米'],
    createdYear: 2019,
    maintainedBy: 'Zilliz',
    officialUrl: 'https://milvus.io',
    githubUrl: 'https://github.com/milvus-io/milvus',
    documentationUrl: 'https://milvus.io/docs/',
    alternatives: ['qdrant', 'weaviate'],
    scores: {
      popularity: 82, maintenance: 85, ecosystem: 78, learningCurve: 65, enterpriseAdoption: 72,
      total: 79, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '向量索引', description: '支持 IVF、HNSW、DiskANN 等多种索引。' },
        { title: '分布式', description: '水平扩展，支持海量向量。' },
        { title: '混合检索', description: '同时支持向量和标量过滤。' },
        { title: '多语言 SDK', description: 'Python、Go、Java 等多语言支持。' }
      ],
      resources: [
        { type: 'official', title: 'Milvus 文档', url: 'https://milvus.io/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['选择合适索引类型', '合理配置 nlist', '批处理写入'] }
      ],
      comparisons: [
        { techId: 'qdrant', techName: 'Qdrant', strengths: ['Rust 实现', '性能好'], weaknesses: ['社区较小'], whenToChoose: '需要高性能时' }
      ],
      useCases: [
        { scenario: 'RAG', description: '检索增强生成', recommended: true },
        { scenario: '以图搜图', description: '商品、人物检索', recommended: true },
        { scenario: '推荐系统', description: '相似 item 推荐', recommended: true }
      ]
    }
  },

  qdrant: {
    id: 'qdrant',
    name: 'Qdrant',
    category: 'storage',
    subcategory: '向量数据库',
    description: '高性能向量数据库，Rust 实现，支持混合检索和生产级部署',
    tagline: '高性能向量数据库',
    version: '1.7',
    pros: ['高性能', 'Rust 实现', '混合检索', '生产级'],
    cons: ['社区较小', '生态较新', '学习资源少'],
    bestFor: ['RAG 应用', '相似度搜索', '生产部署'],
    notFor: ['简单场景', '需要图形界面'],
    learningCurve: 'intermediate',
    ecosystemScore: 70,
    popularity: { githubStars: 18000 },
    companyUsers: ['Qdrant Inc.', 'Neural Stack', 'Various AI startups'],
    createdYear: 2021,
    maintainedBy: 'Qdrant Inc.',
    officialUrl: 'https://qdrant.tech',
    githubUrl: 'https://github.com/qdrant/qdrant',
    documentationUrl: 'https://qdrant.tech/documentation/',
    alternatives: ['milvus', 'weaviate'],
    scores: {
      popularity: 78, maintenance: 82, ecosystem: 70, learningCurve: 70, enterpriseAdoption: 65,
      total: 74, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'HNSW', description: '高级 HNSW 实现，高召回率。' },
        { title: '混合检索', description: '向量+标量过滤，灵活性强。' },
        { title: 'Rust 实现', description: '内存安全，高性能。' },
        { title: '生产级', description: '支持分布式部署，高可用。' }
      ],
      resources: [
        { type: 'official', title: 'Qdrant 文档', url: 'https://qdrant.tech/documentation/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['选择合适的向量维度', '配置合理的 HNSW 参数', '使用量化优化'] }
      ],
      comparisons: [
        { techId: 'milvus', techName: 'Milvus', strengths: ['社区成熟', '功能全面'], weaknesses: ['资源消耗大'], whenToChoose: '需要大规模部署时' }
      ],
      useCases: [
        { scenario: 'RAG', description: '检索增强生成', recommended: true },
        { scenario: '语义搜索', description: '自然语言搜索', recommended: true }
      ]
    }
  },

  weaviate: {
    id: 'weaviate',
    name: 'Weaviate',
    category: 'storage',
    subcategory: '向量数据库',
    description: '向量搜索引擎，GraphQL API，原生支持多种向量化模型',
    tagline: '向量搜索引擎',
    version: '1.22',
    pros: ['GraphQL API', '多模型支持', '内置向量化', '实时索引'],
    cons: ['资源消耗大', '社区较小', '学习曲线'],
    bestFor: ['语义搜索', 'RAG 应用', '多模态搜索'],
    notFor: ['简单 KV', '需要轻量级方案'],
    learningCurve: 'intermediate',
    ecosystemScore: 68,
    popularity: { githubStars: 15000 },
    companyUsers: ['Weaviate Inc.', 'Various AI companies'],
    createdYear: 2019,
    maintainedBy: 'Weaviate Inc.',
    officialUrl: 'https://weaviate.io',
    githubUrl: 'https://github.com/weaviate/weaviate',
    documentationUrl: 'https://weaviate.io/developers/weaviate/',
    alternatives: ['milvus', 'qdrant'],
    scores: {
      popularity: 72, maintenance: 78, ecosystem: 68, learningCurve: 65, enterpriseAdoption: 62,
      total: 70, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'GraphQL API', description: '灵活查询，强大的过滤能力。' },
        { title: '内置向量化', description: '支持多种 embedding 模型。' },
        { title: '实时索引', description: '数据变更实时更新索引。' },
        { title: '多模态', description: '支持文本、图像、视频等多种数据。' }
      ],
      resources: [
        { type: 'official', title: 'Weaviate 文档', url: 'https://weaviate.io/developers/weaviate/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '使用', items: ['选择合适的向量化模型', '合理设计 schema', '使用 hybrid 搜索'] }
      ],
      comparisons: [
        { techId: 'milvus', techName: 'Milvus', strengths: ['大规模支持', '社区成熟'], weaknesses: ['需要外部向量化'], whenToChoose: '需要大规模时' }
      ],
      useCases: [
        { scenario: '语义搜索', description: '自然语言查询', recommended: true },
        { scenario: '多模态搜索', description: '以图搜图、以文搜视频', recommended: true }
      ]
    }
  },

  pinecone: {
    id: 'pinecone',
    name: 'Pinecone',
    category: 'storage',
    subcategory: '向量数据库',
    description: '完全托管的向量数据库，无需运维，支持十亿级向量规模',
    tagline: '完全托管向量数据库',
    version: '2024',
    pros: ['完全托管', '无需运维', '水平扩展', '高可用'],
    cons: ['厂商锁定', '成本高', '灵活性差'],
    bestFor: ['企业级 RAG', '大规模向量搜索', '快速上线'],
    notFor: ['多云部署', '预算敏感', '需要开源'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 0 },
    companyUsers: ['Pinecone Inc.', 'Various enterprises'],
    createdYear: 2019,
    maintainedBy: 'Pinecone Inc.',
    officialUrl: 'https://www.pinecone.io',
    githubUrl: '',
    documentationUrl: 'https://docs.pinecone.io/',
    alternatives: ['milvus', 'qdrant'],
    scores: {
      popularity: 80, maintenance: 85, ecosystem: 75, learningCurve: 90, enterpriseAdoption: 78,
      total: 80, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '完全托管', description: '无需管理基础设施。' },
        { title: 'Serverless', description: '按使用付费，无需容量规划。' },
        { title: '水平扩展', description: '支持十亿级向量。' },
        { title: '高可用', description: '内置冗余和故障恢复。' }
      ],
      resources: [
        { type: 'official', title: 'Pinecone 文档', url: 'https://docs.pinecone.io/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '使用', items: ['选择合适的索引类型', '合理设计 namespace', '使用元数据过滤'] }
      ],
      comparisons: [
        { techId: 'milvus', techName: 'Milvus', strengths: ['开源', '灵活性高'], weaknesses: ['需要自己运维'], whenToChoose: '需要开源或自定义时' }
      ],
      useCases: [
        { scenario: '企业 RAG', description: '检索增强生成', recommended: true },
        { scenario: '语义搜索', description: '自然语言搜索', recommended: true }
      ]
    }
  },

  // ----- 图数据库 (graph) -----
  neo4j: {
    id: 'neo4j',
    name: 'Neo4j',
    category: 'storage',
    subcategory: '图数据库',
    description: '属性图模型图数据库，强大的图遍历能力，社交和推荐场景',
    tagline: '属性图数据库',
    version: '5.x',
    pros: ['图遍历快', 'Cypher 查询', '成熟稳定', '生态完善'],
    cons: ['分布式支持有限', '资源消耗大', '扩展性一般'],
    bestFor: ['社交网络', '知识图谱', '推荐系统'],
    notFor: ['简单 KV', '超大规模数据'],
    learningCurve: 'intermediate',
    ecosystemScore: 82,
    popularity: { githubStars: 15000 },
    companyUsers: ['Microsoft', 'Airbnb', 'eBay', 'IBM'],
    createdYear: 2007,
    maintainedBy: 'Neo4j Inc.',
    officialUrl: 'https://neo4j.com',
    githubUrl: 'https://github.com/neo4j/neo4j',
    documentationUrl: 'https://neo4j.com/docs/',
    alternatives: ['tugraph', 'nebula'],
    scores: {
      popularity: 80, maintenance: 82, ecosystem: 82, learningCurve: 70, enterpriseAdoption: 85,
      total: 80, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '属性图', description: '节点和边都可带属性，灵活建模。' },
        { title: 'Cypher', description: '声明式图查询语言，表达力强。' },
        { title: 'ACID 事务', description: '强一致性保证。' },
        { title: '图算法', description: '内置 PageRank、社群发现等算法。' }
      ],
      resources: [
        { type: 'official', title: 'Neo4j 文档', url: 'https://neo4j.com/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['避免过深关系', '合理使用标签', '创建索引加速查询'] }
      ],
      comparisons: [
        { techId: 'tugraph', techName: 'TuGraph', strengths: ['高性能', '国内支持好'], weaknesses: ['生态较小'], whenToChoose: '国内项目' }
      ],
      useCases: [
        { scenario: '社交网络', description: '好友推荐、关系分析', recommended: true },
        { scenario: '知识图谱', description: '企业知识管理', recommended: true },
        { scenario: '反欺诈', description: '关联分析检测欺诈', recommended: true }
      ]
    }
  },

  tugraph: {
    id: 'tugraph',
    name: 'TuGraph',
    category: 'storage',
    subcategory: '图数据库',
    description: '蚂蚁集团开源的高性能图数据库，支撑支付宝等核心业务',
    tagline: '高性能图数据库',
    version: '4.x',
    pros: ['高性能', '水平扩展', '兼容 Cypher', '国内支持'],
    cons: ['社区较小', '文档不够完善', '国际生态有限'],
    bestFor: ['金融风控', '社交分析', '大规模图计算'],
    notFor: ['简单场景', '需要国际化生态'],
    learningCurve: 'intermediate',
    ecosystemScore: 65,
    popularity: { githubStars: 8000 },
    companyUsers: ['Ant Group', 'Alibaba', 'Tencent'],
    createdYear: 2018,
    maintainedBy: 'Ant Group',
    officialUrl: 'https://www.tugraph.org',
    githubUrl: 'https://github.com/TuGraph-family/tugraph',
    documentationUrl: 'https://tugraph.readthedocs.io/',
    alternatives: ['neo4j', 'nebula'],
    scores: {
      popularity: 65, maintenance: 78, ecosystem: 65, learningCurve: 65, enterpriseAdoption: 70,
      total: 68, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '高性能', description: '支持每秒百万级边遍历。' },
        { title: '分布式', description: '水平扩展，支持万亿级边。' },
        { title: '兼容 Cypher', description: '兼容 openCypher 协议。' },
        { title: '可视化', description: '内置图可视化工具。' }
      ],
      resources: [
        { type: 'official', title: 'TuGraph 文档', url: 'https://tugraph.readthedocs.io/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['合理设计顶点类型', '避免超级节点', '使用属性索引'] }
      ],
      comparisons: [
        { techId: 'neo4j', techName: 'Neo4j', strengths: ['生态成熟', '社区大'], weaknesses: ['性能一般'], whenToChoose: '需要国际化时' }
      ],
      useCases: [
        { scenario: '金融风控', description: '实时风险识别', recommended: true },
        { scenario: '反洗钱', description: '资金链路分析', recommended: true }
      ]
    }
  },

  nebula: {
    id: 'nebula',
    name: 'Nebula Graph',
    category: 'storage',
    subcategory: '图数据库',
    description: '分布式图数据库，支持 nGQL 查询语言，高性能万亿级边遍历',
    tagline: '分布式图数据库',
    version: '3.8',
    pros: ['高性能', '水平扩展', '支持万亿级边', '国内生态'],
    cons: ['社区较小', '学习资源有限', '运维复杂'],
    bestFor: ['大规模图计算', '社交分析', '金融风控'],
    notFor: ['简单场景', '需要国际化生态'],
    learningCurve: 'advanced',
    ecosystemScore: 62,
    popularity: { githubStars: 12000 },
    companyUsers: ['Vesoft', 'Tencent', 'Alibaba', 'Xiaomi'],
    createdYear: 2019,
    maintainedBy: 'Vesoft',
    officialUrl: 'https://nebula-graph.io',
    githubUrl: 'https://github.com/vesoft-inc/nebula',
    documentationUrl: 'https://docs.nebula-graph.io/',
    alternatives: ['neo4j', 'tugraph'],
    scores: {
      popularity: 65, maintenance: 75, ecosystem: 62, learningCurve: 55, enterpriseAdoption: 60,
      total: 64, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '分布式架构', description: '水平扩展，支持万亿级边。' },
        { title: 'nGQL', description: '类 SQL 的图查询语言。' },
        { title: '高写入', description: '高速图数据写入。' },
        { title: '多语言 SDK', description: 'Python、Go、Java 等多语言支持。' }
      ],
      resources: [
        { type: 'official', title: 'Nebula 文档', url: 'https://docs.nebula-graph.io/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '建模', items: ['合理设计 tag', '使用索引优化查询', '避免热点'] }
      ],
      comparisons: [
        { techId: 'neo4j', techName: 'Neo4j', strengths: ['生态成熟', '社区大'], weaknesses: ['性能一般'], whenToChoose: '需要国际化时' }
      ],
      useCases: [
        { scenario: '社交网络', description: '好友推荐、关系分析', recommended: true },
        { scenario: '金融风控', description: '关联分析检测欺诈', recommended: true }
      ]
    }
  },

  janusgraph: {
    id: 'janusgraph',
    name: 'JanusGraph',
    category: 'storage',
    subcategory: '图数据库',
    description: 'Apache 顶级项目的分布式图数据库，支持多种后端存储',
    tagline: 'Apache 分布式图数据库',
    version: '1.0',
    pros: ['Apache 顶级项目', '多后端支持', '水平扩展', '生态完善'],
    cons: ['运维复杂', '学习曲线陡峭', '版本更新慢'],
    bestFor: ['大规模图存储', '需要灵活后端', '企业级应用'],
    notFor: ['简单场景', '需要快速上手'],
    learningCurve: 'advanced',
    ecosystemScore: 65,
    popularity: { githubStars: 8000 },
    companyUsers: ['JanusGraph Community', 'Google', 'IBM'],
    createdYear: 2017,
    maintainedBy: 'Apache Software Foundation',
    officialUrl: 'https://janusgraph.org',
    githubUrl: 'https://github.com/JanusGraph/janusgraph',
    documentationUrl: 'https://docs.janusgraph.org/',
    alternatives: ['neo4j', 'nebula'],
    scores: {
      popularity: 62, maintenance: 68, ecosystem: 65, learningCurve: 50, enterpriseAdoption: 65,
      total: 62, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '多后端', description: '支持 Cassandra、HBase、BerkeleyDB。' },
        { title: 'Gremlin', description: '使用 Apache TinkerPop Gremlin 查询语言。' },
        { title: '水平扩展', description: '分布式架构，支持大规模图。' },
        { title: '索引', description: '支持全文索引、地理空间索引。' }
      ],
      resources: [
        { type: 'official', title: 'JanusGraph 文档', url: 'https://docs.janusgraph.org/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '部署', items: ['选择合适的后端存储', '配置合理的索引', '使用 JanusGraph Manager'] }
      ],
      comparisons: [
        { techId: 'neo4j', techName: 'Neo4j', strengths: ['简单易用', '生态成熟'], weaknesses: ['扩展性差'], whenToChoose: '需要简单部署时' }
      ],
      useCases: [
        { scenario: '知识图谱', description: '企业知识管理', recommended: true },
        { scenario: '反欺诈', description: '关联分析检测欺诈', recommended: true }
      ]
    }
  },

  // ----- 对象存储 (object-storage) -----
  minio: {
    id: 'minio',
    name: 'MinIO',
    category: 'storage',
    subcategory: '对象存储',
    description: 'S3 兼容对象存储，Kubernetes 原生，高性能分布式存储',
    tagline: 'S3 兼容对象存储',
    version: 'RELEASE.2024',
    pros: ['S3 兼容', '高性能', 'Kubernetes 原生', '简单部署'],
    cons: ['功能比 AWS S3 少', '文档有限', '需要自己运维'],
    bestFor: ['私有云存储', 'AI/ML 数据湖', 'MinIO 替代方案'],
    notFor: ['需要高级 S3 功能', '完全托管'],
    learningCurve: 'beginner',
    ecosystemScore: 75,
    popularity: { githubStars: 45000 },
    companyUsers: ['ByteDance', 'Tencent', 'Alibaba', 'IBM'],
    createdYear: 2015,
    maintainedBy: 'MinIO Inc.',
    officialUrl: 'https://min.io',
    githubUrl: 'https://github.com/minio/minio',
    documentationUrl: 'https://min.io/docs/',
    alternatives: ['ceph', 'aws-s3'],
    scores: {
      popularity: 85, maintenance: 88, ecosystem: 75, learningCurve: 80, enterpriseAdoption: 78,
      total: 82, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: 'S3 兼容', description: '兼容 S3 API，现有应用零改动。' },
        { title: '高性能', description: '高速读写，NVMe 优化。' },
        { title: 'Kubernetes 原生', description: 'Operator 部署，Operator-Lifecycle Manager。' },
        { title: '纠删码', description: '高可用，分布式恢复。' }
      ],
      resources: [
        { type: 'official', title: 'MinIO 文档', url: 'https://min.io/docs/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '部署', items: ['使用 Operator 部署', '配置纠删码模式', '使用 LoadBalancer'] }
      ],
      comparisons: [
        { techId: 'ceph', techName: 'Ceph', strengths: ['功能全面', '社区成熟'], weaknesses: ['复杂', '资源消耗大'], whenToChoose: '需要完整存储方案时' }
      ],
      useCases: [
        { scenario: 'AI 数据湖', description: '存储训练数据', recommended: true },
        { scenario: '备份归档', description: '冷数据存储', recommended: true },
        { scenario: '私有云存储', description: '替代公有云 S3', recommended: true }
      ]
    }
  },

  ceph: {
    id: 'ceph',
    name: 'Ceph',
    category: 'storage',
    subcategory: '对象存储',
    description: '统一存储系统，支持对象、块、文件三种接口，软件定义存储',
    tagline: '统一存储系统',
    version: '7.0',
    pros: ['统一存储', '软件定义', '水平扩展', '高可用'],
    cons: ['运维复杂', '学习曲线陡峭', '资源消耗大'],
    bestFor: ['软件定义存储', '超融合架构', '需要统一存储'],
    notFor: ['简单场景', '需要快速部署'],
    learningCurve: 'advanced',
    ecosystemScore: 75,
    popularity: { githubStars: 12000 },
    companyUsers: ['Red Hat', 'SUSE', 'Various enterprises'],
    createdYear: 2006,
    maintainedBy: 'Ceph Community',
    officialUrl: 'https://ceph.io',
    githubUrl: 'https://github.com/ceph/ceph',
    documentationUrl: 'https://docs.ceph.com/',
    alternatives: ['minio', 'aws-s3'],
    scores: {
      popularity: 78, maintenance: 80, ecosystem: 75, learningCurve: 50, enterpriseAdoption: 80,
      total: 75, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '统一存储', description: '对象、块、文件三种存储接口。' },
        { title: 'CRUSH', description: '智能数据分布算法，无需人工干预。' },
        { title: '高可用', description: '数据多副本，自动化故障恢复。' },
        { title: '软件定义', description: '通用硬件，降低成本。' }
      ],
      resources: [
        { type: 'official', title: 'Ceph 文档', url: 'https://docs.ceph.com/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '部署', items: ['使用 Cephadm 部署', '合理配置 PG', '使用 BlueStore'] }
      ],
      comparisons: [
        { techId: 'minio', techName: 'MinIO', strengths: ['简单', '高性能'], weaknesses: ['功能单一'], whenToChoose: '只需要对象存储时' }
      ],
      useCases: [
        { scenario: '软件定义存储', description: '替代传统 SAN', recommended: true },
        { scenario: '超融合', description: 'HCI 架构存储层', recommended: true }
      ]
    }
  },

  aws_s3: {
    id: 'aws-s3',
    name: 'AWS S3',
    category: 'storage',
    subcategory: '对象存储',
    description: '云对象存储事实标准，AWS 全托管，极高可用性和持久性',
    tagline: '云对象存储事实标准',
    version: '2024',
    pros: ['完全托管', '极高可用', '生态完善', '丰富功能'],
    cons: ['厂商锁定', 'egress 费用高', '成本复杂'],
    bestFor: ['云原生应用', '备份归档', '数据分析'],
    notFor: ['多云部署', '成本敏感', '需要开源'],
    learningCurve: 'beginner',
    ecosystemScore: 95,
    popularity: { githubStars: 0 },
    companyUsers: ['Amazon', 'AWS', 'Netflix', 'Airbnb'],
    createdYear: 2006,
    maintainedBy: 'Amazon Web Services',
    officialUrl: 'https://aws.amazon.com/s3/',
    githubUrl: '',
    documentationUrl: 'https://docs.aws.amazon.com/s3/',
    alternatives: ['minio', 'ceph'],
    scores: {
      popularity: 98, maintenance: 95, ecosystem: 95, learningCurve: 90, enterpriseAdoption: 98,
      total: 95, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '11 个 9 持久性', description: '99.999999999% 数据持久性。' },
        { title: '多种存储类', description: 'Standard、IA、Glacier 按需选择。' },
        { title: '生命周期', description: '自动数据迁移，降低成本。' },
        { title: '强大生态', description: 'Lambda、Athena、CloudFront 深度集成。' }
      ],
      resources: [
        { type: 'official', title: 'S3 文档', url: 'https://docs.aws.amazon.com/s3/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '使用', items: ['使用 lifecycle 策略', '启用版本控制', '使用 CloudFront CDN'] }
      ],
      comparisons: [
        { techId: 'minio', techName: 'MinIO', strengths: ['开源', '可私有部署'], weaknesses: ['没有 S3 的高级功能'], whenToChoose: '需要私有部署时' }
      ],
      useCases: [
        { scenario: '数据湖', description: '构建数据湖架构', recommended: true },
        { scenario: '备份归档', description: '冷数据归档到 Glacier', recommended: true }
      ]
    }
  },

  cloudflare_r2: {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'storage',
    subcategory: '对象存储',
    description: 'S3 兼容对象存储，零 egress 费用，Cloudflare 全球网络',
    tagline: 'S3 兼容零 egress 对象存储',
    version: '2024',
    pros: ['零 egress 费用', 'S3 兼容', '全球网络', '低成本'],
    cons: ['功能较新', '生态较小', '厂商锁定'],
    bestFor: ['需要全球分发', '成本敏感', 'S3 迁移'],
    notFor: ['需要高级 S3 功能', '企业级复杂需求'],
    learningCurve: 'beginner',
    ecosystemScore: 68,
    popularity: { githubStars: 0 },
    companyUsers: ['Cloudflare', 'Various startups'],
    createdYear: 2022,
    maintainedBy: 'Cloudflare',
    officialUrl: 'https://www.cloudflare.com/r2/',
    githubUrl: '',
    documentationUrl: 'https://developers.cloudflare.com/r2/',
    alternatives: ['minio', 'aws-s3'],
    scores: {
      popularity: 72, maintenance: 80, ecosystem: 68, learningCurve: 85, enterpriseAdoption: 55,
      total: 72, lastCalculated: '2025-02-15T10:00:00Z'
    },
    status: 'active',
    deepDive: {
      features: [
        { title: '零 egress', description: '数据流出完全免费。' },
        { title: 'S3 兼容', description: '使用 S3 SDK，迁移简单。' },
        { title: 'Workers 集成', description: '与 Cloudflare Workers 深度集成。' },
        { title: '全球网络', description: '使用 Cloudflare 全球 CDN。' }
      ],
      resources: [
        { type: 'official', title: 'R2 文档', url: 'https://developers.cloudflare.com/r2/', description: '官方文档' }
      ],
      bestPractices: [
        { category: '使用', items: ['使用 Workers 处理数据', '配置合理的缓存策略', '使用 Durable Objects 元数据'] }
      ],
      comparisons: [
        { techId: 'aws-s3', techName: 'AWS S3', strengths: ['生态成熟', '功能全面'], weaknesses: ['egress 费用高'], whenToChoose: '需要 AWS 生态时' }
      ],
      useCases: [
        { scenario: '静态网站', description: '托管静态资源和媒体', recommended: true },
        { scenario: '数据分发', description: '全球分发数据，免 egress', recommended: true }
      ]
    }
  },

  // ===== LLM算法 Technologies =====
  ...llmAlgorithmData,

  // ===== LLM应用 Technologies =====
  ...llmApplicationData,
}

// ============================================
// 数据访问函数
// ============================================

/** 获取所有技术 */
export function getAllTech(): TechDetail[] {
  return Object.values(techDatabase)
}

/** 根据 ID 获取技术详情 */
export function getTechById(id: string): TechDetail | undefined {
  return techDatabase[id]
}

/** 获取所有活跃技术（非归档） */
export function getActiveTech(): TechDetail[] {
  return Object.values(techDatabase).filter(tech => tech.status === 'active')
}

/** 获取所有归档技术 */
export function getArchivedTech(): TechDetail[] {
  return Object.values(techDatabase).filter(tech => tech.status === 'archived')
}

/** 根据分类获取技术 */
export function getTechByCategory(category: TechDetail['category']): TechDetail[] {
  return Object.values(techDatabase).filter(tech => 
    tech.category === category && tech.status === 'active'
  )
}

/** 根据子分类获取技术 */
export function getTechBySubcategory(subcategory: string): TechDetail[] {
  return Object.values(techDatabase).filter(tech => 
    tech.subcategory === subcategory && tech.status === 'active'
  )
}

/** 搜索技术 */
export function searchTech(query: string): TechDetail[] {
  const lowerQuery = query.toLowerCase()
  return Object.values(techDatabase).filter(tech => 
    tech.name.toLowerCase().includes(lowerQuery) ||
    tech.description.toLowerCase().includes(lowerQuery) ||
    tech.subcategory.toLowerCase().includes(lowerQuery)
  )
}

/** 获取分类列表 */
export function getCategories(): string[] {
  return [...new Set(Object.values(techDatabase).map(tech => tech.category))]
}

/** 获取子分类列表 */
export function getSubcategories(): string[] {
  return [...new Set(Object.values(techDatabase).map(tech => tech.subcategory))]
}

/** 按评分排序获取技术 */
export function getTechByScore(sortBy: 'popularity' | 'maintenance' | 'ecosystem' | 'learningCurve' | 'enterpriseAdoption' | 'total' = 'total', limit?: number): TechDetail[] {
  const sorted = Object.values(techDatabase)
    .filter(tech => tech.status === 'active')
    .sort((a, b) => (b.scores[sortBy] as number) - (a.scores[sortBy] as number))
  
  return limit ? sorted.slice(0, limit) : sorted
}

/** 获取推荐技术（评分前 N） */
export function getRecommendedTech(limit: number = 6): TechDetail[] {
  return getTechByScore('total', limit)
}

/** 获取归档原因文本 */
export function getArchiveReasonText(reason: ArchiveReason): string {
  const reasonMap: Record<ArchiveReason, string> = {
    low_popularity: '流行度较低',
    deprecated: '已停止维护',
    replaced: '被更好的技术替代',
    niche_use_case: '仅适用于特定场景'
  }
  return reasonMap[reason] || '其他原因'
}

// 默认导出
export default techDatabase
